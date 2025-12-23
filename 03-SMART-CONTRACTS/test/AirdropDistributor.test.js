const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("AirdropDistributor", function () {
  const TOTAL_SUPPLY = ethers.parseUnits("1000000000", 18);
  const CAMPAIGN_AMOUNT = ethers.parseUnits("10000000", 18);
  const CLAIM_AMOUNT = ethers.parseUnits("1000", 18);
  const ONE_MONTH = 30 * 24 * 60 * 60;

  // Helper function to create merkle tree
  function createMerkleTree(claims) {
    const leaves = claims.map(claim =>
      ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      )
    );
    return new MerkleTree(leaves, keccak256, { sortPairs: true });
  }

  async function deployAirdropFixture() {
    const [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    // Deploy mock token
    const MockToken = await ethers.getContractFactory("NusantaraToken");
    const addresses = [owner, user1, user2, user3, user4, user5].map(s => s.address);
    const token = await MockToken.deploy(owner.address, ...addresses);

    // Deploy airdrop distributor
    const AirdropDistributor = await ethers.getContractFactory("AirdropDistributor");
    const airdrop = await AirdropDistributor.deploy(await token.getAddress());

    // Transfer tokens to airdrop contract
    await token.transfer(await airdrop.getAddress(), ethers.parseUnits("100000000", 18));

    // Create sample merkle tree for testing
    const claims = [
      { address: user1.address, amount: CLAIM_AMOUNT },
      { address: user2.address, amount: CLAIM_AMOUNT },
      { address: user3.address, amount: CLAIM_AMOUNT },
      { address: user4.address, amount: CLAIM_AMOUNT * 2n },
    ];

    const merkleTree = createMerkleTree(claims);
    const merkleRoot = merkleTree.getHexRoot();

    return {
      airdrop,
      token,
      owner,
      user1,
      user2,
      user3,
      user4,
      user5,
      claims,
      merkleTree,
      merkleRoot
    };
  }

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const { airdrop, token } = await loadFixture(deployAirdropFixture);
      expect(await airdrop.token()).to.equal(await token.getAddress());
    });

    it("Should set the correct owner", async function () {
      const { airdrop, owner } = await loadFixture(deployAirdropFixture);
      expect(await airdrop.owner()).to.equal(owner.address);
    });

    it("Should start with zero campaigns", async function () {
      const { airdrop } = await loadFixture(deployAirdropFixture);
      
      const campaign = await airdrop.campaigns(0);
      expect(campaign.totalAmount).to.equal(0);
    });
  });

  describe("Creating Campaigns", function () {
    it("Should create a campaign", async function () {
      const { airdrop, merkleRoot } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const startTime = currentTime + 3600; // Start in 1 hour
      const endTime = startTime + (30 * 24 * 60 * 60); // 30 days
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        startTime,
        endTime,
        0 // No vesting
      );
      
      const campaign = await airdrop.campaigns(0);
      expect(campaign.merkleRoot).to.equal(merkleRoot);
      expect(campaign.totalAmount).to.equal(CAMPAIGN_AMOUNT);
      expect(campaign.startTime).to.equal(startTime);
      expect(campaign.endTime).to.equal(endTime);
    });

    it("Should emit CampaignCreated event", async function () {
      const { airdrop, merkleRoot } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const startTime = currentTime + 3600;
      const endTime = startTime + ONE_MONTH;
      
      await expect(
        airdrop.createCampaign(merkleRoot, CAMPAIGN_AMOUNT, startTime, endTime, 0)
      ).to.emit(airdrop, "CampaignCreated")
        .withArgs(0, CAMPAIGN_AMOUNT, startTime, endTime);
    });

    it("Should increment campaign ID for each campaign", async function () {
      const { airdrop, merkleRoot } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT / 2n,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      const campaign0 = await airdrop.campaigns(0);
      const campaign1 = await airdrop.campaigns(1);
      
      expect(campaign0.totalAmount).to.equal(CAMPAIGN_AMOUNT);
      expect(campaign1.totalAmount).to.equal(CAMPAIGN_AMOUNT / 2n);
    });

    it("Should fail if merkle root is zero", async function () {
      const { airdrop } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const zeroRoot = ethers.ZeroHash;
      
      await expect(
        airdrop.createCampaign(
          zeroRoot,
          CAMPAIGN_AMOUNT,
          currentTime,
          currentTime + ONE_MONTH,
          0
        )
      ).to.be.revertedWith("Invalid merkle root");
    });

    it("Should fail if total amount is zero", async function () {
      const { airdrop, merkleRoot } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        airdrop.createCampaign(
          merkleRoot,
          0,
          currentTime,
          currentTime + ONE_MONTH,
          0
        )
      ).to.be.revertedWith("Invalid amount");
    });

    it("Should fail if end time is before start time", async function () {
      const { airdrop, merkleRoot } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        airdrop.createCampaign(
          merkleRoot,
          CAMPAIGN_AMOUNT,
          currentTime + ONE_MONTH,
          currentTime, // End before start
          0
        )
      ).to.be.revertedWith("Invalid time range");
    });

    it("Should fail if called by non-owner", async function () {
      const { airdrop, user1, merkleRoot } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        airdrop.connect(user1).createCampaign(
          merkleRoot,
          CAMPAIGN_AMOUNT,
          currentTime,
          currentTime + ONE_MONTH,
          0
        )
      ).to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount");
    });
  });

  describe("Claiming Tokens", function () {
    it("Should allow valid claim with proof", async function () {
      const { airdrop, token, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      const balanceBefore = await token.balanceOf(user1.address);
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      const balanceAfter = await token.balanceOf(user1.address);
      
      expect(balanceAfter - balanceBefore).to.equal(claim.amount);
    });

    it("Should emit TokensClaimed event", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(airdrop.connect(user1).claim(0, claim.amount, proof))
        .to.emit(airdrop, "TokensClaimed")
        .withArgs(0, user1.address, claim.amount);
    });

    it("Should update claimed amount in campaign", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      const campaign = await airdrop.campaigns(0);
      expect(campaign.claimedAmount).to.equal(claim.amount);
    });

    it("Should mark user as claimed", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      expect(await airdrop.hasClaimed(0, user1.address)).to.be.true;
    });

    it("Should fail if already claimed", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      await expect(
        airdrop.connect(user1).claim(0, claim.amount, proof)
      ).to.be.revertedWith("Already claimed");
    });

    it("Should fail with invalid proof", async function () {
      const { airdrop, user1, user2, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      // Use user2's proof for user1 (invalid)
      const claim = claims.find(c => c.address === user2.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(user1).claim(0, claim.amount, proof)
      ).to.be.revertedWith("Invalid proof");
    });

    it("Should fail if campaign not started", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime + ONE_MONTH, // Starts in future
        currentTime + (2 * ONE_MONTH),
        0
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(user1).claim(0, claim.amount, proof)
      ).to.be.revertedWith("Campaign not active");
    });

    it("Should fail if campaign ended", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      // Move time past campaign end
      await time.increase(2 * ONE_MONTH);
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(user1).claim(0, claim.amount, proof)
      ).to.be.revertedWith("Campaign not active");
    });

    it("Should fail if campaign is paused", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await airdrop.pauseCampaign(0);
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(user1).claim(0, claim.amount, proof)
      ).to.be.revertedWith("Campaign paused");
    });
  });

  describe("Vested Claims", function () {
    it("Should create vesting schedule for vested campaign", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      const vestingDuration = 6 * ONE_MONTH;
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        vestingDuration // 6 months vesting
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      const vestingInfo = await airdrop.vestedClaims(0, user1.address);
      expect(vestingInfo.totalAmount).to.equal(claim.amount);
      expect(vestingInfo.releasedAmount).to.equal(0);
    });

    it("Should release vested tokens linearly", async function () {
      const { airdrop, token, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      const vestingDuration = 6 * ONE_MONTH;
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        vestingDuration
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      const balanceBefore = await token.balanceOf(user1.address);
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      // Move 3 months (50% of vesting)
      await time.increase(3 * ONE_MONTH);
      
      await airdrop.connect(user1).releaseVested(0);
      
      const balanceAfter = await token.balanceOf(user1.address);
      const released = balanceAfter - balanceBefore;
      
      const expected = claim.amount / 2n;
      const tolerance = expected / 20n; // 5% tolerance
      
      expect(released).to.be.closeTo(expected, tolerance);
    });

    it("Should emit VestedTokensReleased event", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        6 * ONE_MONTH
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      await time.increase(3 * ONE_MONTH);
      
      await expect(airdrop.connect(user1).releaseVested(0))
        .to.emit(airdrop, "VestedTokensReleased");
    });

    it("Should allow multiple vested releases", async function () {
      const { airdrop, token, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        6 * ONE_MONTH
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      // First release at 2 months
      await time.increase(2 * ONE_MONTH);
      await airdrop.connect(user1).releaseVested(0);
      const balance1 = await token.balanceOf(user1.address);
      
      // Second release at 4 months total
      await time.increase(2 * ONE_MONTH);
      await airdrop.connect(user1).releaseVested(0);
      const balance2 = await token.balanceOf(user1.address);
      
      expect(balance2).to.be.above(balance1);
    });

    it("Should fail release if nothing to release", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        6 * ONE_MONTH
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      // Try to release immediately (no time passed)
      await expect(
        airdrop.connect(user1).releaseVested(0)
      ).to.be.revertedWith("No tokens to release");
    });
  });

  describe("Campaign Management", function () {
    it("Should pause campaign", async function () {
      const { airdrop, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await airdrop.pauseCampaign(0);
      
      const campaign = await airdrop.campaigns(0);
      expect(campaign.paused).to.be.true;
    });

    it("Should emit CampaignPaused event", async function () {
      const { airdrop, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await expect(airdrop.pauseCampaign(0))
        .to.emit(airdrop, "CampaignPaused")
        .withArgs(0);
    });

    it("Should unpause campaign", async function () {
      const { airdrop, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await airdrop.pauseCampaign(0);
      await airdrop.unpauseCampaign(0);
      
      const campaign = await airdrop.campaigns(0);
      expect(campaign.paused).to.be.false;
    });

    it("Should emit CampaignUnpaused event", async function () {
      const { airdrop, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await airdrop.pauseCampaign(0);
      
      await expect(airdrop.unpauseCampaign(0))
        .to.emit(airdrop, "CampaignUnpaused")
        .withArgs(0);
    });

    it("Should finalize campaign and recover unclaimed tokens", async function () {
      const { airdrop, token, owner, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      // Wait for campaign to end
      await time.increase(2 * ONE_MONTH);
      
      const ownerBalanceBefore = await token.balanceOf(owner.address);
      await airdrop.finalizeCampaign(0);
      const ownerBalanceAfter = await token.balanceOf(owner.address);
      
      // Owner should receive unclaimed tokens
      expect(ownerBalanceAfter).to.be.above(ownerBalanceBefore);
    });

    it("Should emit CampaignFinalized event", async function () {
      const { airdrop, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await time.increase(2 * ONE_MONTH);
      
      await expect(airdrop.finalizeCampaign(0))
        .to.emit(airdrop, "CampaignFinalized")
        .withArgs(0);
    });

    it("Should fail finalize if campaign not ended", async function () {
      const { airdrop, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await expect(
        airdrop.finalizeCampaign(0)
      ).to.be.revertedWith("Campaign not ended");
    });

    it("Should fail finalize if already finalized", async function () {
      const { airdrop, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await time.increase(2 * ONE_MONTH);
      await airdrop.finalizeCampaign(0);
      
      await expect(
        airdrop.finalizeCampaign(0)
      ).to.be.revertedWith("Already finalized");
    });
  });

  describe("Multiple Campaigns", function () {
    it("Should handle multiple campaigns independently", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      // Create two campaigns
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT / 2n,
        currentTime,
        currentTime + ONE_MONTH,
        6 * ONE_MONTH
      );
      
      const campaign0 = await airdrop.campaigns(0);
      const campaign1 = await airdrop.campaigns(1);
      
      expect(campaign0.totalAmount).to.equal(CAMPAIGN_AMOUNT);
      expect(campaign1.totalAmount).to.equal(CAMPAIGN_AMOUNT / 2n);
      expect(campaign0.vestingDuration).to.equal(0);
      expect(campaign1.vestingDuration).to.equal(6 * ONE_MONTH);
    });

    it("Should allow claiming from multiple campaigns", async function () {
      const { airdrop, token, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      const balanceBefore = await token.balanceOf(user1.address);
      
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      await airdrop.connect(user1).claim(1, claim.amount, proof);
      
      const balanceAfter = await token.balanceOf(user1.address);
      
      expect(balanceAfter - balanceBefore).to.equal(claim.amount * 2n);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle exact claim amounts", async function () {
      const { airdrop, user4, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      // user4 has different amount (2x)
      const claim = claims.find(c => c.address === user4.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      await expect(
        airdrop.connect(user4).claim(0, claim.amount, proof)
      ).to.emit(airdrop, "TokensClaimed");
    });

    it("Should handle zero vesting duration correctly", async function () {
      const { airdrop, user1, claims, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0 // No vesting
      );
      
      const claim = claims.find(c => c.address === user1.address);
      const leaf = ethers.solidityPackedKeccak256(
        ["address", "uint256"],
        [claim.address, claim.amount]
      );
      const proof = merkleTree.getHexProof(leaf);
      
      // Should get tokens immediately
      await airdrop.connect(user1).claim(0, claim.amount, proof);
      
      const vestingInfo = await airdrop.vestedClaims(0, user1.address);
      expect(vestingInfo.totalAmount).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to create campaigns", async function () {
      const { airdrop, user1, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await expect(
        airdrop.connect(user1).createCampaign(
          merkleRoot,
          CAMPAIGN_AMOUNT,
          currentTime,
          currentTime + ONE_MONTH,
          0
        )
      ).to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to pause campaigns", async function () {
      const { airdrop, user1, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await expect(
        airdrop.connect(user1).pauseCampaign(0)
      ).to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to finalize campaigns", async function () {
      const { airdrop, user1, merkleTree } = await loadFixture(deployAirdropFixture);
      
      const currentTime = await time.latest();
      const merkleRoot = merkleTree.getHexRoot();
      
      await airdrop.createCampaign(
        merkleRoot,
        CAMPAIGN_AMOUNT,
        currentTime,
        currentTime + ONE_MONTH,
        0
      );
      
      await time.increase(2 * ONE_MONTH);
      
      await expect(
        airdrop.connect(user1).finalizeCampaign(0)
      ).to.be.revertedWithCustomError(airdrop, "OwnableUnauthorizedAccount");
    });
  });
});
