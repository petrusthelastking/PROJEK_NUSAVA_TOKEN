const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TokenVesting", function () {
  // Constants
  const TOTAL_SUPPLY = ethers.parseUnits("1000000000", 18);
  const VESTING_AMOUNT = ethers.parseUnits("10000000", 18);
  const ONE_YEAR = 365 * 24 * 60 * 60;
  const ONE_MONTH = 30 * 24 * 60 * 60;

  async function deployVestingFixture() {
    const [owner, beneficiary1, beneficiary2, beneficiary3] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("NusantaraToken");
    const addresses = [owner, beneficiary1, beneficiary2, beneficiary3, owner, owner].map(s => s.address);
    const token = await MockToken.deploy(owner.address, ...addresses);

    // Deploy vesting contract
    const TokenVesting = await ethers.getContractFactory("TokenVesting");
    const vesting = await TokenVesting.deploy(await token.getAddress());

    // Transfer tokens to vesting contract
    await token.transfer(await vesting.getAddress(), ethers.parseUnits("100000000", 18));

    return { vesting, token, owner, beneficiary1, beneficiary2, beneficiary3 };
  }

  describe("Deployment", function () {
    it("Should set the correct token address", async function () {
      const { vesting, token } = await loadFixture(deployVestingFixture);
      expect(await vesting.token()).to.equal(await token.getAddress());
    });

    it("Should set the correct owner", async function () {
      const { vesting, owner } = await loadFixture(deployVestingFixture);
      expect(await vesting.owner()).to.equal(owner.address);
    });

    it("Should start with zero vesting schedules", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const schedule = await vesting.vestingSchedules(beneficiary1.address);
      expect(schedule.totalAmount).to.equal(0);
    });
  });

  describe("Creating Vesting Schedules", function () {
    it("Should create a vesting schedule", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      const cliff = ONE_YEAR; // 12 months
      const duration = 2 * ONE_YEAR; // 24 months total vesting
      
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        cliff,
        duration,
        true // revocable
      );
      
      const schedule = await vesting.vestingSchedules(beneficiary1.address);
      expect(schedule.totalAmount).to.equal(VESTING_AMOUNT);
      expect(schedule.cliffDuration).to.equal(cliff);
      expect(schedule.vestingDuration).to.equal(duration);
      expect(schedule.revocable).to.be.true;
    });

    it("Should emit VestingScheduleCreated event", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        vesting.createVestingSchedule(
          beneficiary1.address,
          VESTING_AMOUNT,
          currentTime,
          ONE_YEAR,
          2 * ONE_YEAR,
          true
        )
      ).to.emit(vesting, "VestingScheduleCreated")
        .withArgs(beneficiary1.address, VESTING_AMOUNT, currentTime, ONE_YEAR, 2 * ONE_YEAR);
    });

    it("Should fail if beneficiary already has a schedule", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await expect(
        vesting.createVestingSchedule(
          beneficiary1.address,
          VESTING_AMOUNT,
          currentTime,
          ONE_YEAR,
          2 * ONE_YEAR,
          true
        )
      ).to.be.revertedWith("Schedule already exists");
    });

    it("Should fail if amount is zero", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        vesting.createVestingSchedule(
          beneficiary1.address,
          0,
          currentTime,
          ONE_YEAR,
          2 * ONE_YEAR,
          true
        )
      ).to.be.revertedWith("Amount must be > 0");
    });

    it("Should fail if vesting duration is zero", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        vesting.createVestingSchedule(
          beneficiary1.address,
          VESTING_AMOUNT,
          currentTime,
          ONE_YEAR,
          0,
          true
        )
      ).to.be.revertedWith("Duration must be > 0");
    });

    it("Should fail if called by non-owner", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        vesting.connect(beneficiary1).createVestingSchedule(
          beneficiary1.address,
          VESTING_AMOUNT,
          currentTime,
          ONE_YEAR,
          2 * ONE_YEAR,
          true
        )
      ).to.be.revertedWithCustomError(vesting, "OwnableUnauthorizedAccount");
    });

    it("Should fail if beneficiary is zero address", async function () {
      const { vesting } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      await expect(
        vesting.createVestingSchedule(
          ethers.ZeroAddress,
          VESTING_AMOUNT,
          currentTime,
          ONE_YEAR,
          2 * ONE_YEAR,
          true
        )
      ).to.be.revertedWith("Invalid beneficiary");
    });
  });

  describe("Token Release", function () {
    it("Should release nothing before cliff", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      // Move time forward but still before cliff
      await time.increase(6 * ONE_MONTH);
      
      const releasable = await vesting.releasableAmount(beneficiary1.address);
      expect(releasable).to.equal(0);
    });

    it("Should release partial amount after cliff during vesting", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      // Move to middle of vesting period (18 months = 6 months after cliff)
      await time.increase(18 * ONE_MONTH);
      
      const releasable = await vesting.releasableAmount(beneficiary1.address);
      
      // Should have vested ~6 months / 24 months = 25% of total
      const expected = VESTING_AMOUNT / 4n;
      const tolerance = expected / 100n; // 1% tolerance
      
      expect(releasable).to.be.closeTo(expected, tolerance);
    });

    it("Should release all tokens after vesting period ends", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      // Move past vesting end
      await time.increase(3 * ONE_YEAR);
      
      const releasable = await vesting.releasableAmount(beneficiary1.address);
      expect(releasable).to.equal(VESTING_AMOUNT);
    });

    it("Should transfer tokens on release", async function () {
      const { vesting, token, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      // Move to end of vesting
      await time.increase(3 * ONE_YEAR);
      
      const initialBalance = await token.balanceOf(beneficiary1.address);
      await vesting.connect(beneficiary1).release();
      const finalBalance = await token.balanceOf(beneficiary1.address);
      
      expect(finalBalance - initialBalance).to.equal(VESTING_AMOUNT);
    });

    it("Should emit TokensReleased event", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await time.increase(3 * ONE_YEAR);
      
      await expect(vesting.connect(beneficiary1).release())
        .to.emit(vesting, "TokensReleased")
        .withArgs(beneficiary1.address, VESTING_AMOUNT);
    });

    it("Should update released amount after release", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await time.increase(18 * ONE_MONTH);
      await vesting.connect(beneficiary1).release();
      
      const schedule = await vesting.vestingSchedules(beneficiary1.address);
      expect(schedule.releasedAmount).to.be.above(0);
    });

    it("Should allow multiple partial releases", async function () {
      const { vesting, token, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      // First release at 18 months
      await time.increase(18 * ONE_MONTH);
      const balance1 = await token.balanceOf(beneficiary1.address);
      await vesting.connect(beneficiary1).release();
      const balance2 = await token.balanceOf(beneficiary1.address);
      
      const firstRelease = balance2 - balance1;
      expect(firstRelease).to.be.above(0);
      
      // Second release at 24 months
      await time.increase(6 * ONE_MONTH);
      await vesting.connect(beneficiary1).release();
      const balance3 = await token.balanceOf(beneficiary1.address);
      
      const secondRelease = balance3 - balance2;
      expect(secondRelease).to.be.above(0);
      
      // Total should be close to half (24/36 months)
      const totalReleased = balance3 - balance1;
      const expected = (VESTING_AMOUNT * 2n) / 3n; // 24 months out of 36
      const tolerance = expected / 20n; // 5% tolerance
      
      expect(totalReleased).to.be.closeTo(expected, tolerance);
    });

    it("Should fail release if nothing is releasable", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      // Try to release before cliff
      await expect(
        vesting.connect(beneficiary1).release()
      ).to.be.revertedWith("No tokens to release");
    });
  });

  describe("Revocation", function () {
    it("Should allow owner to revoke revocable schedule", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true // revocable
      );
      
      await time.increase(18 * ONE_MONTH);
      await vesting.revoke(beneficiary1.address);
      
      const schedule = await vesting.vestingSchedules(beneficiary1.address);
      expect(schedule.revoked).to.be.true;
    });

    it("Should emit VestingRevoked event", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await time.increase(18 * ONE_MONTH);
      
      await expect(vesting.revoke(beneficiary1.address))
        .to.emit(vesting, "VestingRevoked")
        .withArgs(beneficiary1.address);
    });

    it("Should release vested amount before revoking", async function () {
      const { vesting, token, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await time.increase(18 * ONE_MONTH);
      
      const balanceBefore = await token.balanceOf(beneficiary1.address);
      await vesting.revoke(beneficiary1.address);
      const balanceAfter = await token.balanceOf(beneficiary1.address);
      
      // Should have received some vested tokens
      expect(balanceAfter).to.be.above(balanceBefore);
    });

    it("Should return unvested tokens to owner on revocation", async function () {
      const { vesting, token, owner, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await time.increase(18 * ONE_MONTH);
      
      const ownerBalanceBefore = await token.balanceOf(owner.address);
      await vesting.revoke(beneficiary1.address);
      const ownerBalanceAfter = await token.balanceOf(owner.address);
      
      // Owner should have received unvested tokens back
      expect(ownerBalanceAfter).to.be.above(ownerBalanceBefore);
    });

    it("Should fail if trying to revoke non-revocable schedule", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        false // NOT revocable
      );
      
      await expect(
        vesting.revoke(beneficiary1.address)
      ).to.be.revertedWith("Not revocable");
    });

    it("Should fail if already revoked", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await vesting.revoke(beneficiary1.address);
      
      await expect(
        vesting.revoke(beneficiary1.address)
      ).to.be.revertedWith("Already revoked");
    });

    it("Should fail if called by non-owner", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await expect(
        vesting.connect(beneficiary1).revoke(beneficiary1.address)
      ).to.be.revertedWithCustomError(vesting, "OwnableUnauthorizedAccount");
    });

    it("Should prevent further releases after revocation", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await time.increase(18 * ONE_MONTH);
      await vesting.revoke(beneficiary1.address);
      
      // Move forward more
      await time.increase(12 * ONE_MONTH);
      
      const releasable = await vesting.releasableAmount(beneficiary1.address);
      expect(releasable).to.equal(0);
    });
  });

  describe("Emergency Withdrawal", function () {
    it("Should allow owner to withdraw excess tokens", async function () {
      const { vesting, token, owner } = await loadFixture(deployVestingFixture);
      
      const vestingBalance = await token.balanceOf(await vesting.getAddress());
      const ownerBalanceBefore = await token.balanceOf(owner.address);
      
      await vesting.emergencyWithdraw(vestingBalance);
      
      const ownerBalanceAfter = await token.balanceOf(owner.address);
      expect(ownerBalanceAfter - ownerBalanceBefore).to.equal(vestingBalance);
    });

    it("Should fail if called by non-owner", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const amount = ethers.parseUnits("1000", 18);
      await expect(
        vesting.connect(beneficiary1).emergencyWithdraw(amount)
      ).to.be.revertedWithCustomError(vesting, "OwnableUnauthorizedAccount");
    });
  });

  describe("Multiple Beneficiaries", function () {
    it("Should handle multiple vesting schedules independently", async function () {
      const { vesting, beneficiary1, beneficiary2 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      // Create schedule for beneficiary1
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      // Create different schedule for beneficiary2
      await vesting.createVestingSchedule(
        beneficiary2.address,
        VESTING_AMOUNT / 2n,
        currentTime,
        6 * ONE_MONTH, // Different cliff
        ONE_YEAR, // Different duration
        false // Different revocability
      );
      
      const schedule1 = await vesting.vestingSchedules(beneficiary1.address);
      const schedule2 = await vesting.vestingSchedules(beneficiary2.address);
      
      expect(schedule1.totalAmount).to.equal(VESTING_AMOUNT);
      expect(schedule2.totalAmount).to.equal(VESTING_AMOUNT / 2n);
      expect(schedule1.cliffDuration).to.not.equal(schedule2.cliffDuration);
    });

    it("Should release tokens independently for each beneficiary", async function () {
      const { vesting, token, beneficiary1, beneficiary2 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        2 * ONE_YEAR,
        true
      );
      
      await vesting.createVestingSchedule(
        beneficiary2.address,
        VESTING_AMOUNT,
        currentTime,
        6 * ONE_MONTH,
        ONE_YEAR,
        true
      );
      
      // Move to where beneficiary2 can release but beneficiary1 cannot
      await time.increase(8 * ONE_MONTH);
      
      const releasable1 = await vesting.releasableAmount(beneficiary1.address);
      const releasable2 = await vesting.releasableAmount(beneficiary2.address);
      
      expect(releasable1).to.equal(0); // Still in cliff
      expect(releasable2).to.be.above(0); // Past cliff
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero cliff period", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        0, // No cliff
        ONE_YEAR,
        true
      );
      
      // Should be able to release immediately
      await time.increase(1); // Just 1 second
      
      const releasable = await vesting.releasableAmount(beneficiary1.address);
      expect(releasable).to.be.above(0);
    });

    it("Should handle very long vesting periods", async function () {
      const { vesting, beneficiary1 } = await loadFixture(deployVestingFixture);
      
      const currentTime = await time.latest();
      const tenYears = 10 * ONE_YEAR;
      
      await vesting.createVestingSchedule(
        beneficiary1.address,
        VESTING_AMOUNT,
        currentTime,
        ONE_YEAR,
        tenYears,
        true
      );
      
      // Move halfway through
      await time.increase(5 * ONE_YEAR);
      
      const releasable = await vesting.releasableAmount(beneficiary1.address);
      const expected = VESTING_AMOUNT / 2n;
      const tolerance = expected / 100n;
      
      expect(releasable).to.be.closeTo(expected, tolerance);
    });
  });
});
