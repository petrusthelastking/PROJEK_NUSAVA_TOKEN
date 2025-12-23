// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title AirdropDistributor
 * @dev Merkle-tree based airdrop distributor with anti-sybil features
 * 
 * Features:
 * - Merkle proof verification for efficient gas usage
 * - Multiple campaign support
 * - Vesting option for large airdrops
 * - Claim window (start and end time)
 * - Anti-sybil: one claim per address per campaign
 * - Emergency pause/unpause
 * - Unclaimed token recovery after campaign ends
 */
contract AirdropDistributor is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    
    struct Campaign {
        bytes32 merkleRoot;         // Merkle root for this campaign
        uint256 totalAmount;        // Total tokens allocated
        uint256 claimedAmount;      // Tokens already claimed
        uint256 startTime;          // Campaign start time
        uint256 endTime;            // Campaign end time
        uint256 vestingDuration;    // Vesting duration (0 = instant claim)
        bool paused;                // Is campaign paused?
        bool finalized;             // Has campaign been finalized?
    }
    
    struct ClaimInfo {
        uint256 amount;             // Amount claimed
        uint256 claimTime;          // When was it claimed
        uint256 vestedAmount;       // Amount vested so far
    }
    
    // Token being distributed
    IERC20 public immutable token;
    
    // Campaign ID => Campaign info
    mapping(uint256 => Campaign) public campaigns;
    
    // Campaign ID => Address => ClaimInfo
    mapping(uint256 => mapping(address => ClaimInfo)) public claims;
    
    // Current campaign ID counter
    uint256 public campaignCounter;
    
    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime
    );
    event TokensClaimed(
        uint256 indexed campaignId,
        address indexed claimer,
        uint256 amount
    );
    event VestedTokensReleased(
        uint256 indexed campaignId,
        address indexed claimer,
        uint256 amount
    );
    event CampaignPaused(uint256 indexed campaignId);
    event CampaignUnpaused(uint256 indexed campaignId);
    event CampaignFinalized(uint256 indexed campaignId, uint256 unclaimedAmount);
    
    /**
     * @dev Constructor
     * @param _token Address of the token being distributed
     */
    constructor(IERC20 _token) Ownable(msg.sender) {
        require(address(_token) != address(0), "Token cannot be zero address");
        token = _token;
    }
    
    /**
     * @dev Create a new airdrop campaign
     * @param merkleRoot Merkle root of the airdrop recipients
     * @param totalAmount Total tokens allocated for this campaign
     * @param startTime Campaign start timestamp
     * @param endTime Campaign end timestamp
     * @param vestingDuration Vesting duration in seconds (0 for instant claim)
     */
    function createCampaign(
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 startTime,
        uint256 endTime,
        uint256 vestingDuration
    ) external onlyOwner returns (uint256) {
        require(merkleRoot != bytes32(0), "Invalid merkle root");
        require(totalAmount > 0, "Total amount must be greater than 0");
        require(endTime > startTime, "End time must be after start time");
        require(startTime >= block.timestamp, "Start time must be in the future");
        
        uint256 campaignId = campaignCounter++;
        
        campaigns[campaignId] = Campaign({
            merkleRoot: merkleRoot,
            totalAmount: totalAmount,
            claimedAmount: 0,
            startTime: startTime,
            endTime: endTime,
            vestingDuration: vestingDuration,
            paused: false,
            finalized: false
        });
        
        // Transfer tokens to this contract
        token.safeTransferFrom(msg.sender, address(this), totalAmount);
        
        emit CampaignCreated(campaignId, merkleRoot, totalAmount, startTime, endTime);
        
        return campaignId;
    }
    
    /**
     * @dev Claim airdrop tokens
     * @param campaignId Campaign ID
     * @param amount Amount to claim
     * @param merkleProof Merkle proof for verification
     */
    function claim(
        uint256 campaignId,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external nonReentrant {
        Campaign storage campaign = campaigns[campaignId];
        
        require(!campaign.paused, "Campaign is paused");
        require(!campaign.finalized, "Campaign has been finalized");
        require(block.timestamp >= campaign.startTime, "Campaign not started");
        require(block.timestamp <= campaign.endTime, "Campaign has ended");
        require(claims[campaignId][msg.sender].amount == 0, "Already claimed");
        
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(
            MerkleProof.verify(merkleProof, campaign.merkleRoot, leaf),
            "Invalid merkle proof"
        );
        
        // Record claim
        claims[campaignId][msg.sender] = ClaimInfo({
            amount: amount,
            claimTime: block.timestamp,
            vestedAmount: 0
        });
        
        campaign.claimedAmount += amount;
        
        // If no vesting, transfer immediately
        if (campaign.vestingDuration == 0) {
            claims[campaignId][msg.sender].vestedAmount = amount;
            token.safeTransfer(msg.sender, amount);
        }
        
        emit TokensClaimed(campaignId, msg.sender, amount);
    }
    
    /**
     * @dev Release vested tokens (if campaign has vesting)
     * @param campaignId Campaign ID
     */
    function releaseVested(uint256 campaignId) external nonReentrant {
        Campaign memory campaign = campaigns[campaignId];
        ClaimInfo storage claimInfo = claims[campaignId][msg.sender];
        
        require(claimInfo.amount > 0, "No claim found");
        require(campaign.vestingDuration > 0, "No vesting for this campaign");
        
        uint256 releasable = _releasableAmount(campaignId, msg.sender);
        require(releasable > 0, "No tokens to release");
        
        claimInfo.vestedAmount += releasable;
        
        token.safeTransfer(msg.sender, releasable);
        
        emit VestedTokensReleased(campaignId, msg.sender, releasable);
    }
    
    /**
     * @dev Calculate releasable vested amount
     */
    function _releasableAmount(uint256 campaignId, address claimer) private view returns (uint256) {
        Campaign memory campaign = campaigns[campaignId];
        ClaimInfo memory claimInfo = claims[campaignId][claimer];
        
        if (claimInfo.amount == 0 || campaign.vestingDuration == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - claimInfo.claimTime;
        
        uint256 vestedAmount;
        if (timeElapsed >= campaign.vestingDuration) {
            vestedAmount = claimInfo.amount;
        } else {
            vestedAmount = (claimInfo.amount * timeElapsed) / campaign.vestingDuration;
        }
        
        return vestedAmount - claimInfo.vestedAmount;
    }
    
    /**
     * @dev Get releasable amount for a claimer
     */
    function getReleasableAmount(uint256 campaignId, address claimer) external view returns (uint256) {
        return _releasableAmount(campaignId, claimer);
    }
    
    /**
     * @dev Pause a campaign (emergency only)
     */
    function pauseCampaign(uint256 campaignId) external onlyOwner {
        require(!campaigns[campaignId].finalized, "Campaign already finalized");
        campaigns[campaignId].paused = true;
        emit CampaignPaused(campaignId);
    }
    
    /**
     * @dev Unpause a campaign
     */
    function unpauseCampaign(uint256 campaignId) external onlyOwner {
        require(campaigns[campaignId].paused, "Campaign not paused");
        campaigns[campaignId].paused = false;
        emit CampaignUnpaused(campaignId);
    }
    
    /**
     * @dev Finalize campaign and recover unclaimed tokens
     * Can only be called after campaign end time
     */
    function finalizeCampaign(uint256 campaignId) external onlyOwner {
        Campaign storage campaign = campaigns[campaignId];
        
        require(!campaign.finalized, "Campaign already finalized");
        require(block.timestamp > campaign.endTime, "Campaign not ended yet");
        
        uint256 unclaimedAmount = campaign.totalAmount - campaign.claimedAmount;
        
        campaign.finalized = true;
        
        if (unclaimedAmount > 0) {
            token.safeTransfer(owner(), unclaimedAmount);
        }
        
        emit CampaignFinalized(campaignId, unclaimedAmount);
    }
    
    /**
     * @dev Get campaign information
     */
    function getCampaignInfo(uint256 campaignId) external view returns (
        bytes32 merkleRoot,
        uint256 totalAmount,
        uint256 claimedAmount,
        uint256 startTime,
        uint256 endTime,
        uint256 vestingDuration,
        bool paused,
        bool finalized
    ) {
        Campaign memory campaign = campaigns[campaignId];
        return (
            campaign.merkleRoot,
            campaign.totalAmount,
            campaign.claimedAmount,
            campaign.startTime,
            campaign.endTime,
            campaign.vestingDuration,
            campaign.paused,
            campaign.finalized
        );
    }
    
    /**
     * @dev Get claim information for an address
     */
    function getClaimInfo(uint256 campaignId, address claimer) external view returns (
        uint256 amount,
        uint256 claimTime,
        uint256 vestedAmount,
        uint256 releasableAmount
    ) {
        ClaimInfo memory claimInfo = claims[campaignId][claimer];
        return (
            claimInfo.amount,
            claimInfo.claimTime,
            claimInfo.vestedAmount,
            _releasableAmount(campaignId, claimer)
        );
    }
    
    /**
     * @dev Check if an address has claimed in a campaign
     */
    function hasClaimed(uint256 campaignId, address claimer) external view returns (bool) {
        return claims[campaignId][claimer].amount > 0;
    }
}
