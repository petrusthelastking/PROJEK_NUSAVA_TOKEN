// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenVesting
 * @dev Vesting contract for team and advisor token allocation
 * 
 * Features:
 * - Cliff period: no tokens released until cliff ends
 * - Linear vesting: tokens released linearly after cliff
 * - Multiple beneficiaries support
 * - Revocable (for team members who leave)
 * - Emergency withdrawal for owner (only unvested tokens)
 * 
 * Vesting Schedule:
 * - Team: 12-month cliff, 24-month linear (36 months total)
 * - Advisors: 6-month cliff, 18-month linear (24 months total)
 */
contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct VestingSchedule {
        uint256 totalAmount;        // Total tokens to be vested
        uint256 releasedAmount;     // Tokens already released
        uint256 startTime;          // Vesting start timestamp
        uint256 cliffDuration;      // Cliff period in seconds
        uint256 vestingDuration;    // Total vesting duration (after cliff)
        bool revocable;             // Can this vesting be revoked?
        bool revoked;               // Has this vesting been revoked?
    }
    
    // Token being vested
    IERC20 public immutable token;
    
    // Beneficiary address => VestingSchedule
    mapping(address => VestingSchedule) public vestingSchedules;
    
    // Array of all beneficiaries (for easy iteration)
    address[] public beneficiaries;
    
    // Total tokens vested across all schedules
    uint256 public totalVested;
    
    // Total tokens released across all schedules
    uint256 public totalReleased;
    
    // Events
    event VestingScheduleCreated(
        address indexed beneficiary,
        uint256 amount,
        uint256 startTime,
        uint256 cliffDuration,
        uint256 vestingDuration
    );
    event TokensReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 unvestedAmount);
    
    /**
     * @dev Constructor
     * @param _token Address of the token being vested
     */
    constructor(IERC20 _token) Ownable(msg.sender) {
        require(address(_token) != address(0), "Token cannot be zero address");
        token = _token;
    }
    
    /**
     * @dev Create a vesting schedule for a beneficiary
     * @param beneficiary Address of the beneficiary
     * @param amount Total amount of tokens to vest
     * @param cliffDuration Duration of cliff period in seconds
     * @param vestingDuration Total vesting duration (after cliff) in seconds
     * @param revocable Whether this vesting can be revoked
     */
    function createVestingSchedule(
        address beneficiary,
        uint256 amount,
        uint256 cliffDuration,
        uint256 vestingDuration,
        bool revocable
    ) external onlyOwner {
        require(beneficiary != address(0), "Beneficiary cannot be zero address");
        require(amount > 0, "Amount must be greater than 0");
        require(vestingSchedules[beneficiary].totalAmount == 0, "Vesting already exists");
        require(vestingDuration > 0, "Vesting duration must be greater than 0");
        
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: cliffDuration,
            vestingDuration: vestingDuration,
            revocable: revocable,
            revoked: false
        });
        
        beneficiaries.push(beneficiary);
        totalVested += amount;
        
        emit VestingScheduleCreated(
            beneficiary,
            amount,
            block.timestamp,
            cliffDuration,
            vestingDuration
        );
    }
    
    /**
     * @dev Release vested tokens to beneficiary
     * @param beneficiary Address of the beneficiary
     */
    function release(address beneficiary) external nonReentrant {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.totalAmount > 0, "No vesting schedule found");
        require(!schedule.revoked, "Vesting has been revoked");
        
        uint256 releasable = _releasableAmount(beneficiary);
        require(releasable > 0, "No tokens to release");
        
        schedule.releasedAmount += releasable;
        totalReleased += releasable;
        
        token.safeTransfer(beneficiary, releasable);
        
        emit TokensReleased(beneficiary, releasable);
    }
    
    /**
     * @dev Revoke vesting schedule (only if revocable)
     * @param beneficiary Address of the beneficiary
     */
    function revoke(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.totalAmount > 0, "No vesting schedule found");
        require(schedule.revocable, "Vesting is not revocable");
        require(!schedule.revoked, "Vesting already revoked");
        
        uint256 releasable = _releasableAmount(beneficiary);
        if (releasable > 0) {
            schedule.releasedAmount += releasable;
            totalReleased += releasable;
            token.safeTransfer(beneficiary, releasable);
        }
        
        uint256 unvested = schedule.totalAmount - schedule.releasedAmount;
        
        schedule.revoked = true;
        totalVested -= unvested;
        
        // Return unvested tokens to owner (treasury)
        if (unvested > 0) {
            token.safeTransfer(owner(), unvested);
        }
        
        emit VestingRevoked(beneficiary, unvested);
    }
    
    /**
     * @dev Calculate releasable amount for a beneficiary
     * @param beneficiary Address of the beneficiary
     */
    function releasableAmount(address beneficiary) external view returns (uint256) {
        return _releasableAmount(beneficiary);
    }
    
    /**
     * @dev Internal function to calculate releasable amount
     */
    function _releasableAmount(address beneficiary) private view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        if (schedule.totalAmount == 0 || schedule.revoked) {
            return 0;
        }
        
        return _vestedAmount(beneficiary) - schedule.releasedAmount;
    }
    
    /**
     * @dev Calculate vested amount (total unlocked so far)
     * @param beneficiary Address of the beneficiary
     */
    function vestedAmount(address beneficiary) external view returns (uint256) {
        return _vestedAmount(beneficiary);
    }
    
    /**
     * @dev Internal function to calculate vested amount
     */
    function _vestedAmount(address beneficiary) private view returns (uint256) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        if (schedule.totalAmount == 0) {
            return 0;
        }
        
        // If still in cliff period, nothing is vested
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        // If past the vesting duration, everything is vested
        if (block.timestamp >= schedule.startTime + schedule.cliffDuration + schedule.vestingDuration) {
            return schedule.totalAmount;
        }
        
        // Linear vesting after cliff
        uint256 timeAfterCliff = block.timestamp - (schedule.startTime + schedule.cliffDuration);
        uint256 vested = (schedule.totalAmount * timeAfterCliff) / schedule.vestingDuration;
        
        return vested;
    }
    
    /**
     * @dev Get vesting schedule information
     * @param beneficiary Address of the beneficiary
     */
    function getVestingSchedule(address beneficiary) external view returns (
        uint256 totalAmount,
        uint256 releasedAmount,
        uint256 vested,
        uint256 releasable,
        uint256 startTime,
        uint256 cliffEnd,
        uint256 vestingEnd,
        bool revocable,
        bool revoked
    ) {
        VestingSchedule memory schedule = vestingSchedules[beneficiary];
        
        return (
            schedule.totalAmount,
            schedule.releasedAmount,
            _vestedAmount(beneficiary),
            _releasableAmount(beneficiary),
            schedule.startTime,
            schedule.startTime + schedule.cliffDuration,
            schedule.startTime + schedule.cliffDuration + schedule.vestingDuration,
            schedule.revocable,
            schedule.revoked
        );
    }
    
    /**
     * @dev Get total number of beneficiaries
     */
    function getBeneficiariesCount() external view returns (uint256) {
        return beneficiaries.length;
    }
    
    /**
     * @dev Get beneficiary address by index
     */
    function getBeneficiary(uint256 index) external view returns (address) {
        require(index < beneficiaries.length, "Index out of bounds");
        return beneficiaries[index];
    }
    
    /**
     * @dev Emergency withdrawal of tokens (only owner, only non-vested tokens)
     * This should only be used if there's excess tokens that were mistakenly sent
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        uint256 lockedAmount = totalVested - totalReleased;
        
        require(balance > lockedAmount, "No excess tokens to withdraw");
        
        uint256 excess = balance - lockedAmount;
        token.safeTransfer(owner(), excess);
    }
}
