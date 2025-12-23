const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NusantaraToken - Essential Tests", function () {
  let token;
  let owner, user1, user2, user3, user4, user5, user6;

  beforeEach(async function () {
    [owner, user1, user2, user3, user4, user5, user6] = await ethers.getSigners();

    const NusantaraToken = await ethers.getContractFactory("NusantaraToken");
    token = await NusantaraToken.deploy(
      owner.address,      // multisig
      user1.address,      // community
      user2.address,      // ecosystem
      user3.address,      // liquidity
      user4.address,      // team
      user5.address,      // advisor
      user6.address       // treasury
    );
  });

  describe("✅ Deployment & Supply", function () {
    it("Should have correct name and symbol", async function () {
      expect(await token.name()).to.equal("Nusantara Token");
      expect(await token.symbol()).to.equal("NUSA");
    });

    it("Should have 18 decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("Should have total supply of 1 billion", async function () {
      const expectedSupply = ethers.parseUnits("1000000000", 18);
      expect(await token.totalSupply()).to.equal(expectedSupply);
    });

    it("Should distribute correct allocations", async function () {
      // Community: 35%
      expect(await token.balanceOf(user1.address))
        .to.equal(ethers.parseUnits("350000000", 18));
      
      // Ecosystem: 20%
      expect(await token.balanceOf(user2.address))
        .to.equal(ethers.parseUnits("200000000", 18));
      
      // Liquidity: 12%
      expect(await token.balanceOf(user3.address))
        .to.equal(ethers.parseUnits("120000000", 18));
      
      // Team: 15%
      expect(await token.balanceOf(user4.address))
        .to.equal(ethers.parseUnits("150000000", 18));
      
      // Advisor: 3%
      expect(await token.balanceOf(user5.address))
        .to.equal(ethers.parseUnits("30000000", 18));
      
      // Treasury: 15%
      expect(await token.balanceOf(user6.address))
        .to.equal(ethers.parseUnits("150000000", 18));
    });
  });

  describe("✅ Transfers", function () {
    it("Should transfer tokens successfully", async function () {
      const amount = ethers.parseUnits("1000", 18);
      await token.connect(user1).transfer(user2.address, amount);
      
      expect(await token.balanceOf(user2.address))
        .to.equal(ethers.parseUnits("200001000", 18));
    });

    it("Should emit Transfer event", async function () {
      const amount = ethers.parseUnits("1000", 18);
      
      await expect(token.connect(user1).transfer(user2.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, user2.address, amount);
    });

    it("Should fail if insufficient balance", async function () {
      const amount = ethers.parseUnits("999999999999", 18);
      
      await expect(
        token.connect(user1).transfer(user2.address, amount)
      ).to.be.reverted;
    });
  });

  describe("✅ Approval & TransferFrom", function () {
    it("Should approve successfully", async function () {
      const amount = ethers.parseUnits("5000", 18);
      await token.connect(user1).approve(user2.address, amount);
      
      expect(await token.allowance(user1.address, user2.address))
        .to.equal(amount);
    });

    it("Should transferFrom with approval", async function () {
      const amount = ethers.parseUnits("5000", 18);
      
      await token.connect(user1).approve(user2.address, amount);
      await token.connect(user2).transferFrom(user1.address, user3.address, amount);
      
      expect(await token.balanceOf(user3.address))
        .to.equal(ethers.parseUnits("120005000", 18));
    });
  });

  describe("✅ Burning", function () {
    it("Should burn tokens successfully", async function () {
      const burnAmount = ethers.parseUnits("1000000", 18);
      const initialSupply = await token.totalSupply();
      
      await token.connect(user1).burn(burnAmount);
      
      expect(await token.totalSupply())
        .to.equal(initialSupply - burnAmount);
    });

    it("Should decrease user balance on burn", async function () {
      const burnAmount = ethers.parseUnits("1000000", 18);
      const initialBalance = await token.balanceOf(user1.address);
      
      await token.connect(user1).burn(burnAmount);
      
      expect(await token.balanceOf(user1.address))
        .to.equal(initialBalance - burnAmount);
    });
  });

  describe("✅ Pausing", function () {
    it("Should allow PAUSER_ROLE to pause", async function () {
      const pauserRole = await token.PAUSER_ROLE();
      await token.grantRole(pauserRole, user2.address);
      
      await token.connect(user2).pause("Test pause");
      expect(await token.paused()).to.be.true;
    });

    it("Should prevent transfers when paused", async function () {
      const pauserRole = await token.PAUSER_ROLE();
      await token.grantRole(pauserRole, user2.address);
      await token.connect(user2).pause("Test");
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(user1).transfer(user3.address, amount)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Should allow PAUSER_ROLE to unpause", async function () {
      const pauserRole = await token.PAUSER_ROLE();
      await token.grantRole(pauserRole, user2.address);
      
      await token.connect(user2).pause("Test");
      await token.connect(user2).unpause();
      
      expect(await token.paused()).to.be.false;
    });

    it("Should allow transfers after unpause", async function () {
      const pauserRole = await token.PAUSER_ROLE();
      await token.grantRole(pauserRole, user2.address);
      
      await token.connect(user2).pause("Test");
      await token.connect(user2).unpause();
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(user1).transfer(user3.address, amount)
      ).to.emit(token, "Transfer");
    });
  });

  describe("✅ Access Control", function () {
    it("Should grant roles", async function () {
      const pauserRole = await token.PAUSER_ROLE();
      await token.grantRole(pauserRole, user2.address);
      
      expect(await token.hasRole(pauserRole, user2.address)).to.be.true;
    });

    it("Should revoke roles", async function () {
      const pauserRole = await token.PAUSER_ROLE();
      await token.grantRole(pauserRole, user2.address);
      await token.revokeRole(pauserRole, user2.address);
      
      expect(await token.hasRole(pauserRole, user2.address)).to.be.false;
    });

    it("Should fail if non-admin grants role", async function () {
      const pauserRole = await token.PAUSER_ROLE();
      const adminRole = await token.DEFAULT_ADMIN_ROLE();
      
      await expect(
        token.connect(user1).grantRole(pauserRole, user2.address)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, adminRole);
    });
  });

  describe("✅ Gas Benchmarks", function () {
    it("Transfer should use reasonable gas", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const tx = await token.connect(user1).transfer(user2.address, amount);
      const receipt = await tx.wait();
      
      console.log(`      ⛽ Transfer gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.below(100000);
    });

    it("Approve should use reasonable gas", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const tx = await token.connect(user1).approve(user2.address, amount);
      const receipt = await tx.wait();
      
      console.log(`      ⛽ Approve gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.below(50000);
    });

    it("Burn should use reasonable gas", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const tx = await token.connect(user1).burn(amount);
      const receipt = await tx.wait();
      
      console.log(`      ⛽ Burn gas: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.below(100000);
    });
  });

  describe("✅ Edge Cases", function () {
    it("Should handle zero amount transfers", async function () {
      await expect(token.connect(user1).transfer(user2.address, 0))
        .to.emit(token, "Transfer");
    });

    it("Should handle self-transfer", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const balanceBefore = await token.balanceOf(user1.address);
      
      await token.connect(user1).transfer(user1.address, amount);
      
      expect(await token.balanceOf(user1.address)).to.equal(balanceBefore);
    });

    it("Should reject transfer to zero address", async function () {
      const amount = ethers.parseUnits("1000", 18);
      
      await expect(
        token.connect(user1).transfer(ethers.ZeroAddress, amount)
      ).to.be.reverted;
    });
  });
});
