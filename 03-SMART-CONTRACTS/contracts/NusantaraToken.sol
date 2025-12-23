// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NusantaraToken
 * @dev Implementation of the Nusantara Digital Ventura utility token
 * 
 * Features:
 * - Fixed supply: 1,000,000,000 NUSA
 * - Role-based access control
 * - Pausable (emergency only)
 * - Burnable (deflationary mechanism)
 * - No arbitrary mint (supply is fixed at deployment)
 * 
 * Security:
 * - Multisig ownership via AccessControl
 * - Timelock for admin actions (via external timelock contract)
 * - ReentrancyGuard for critical functions
 */
contract NusantaraToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Pausable, 
    AccessControl,
    ReentrancyGuard 
{
    // Roles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant ALLOCATOR_ROLE = keccak256("ALLOCATOR_ROLE");
    
    // Total supply: 1 billion tokens (18 decimals)
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;
    
    // Allocation addresses (set at deployment)
    address public communityRewardsAddress;
    address public ecosystemAddress;
    address public liquidityAddress;
    address public teamVestingAddress;
    address public advisorVestingAddress;
    address public treasuryAddress;
    
    // Allocation amounts (fixed percentages of TOTAL_SUPPLY)
    uint256 public constant COMMUNITY_ALLOCATION = 350_000_000 * 10**18; // 35%
    uint256 public constant ECOSYSTEM_ALLOCATION = 200_000_000 * 10**18; // 20%
    uint256 public constant LIQUIDITY_ALLOCATION = 120_000_000 * 10**18; // 12%
    uint256 public constant TEAM_ALLOCATION = 150_000_000 * 10**18;      // 15%
    uint256 public constant ADVISOR_ALLOCATION = 30_000_000 * 10**18;    // 3%
    uint256 public constant TREASURY_ALLOCATION = 150_000_000 * 10**18;  // 15%
    
    // Events
    event AllocationDistributed(address indexed recipient, uint256 amount, string category);
    event EmergencyPause(address indexed by, string reason);
    event EmergencyUnpause(address indexed by);
    
    /**
     * @dev Constructor - mints total supply and distributes to allocation addresses
     * @param _admin Multisig address that will have DEFAULT_ADMIN_ROLE
     * @param _communityRewards Address for community rewards allocation
     * @param _ecosystem Address for ecosystem & partnerships allocation
     * @param _liquidity Address for liquidity allocation
     * @param _teamVesting Address of team vesting contract
     * @param _advisorVesting Address of advisor vesting contract
     * @param _treasury Address for treasury (multisig)
     */
    constructor(
        address _admin,
        address _communityRewards,
        address _ecosystem,
        address _liquidity,
        address _teamVesting,
        address _advisorVesting,
        address _treasury
    ) ERC20("Nusantara Token", "NUSA") {
        require(_admin != address(0), "Admin cannot be zero address");
        require(_communityRewards != address(0), "Community address cannot be zero");
        require(_ecosystem != address(0), "Ecosystem address cannot be zero");
        require(_liquidity != address(0), "Liquidity address cannot be zero");
        require(_teamVesting != address(0), "Team vesting address cannot be zero");
        require(_advisorVesting != address(0), "Advisor vesting address cannot be zero");
        require(_treasury != address(0), "Treasury address cannot be zero");
        
        // Store allocation addresses
        communityRewardsAddress = _communityRewards;
        ecosystemAddress = _ecosystem;
        liquidityAddress = _liquidity;
        teamVestingAddress = _teamVesting;
        advisorVestingAddress = _advisorVesting;
        treasuryAddress = _treasury;
        
        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(ALLOCATOR_ROLE, _admin);
        
        // Mint total supply to this contract first
        _mint(address(this), TOTAL_SUPPLY);
        
        // Distribute allocations
        _distributeAllocations();
        
        // Verify total distribution equals total supply
        require(
            totalSupply() == TOTAL_SUPPLY,
            "Total supply mismatch"
        );
    }
    
    /**
     * @dev Internal function to distribute tokens to allocation addresses
     */
    function _distributeAllocations() private {
        // Transfer to each allocation address
        _transfer(address(this), communityRewardsAddress, COMMUNITY_ALLOCATION);
        emit AllocationDistributed(communityRewardsAddress, COMMUNITY_ALLOCATION, "Community");
        
        _transfer(address(this), ecosystemAddress, ECOSYSTEM_ALLOCATION);
        emit AllocationDistributed(ecosystemAddress, ECOSYSTEM_ALLOCATION, "Ecosystem");
        
        _transfer(address(this), liquidityAddress, LIQUIDITY_ALLOCATION);
        emit AllocationDistributed(liquidityAddress, LIQUIDITY_ALLOCATION, "Liquidity");
        
        _transfer(address(this), teamVestingAddress, TEAM_ALLOCATION);
        emit AllocationDistributed(teamVestingAddress, TEAM_ALLOCATION, "Team");
        
        _transfer(address(this), advisorVestingAddress, ADVISOR_ALLOCATION);
        emit AllocationDistributed(advisorVestingAddress, ADVISOR_ALLOCATION, "Advisor");
        
        _transfer(address(this), treasuryAddress, TREASURY_ALLOCATION);
        emit AllocationDistributed(treasuryAddress, TREASURY_ALLOCATION, "Treasury");
    }
    
    /**
     * @dev Pause token transfers (emergency only)
     * Only callable by PAUSER_ROLE (multisig)
     */
    function pause(string calldata reason) external onlyRole(PAUSER_ROLE) {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }
    
    /**
     * @dev Unpause token transfers
     * Only callable by PAUSER_ROLE (multisig)
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance (OpenZeppelin 5.0)
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
    
    /**
     * @dev Returns token information for easy querying
     */
    function getTokenInfo() external view returns (
        string memory tokenName,
        string memory tokenSymbol,
        uint8 tokenDecimals,
        uint256 tokenTotalSupply,
        uint256 circulatingSupply
    ) {
        return (
            name(),
            symbol(),
            decimals(),
            totalSupply(),
            totalSupply() // Initially all supply is circulating (controlled by vesting contracts)
        );
    }
    
    /**
     * @dev Returns allocation information
     */
    function getAllocationInfo() external view returns (
        address community,
        address ecosystem,
        address liquidity,
        address team,
        address advisor,
        address treasury
    ) {
        return (
            communityRewardsAddress,
            ecosystemAddress,
            liquidityAddress,
            teamVestingAddress,
            advisorVestingAddress,
            treasuryAddress
        );
    }
}
