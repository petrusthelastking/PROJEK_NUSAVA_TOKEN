const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("NusantaraToken", function () {
  // Fixture untuk deploy contract
  async function deployTokenFixture() {
    const [owner, pauser, allocator, user1, user2, user3] = await ethers.getSigners();

    // Setup 6 allocation addresses
    const communityRewards = user1.address;
    const ecosystem = user2.address;
    const liquidity = user3.address;
    const teamVesting = await ethers.Wallet.createRandom().getAddress();
    const advisorVesting = await ethers.Wallet.createRandom().getAddress();
    const treasury = await ethers.Wallet.createRandom().getAddress();

    const NusantaraToken = await ethers.getContractFactory("NusantaraToken");
    const token = await NusantaraToken.deploy(
      owner.address,
      communityRewards,
      ecosystem,
      liquidity,
      teamVesting,
      advisorVesting,
      treasury
    );

    return {
      token,
      owner,
      pauser,
      allocator,
      user1,
      user2,
      user3,
      communityRewards,
      ecosystem,
      liquidity,
      teamVesting,
      advisorVesting,
      treasury
    };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.name()).to.equal("Nusantara Token");
      expect(await token.symbol()).to.equal("NUSA");
    });

    it("Should set the correct decimals", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.decimals()).to.equal(18);
    });

    it("Should set the correct total supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const expectedSupply = ethers.parseUnits("1000000000", 18); // 1 billion
      expect(await token.totalSupply()).to.equal(expectedSupply);
    });

    it("Should assign DEFAULT_ADMIN_ROLE to multisig", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);
      const adminRole = await token.DEFAULT_ADMIN_ROLE();
      expect(await token.hasRole(adminRole, owner.address)).to.be.true;
    });

    it("Should distribute correct allocations", async function () {
      const { token, communityRewards, ecosystem, liquidity, teamVesting, advisorVesting, treasury } = 
        await loadFixture(deployTokenFixture);

      // Expected allocations
      const community = ethers.parseUnits("350000000", 18); // 35%
      const eco = ethers.parseUnits("200000000", 18); // 20%
      const liq = ethers.parseUnits("120000000", 18); // 12%
      const team = ethers.parseUnits("150000000", 18); // 15%
      const advisor = ethers.parseUnits("30000000", 18); // 3%
      const treas = ethers.parseUnits("150000000", 18); // 15%

      expect(await token.balanceOf(communityRewards)).to.equal(community);
      expect(await token.balanceOf(ecosystem)).to.equal(eco);
      expect(await token.balanceOf(liquidity)).to.equal(liq);
      expect(await token.balanceOf(teamVesting)).to.equal(team);
      expect(await token.balanceOf(advisorVesting)).to.equal(advisor);
      expect(await token.balanceOf(treasury)).to.equal(treas);
    });

    it("Should revert if any allocation address is zero", async function () {
      const [owner] = await ethers.getSigners();
      const NusantaraToken = await ethers.getContractFactory("NusantaraToken");

      await expect(
        NusantaraToken.deploy(
          owner.address,
          ethers.ZeroAddress, // Invalid
          owner.address,
          owner.address,
          owner.address,
          owner.address,
          owner.address
        )
      ).to.be.revertedWith("Invalid address");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("1000", 18);
      await token.connect(user1).transfer(user2.address, amount);
      
      expect(await token.balanceOf(user2.address)).to.equal(
        ethers.parseUnits("200000000", 18) + amount
      );
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { token, user1, owner } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("999999999999", 18);
      await expect(
        token.connect(user1).transfer(owner.address, amount)
      ).to.be.reverted;
    });

    it("Should emit Transfer event", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(token.connect(user1).transfer(user2.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, user2.address, amount);
    });

    it("Should update balances after transfers", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const initialBalance1 = await token.balanceOf(user1.address);
      const initialBalance2 = await token.balanceOf(user2.address);
      const amount = ethers.parseUnits("1000", 18);
      
      await token.connect(user1).transfer(user2.address, amount);
      
      expect(await token.balanceOf(user1.address)).to.equal(initialBalance1 - amount);
      expect(await token.balanceOf(user2.address)).to.equal(initialBalance2 + amount);
    });
  });

  describe("Approval & TransferFrom", function () {
    it("Should approve tokens for delegated transfer", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("5000", 18);
      await token.connect(user1).approve(user2.address, amount);
      
      expect(await token.allowance(user1.address, user2.address)).to.equal(amount);
    });

    it("Should emit Approval event", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("5000", 18);
      await expect(token.connect(user1).approve(user2.address, amount))
        .to.emit(token, "Approval")
        .withArgs(user1.address, user2.address, amount);
    });

    it("Should transfer tokens using transferFrom", async function () {
      const { token, user1, user2, user3 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("5000", 18);
      await token.connect(user1).approve(user2.address, amount);
      await token.connect(user2).transferFrom(user1.address, user3.address, amount);
      
      expect(await token.balanceOf(user3.address)).to.equal(
        ethers.parseUnits("120000000", 18) + amount
      );
    });

    it("Should fail transferFrom if allowance is insufficient", async function () {
      const { token, user1, user2, user3 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("5000", 18);
      await expect(
        token.connect(user2).transferFrom(user1.address, user3.address, amount)
      ).to.be.reverted;
    });

    it("Should decrease allowance after transferFrom", async function () {
      const { token, user1, user2, user3 } = await loadFixture(deployTokenFixture);
      
      const approveAmount = ethers.parseUnits("10000", 18);
      const transferAmount = ethers.parseUnits("3000", 18);
      
      await token.connect(user1).approve(user2.address, approveAmount);
      await token.connect(user2).transferFrom(user1.address, user3.address, transferAmount);
      
      expect(await token.allowance(user1.address, user2.address))
        .to.equal(approveAmount - transferAmount);
    });
  });

  describe("Burning", function () {
    it("Should allow users to burn their own tokens", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const initialBalance = await token.balanceOf(user1.address);
      const burnAmount = ethers.parseUnits("1000000", 18);
      
      await token.connect(user1).burn(burnAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(initialBalance - burnAmount);
    });

    it("Should decrease total supply when burning", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const initialSupply = await token.totalSupply();
      const burnAmount = ethers.parseUnits("1000000", 18);
      
      await token.connect(user1).burn(burnAmount);
      
      expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
    });

    it("Should emit Transfer event to zero address on burn", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const burnAmount = ethers.parseUnits("1000000", 18);
      await expect(token.connect(user1).burn(burnAmount))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, ethers.ZeroAddress, burnAmount);
    });

    it("Should fail if trying to burn more than balance", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const balance = await token.balanceOf(user1.address);
      const burnAmount = balance + ethers.parseUnits("1", 18);
      
      await expect(token.connect(user1).burn(burnAmount)).to.be.reverted;
    });

    it("Should allow burning from allowance (burnFrom)", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const burnAmount = ethers.parseUnits("1000000", 18);
      await token.connect(user1).approve(user2.address, burnAmount);
      
      await token.connect(user2).burnFrom(user1.address, burnAmount);
      
      expect(await token.balanceOf(user1.address)).to.equal(
        ethers.parseUnits("350000000", 18) - burnAmount
      );
    });
  });

  describe("Pausing", function () {
    it("Should allow PAUSER_ROLE to pause", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      
      await token.connect(pauser).pause("Emergency test");
      expect(await token.paused()).to.be.true;
    });

    it("Should emit Paused event with reason", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      
      await expect(token.connect(pauser).pause("Security incident"))
        .to.emit(token, "Paused")
        .withArgs(pauser.address);
    });

    it("Should prevent transfers when paused", async function () {
      const { token, owner, pauser, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      await token.connect(pauser).pause("Test pause");
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(user1).transfer(user2.address, amount)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Should prevent burns when paused", async function () {
      const { token, owner, pauser, user1 } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      await token.connect(pauser).pause("Test pause");
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(user1).burn(amount)
      ).to.be.revertedWithCustomError(token, "EnforcedPause");
    });

    it("Should allow PAUSER_ROLE to unpause", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      
      await token.connect(pauser).pause("Test");
      await token.connect(pauser).unpause();
      
      expect(await token.paused()).to.be.false;
    });

    it("Should emit Unpaused event", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      await token.connect(pauser).pause("Test");
      
      await expect(token.connect(pauser).unpause())
        .to.emit(token, "Unpaused")
        .withArgs(pauser.address);
    });

    it("Should fail pause if caller doesn't have PAUSER_ROLE", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await expect(
        token.connect(user1).pause("Unauthorized")
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, pauserRole);
    });

    it("Should allow transfers after unpause", async function () {
      const { token, owner, pauser, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      
      await token.connect(pauser).pause("Test");
      await token.connect(pauser).unpause();
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(token.connect(user1).transfer(user2.address, amount))
        .to.emit(token, "Transfer");
    });
  });

  describe("Access Control", function () {
    it("Should grant roles by admin", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      
      expect(await token.hasRole(pauserRole, pauser.address)).to.be.true;
    });

    it("Should emit RoleGranted event", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await expect(token.connect(owner).grantRole(pauserRole, pauser.address))
        .to.emit(token, "RoleGranted")
        .withArgs(pauserRole, pauser.address, owner.address);
    });

    it("Should revoke roles by admin", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      await token.connect(owner).revokeRole(pauserRole, pauser.address);
      
      expect(await token.hasRole(pauserRole, pauser.address)).to.be.false;
    });

    it("Should emit RoleRevoked event", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      
      await expect(token.connect(owner).revokeRole(pauserRole, pauser.address))
        .to.emit(token, "RoleRevoked")
        .withArgs(pauserRole, pauser.address, owner.address);
    });

    it("Should allow role renouncement", async function () {
      const { token, owner, pauser } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      await token.connect(owner).grantRole(pauserRole, pauser.address);
      await token.connect(pauser).renounceRole(pauserRole, pauser.address);
      
      expect(await token.hasRole(pauserRole, pauser.address)).to.be.false;
    });

    it("Should fail if non-admin tries to grant role", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const pauserRole = await token.PAUSER_ROLE();
      const adminRole = await token.DEFAULT_ADMIN_ROLE();
      
      await expect(
        token.connect(user1).grantRole(pauserRole, user2.address)
      ).to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
        .withArgs(user1.address, adminRole);
    });
  });

  describe("Supply Limits", function () {
    it("Should have no mint function (immutable supply)", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      // Check that contract doesn't have mint function
      expect(token.mint).to.be.undefined;
    });

    it("Should have fixed total supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.equal(ethers.parseUnits("1000000000", 18));
    });

    it("Should only decrease supply through burns", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const initialSupply = await token.totalSupply();
      const burnAmount = ethers.parseUnits("1000000", 18);
      
      await token.connect(user1).burn(burnAmount);
      
      expect(await token.totalSupply()).to.be.below(initialSupply);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero amount transfers", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      await expect(token.connect(user1).transfer(user2.address, 0))
        .to.emit(token, "Transfer")
        .withArgs(user1.address, user2.address, 0);
    });

    it("Should handle maximum uint256 approval", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const maxAmount = ethers.MaxUint256;
      await token.connect(user1).approve(user2.address, maxAmount);
      
      expect(await token.allowance(user1.address, user2.address)).to.equal(maxAmount);
    });

    it("Should handle zero address transfer (should fail)", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        token.connect(user1).transfer(ethers.ZeroAddress, amount)
      ).to.be.reverted;
    });

    it("Should handle self-transfer", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const initialBalance = await token.balanceOf(user1.address);
      const amount = ethers.parseUnits("1000", 18);
      
      await token.connect(user1).transfer(user1.address, amount);
      
      expect(await token.balanceOf(user1.address)).to.equal(initialBalance);
    });
  });

  describe("Gas Optimization", function () {
    it("Should track gas usage for transfer", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("1000", 18);
      const tx = await token.connect(user1).transfer(user2.address, amount);
      const receipt = await tx.wait();
      
      console.log(`      Gas used for transfer: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.below(100000); // Should be under 100k gas
    });

    it("Should track gas usage for approve", async function () {
      const { token, user1, user2 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("1000", 18);
      const tx = await token.connect(user1).approve(user2.address, amount);
      const receipt = await tx.wait();
      
      console.log(`      Gas used for approve: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.below(50000); // Should be under 50k gas
    });

    it("Should track gas usage for burn", async function () {
      const { token, user1 } = await loadFixture(deployTokenFixture);
      
      const amount = ethers.parseUnits("1000", 18);
      const tx = await token.connect(user1).burn(amount);
      const receipt = await tx.wait();
      
      console.log(`      Gas used for burn: ${receipt.gasUsed.toString()}`);
      expect(receipt.gasUsed).to.be.below(100000); // Should be under 100k gas
    });
  });
});
