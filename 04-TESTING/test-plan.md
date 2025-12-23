# Test Plan - Nusantara Token

## Overview

Comprehensive testing strategy untuk smart contracts NUSA token, covering:
- Unit tests (individual functions)
- Integration tests (contract interactions)
- Security tests (vulnerabilities)
- Scenario tests (real-world usage)

**Coverage Target:** >95%  
**Tools:** Hardhat, Foundry, Slither, Mythril

---

## 1. Unit Tests

### 1.1 NusantaraToken.sol Tests

#### Test Suite: Constructor & Deployment

```javascript
describe("NusantaraToken: Deployment", function () {
  it("Should deploy with correct name and symbol", async function () {
    expect(await token.name()).to.equal("Nusantara Token");
    expect(await token.symbol()).to.equal("NUSA");
  });
  
  it("Should set total supply to 1 billion", async function () {
    const totalSupply = await token.totalSupply();
    expect(totalSupply).to.equal(ethers.utils.parseEther("1000000000"));
  });
  
  it("Should distribute allocations correctly", async function () {
    const communityBalance = await token.balanceOf(communityAddress);
    expect(communityBalance).to.equal(ethers.utils.parseEther("350000000"));
    
    const ecosystemBalance = await token.balanceOf(ecosystemAddress);
    expect(ecosystemBalance).to.equal(ethers.utils.parseEther("200000000"));
    
    // ... test all allocations
  });
  
  it("Should grant admin role to multisig", async function () {
    const adminRole = await token.DEFAULT_ADMIN_ROLE();
    expect(await token.hasRole(adminRole, multisigAddress)).to.be.true;
  });
  
  it("Should revert if admin address is zero", async function () {
    await expect(
      NusantaraToken.deploy(
        ethers.constants.AddressZero,
        communityAddress,
        ecosystemAddress,
        liquidityAddress,
        teamVestingAddress,
        advisorVestingAddress,
        treasuryAddress
      )
    ).to.be.revertedWith("Admin cannot be zero address");
  });
});
```

#### Test Suite: Transfer Functions

```javascript
describe("NusantaraToken: Transfers", function () {
  it("Should transfer tokens between accounts", async function () {
    await token.connect(communityWallet).transfer(user1.address, 1000);
    expect(await token.balanceOf(user1.address)).to.equal(1000);
  });
  
  it("Should fail if sender doesn't have enough tokens", async function () {
    await expect(
      token.connect(user1).transfer(user2.address, 10000)
    ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
  });
  
  it("Should update balances after transfer", async function () {
    const initialBalance1 = await token.balanceOf(user1.address);
    const initialBalance2 = await token.balanceOf(user2.address);
    
    await token.connect(user1).transfer(user2.address, 100);
    
    expect(await token.balanceOf(user1.address)).to.equal(initialBalance1 - 100);
    expect(await token.balanceOf(user2.address)).to.equal(initialBalance2 + 100);
  });
  
  it("Should emit Transfer event", async function () {
    await expect(token.connect(user1).transfer(user2.address, 100))
      .to.emit(token, "Transfer")
      .withArgs(user1.address, user2.address, 100);
  });
});
```

#### Test Suite: Pause Functionality

```javascript
describe("NusantaraToken: Pausable", function () {
  it("Should pause transfers when paused", async function () {
    await token.connect(multisig).pause("Emergency test");
    
    await expect(
      token.connect(user1).transfer(user2.address, 100)
    ).to.be.revertedWith("Pausable: paused");
  });
  
  it("Should unpause and allow transfers", async function () {
    await token.connect(multisig).pause("Test");
    await token.connect(multisig).unpause();
    
    await expect(
      token.connect(user1).transfer(user2.address, 100)
    ).to.not.be.reverted;
  });
  
  it("Should only allow PAUSER_ROLE to pause", async function () {
    await expect(
      token.connect(user1).pause("Unauthorized")
    ).to.be.reverted; // AccessControl error
  });
  
  it("Should emit EmergencyPause event", async function () {
    await expect(token.connect(multisig).pause("Emergency"))
      .to.emit(token, "EmergencyPause")
      .withArgs(multisig.address, "Emergency");
  });
});
```

#### Test Suite: Burn Functionality

```javascript
describe("NusantaraToken: Burn", function () {
  it("Should allow users to burn their own tokens", async function () {
    const initialSupply = await token.totalSupply();
    const burnAmount = ethers.utils.parseEther("1000");
    
    await token.connect(communityWallet).burn(burnAmount);
    
    expect(await token.totalSupply()).to.equal(initialSupply.sub(burnAmount));
  });
  
  it("Should decrease user balance after burn", async function () {
    const initialBalance = await token.balanceOf(user1.address);
    await token.connect(user1).burn(100);
    
    expect(await token.balanceOf(user1.address)).to.equal(initialBalance - 100);
  });
  
  it("Should fail if burn amount exceeds balance", async function () {
    await expect(
      token.connect(user1).burn(ethers.utils.parseEther("99999999"))
    ).to.be.revertedWith("ERC20: burn amount exceeds balance");
  });
});
```

---

### 1.2 TokenVesting.sol Tests

#### Test Suite: Vesting Schedule Creation

```javascript
describe("TokenVesting: Create Schedule", function () {
  const CLIFF_DURATION = 365 * 24 * 60 * 60; // 1 year
  const VESTING_DURATION = 730 * 24 * 60 * 60; // 2 years
  const AMOUNT = ethers.utils.parseEther("15000000"); // 15M tokens
  
  it("Should create vesting schedule", async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true // revocable
    );
    
    const schedule = await vesting.getVestingSchedule(beneficiary1.address);
    expect(schedule.totalAmount).to.equal(AMOUNT);
  });
  
  it("Should increment totalVested", async function () {
    const initialVested = await vesting.totalVested();
    
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true
    );
    
    expect(await vesting.totalVested()).to.equal(initialVested.add(AMOUNT));
  });
  
  it("Should revert if schedule already exists", async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true
    );
    
    await expect(
      vesting.createVestingSchedule(
        beneficiary1.address,
        AMOUNT,
        CLIFF_DURATION,
        VESTING_DURATION,
        true
      )
    ).to.be.revertedWith("Vesting already exists");
  });
  
  it("Should revert if amount is zero", async function () {
    await expect(
      vesting.createVestingSchedule(
        beneficiary1.address,
        0,
        CLIFF_DURATION,
        VESTING_DURATION,
        true
      )
    ).to.be.revertedWith("Amount must be greater than 0");
  });
});
```

#### Test Suite: Cliff Period

```javascript
describe("TokenVesting: Cliff Period", function () {
  beforeEach(async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true
    );
  });
  
  it("Should return zero vested during cliff", async function () {
    const vestedAmount = await vesting.vestedAmount(beneficiary1.address);
    expect(vestedAmount).to.equal(0);
  });
  
  it("Should return zero releasable during cliff", async function () {
    const releasable = await vesting.releasableAmount(beneficiary1.address);
    expect(releasable).to.equal(0);
  });
  
  it("Should revert if trying to release during cliff", async function () {
    await expect(
      vesting.release(beneficiary1.address)
    ).to.be.revertedWith("No tokens to release");
  });
  
  it("Should allow release after cliff ends", async function () {
    // Fast forward time to end of cliff
    await ethers.provider.send("evm_increaseTime", [CLIFF_DURATION + 1]);
    await ethers.provider.send("evm_mine");
    
    const releasable = await vesting.releasableAmount(beneficiary1.address);
    expect(releasable).to.be.gt(0);
  });
});
```

#### Test Suite: Linear Vesting

```javascript
describe("TokenVesting: Linear Release", function () {
  beforeEach(async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true
    );
    
    // Fast forward past cliff
    await ethers.provider.send("evm_increaseTime", [CLIFF_DURATION]);
    await ethers.provider.send("evm_mine");
  });
  
  it("Should vest linearly after cliff", async function () {
    // After 25% of vesting period
    const quarterVesting = VESTING_DURATION / 4;
    await ethers.provider.send("evm_increaseTime", [quarterVesting]);
    await ethers.provider.send("evm_mine");
    
    const vestedAmount = await vesting.vestedAmount(beneficiary1.address);
    const expectedVested = AMOUNT.mul(25).div(100); // ~25%
    
    // Allow 1% tolerance for time precision
    expect(vestedAmount).to.be.closeTo(expectedVested, AMOUNT.div(100));
  });
  
  it("Should release all tokens after vesting ends", async function () {
    // Fast forward to end of vesting
    await ethers.provider.send("evm_increaseTime", [VESTING_DURATION]);
    await ethers.provider.send("evm_mine");
    
    const vestedAmount = await vesting.vestedAmount(beneficiary1.address);
    expect(vestedAmount).to.equal(AMOUNT);
  });
  
  it("Should transfer tokens on release", async function () {
    await ethers.provider.send("evm_increaseTime", [VESTING_DURATION / 2]);
    await ethers.provider.send("evm_mine");
    
    const releasableBefore = await vesting.releasableAmount(beneficiary1.address);
    await vesting.release(beneficiary1.address);
    
    const beneficiaryBalance = await token.balanceOf(beneficiary1.address);
    expect(beneficiaryBalance).to.equal(releasableBefore);
  });
});
```

#### Test Suite: Revocation

```javascript
describe("TokenVesting: Revocation", function () {
  it("Should revoke vesting if revocable", async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true // revocable
    );
    
    await vesting.revoke(beneficiary1.address);
    
    const schedule = await vesting.getVestingSchedule(beneficiary1.address);
    expect(schedule.revoked).to.be.true;
  });
  
  it("Should release vested amount before revocation", async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true
    );
    
    // Fast forward to 50% vesting
    await ethers.provider.send("evm_increaseTime", [CLIFF_DURATION + VESTING_DURATION / 2]);
    await ethers.provider.send("evm_mine");
    
    await vesting.revoke(beneficiary1.address);
    
    const beneficiaryBalance = await token.balanceOf(beneficiary1.address);
    expect(beneficiaryBalance).to.be.gt(0);
    expect(beneficiaryBalance).to.be.closeTo(AMOUNT.div(2), AMOUNT.div(20));
  });
  
  it("Should return unvested tokens to owner", async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      true
    );
    
    const ownerBalanceBefore = await token.balanceOf(owner.address);
    
    await vesting.revoke(beneficiary1.address);
    
    const ownerBalanceAfter = await token.balanceOf(owner.address);
    expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
  });
  
  it("Should fail if vesting is not revocable", async function () {
    await vesting.createVestingSchedule(
      beneficiary1.address,
      AMOUNT,
      CLIFF_DURATION,
      VESTING_DURATION,
      false // NOT revocable
    );
    
    await expect(
      vesting.revoke(beneficiary1.address)
    ).to.be.revertedWith("Vesting is not revocable");
  });
});
```

---

### 1.3 AirdropDistributor.sol Tests

#### Test Suite: Campaign Creation

```javascript
describe("AirdropDistributor: Campaign", function () {
  const TOTAL_AMOUNT = ethers.utils.parseEther("50000000"); // 50M tokens
  const START_TIME = Math.floor(Date.now() / 1000) + 86400; // +1 day
  const END_TIME = START_TIME + 30 * 86400; // +30 days
  const VESTING_DURATION = 90 * 86400; // 90 days
  
  it("Should create campaign with merkle root", async function () {
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
    
    await airdrop.createCampaign(
      merkleRoot,
      TOTAL_AMOUNT,
      START_TIME,
      END_TIME,
      VESTING_DURATION
    );
    
    const campaign = await airdrop.campaigns(0);
    expect(campaign.merkleRoot).to.equal(merkleRoot);
    expect(campaign.totalAmount).to.equal(TOTAL_AMOUNT);
  });
  
  it("Should transfer tokens to contract", async function () {
    const merkleRoot = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
    const contractBalanceBefore = await token.balanceOf(airdrop.address);
    
    await airdrop.createCampaign(
      merkleRoot,
      TOTAL_AMOUNT,
      START_TIME,
      END_TIME,
      VESTING_DURATION
    );
    
    const contractBalanceAfter = await token.balanceOf(airdrop.address);
    expect(contractBalanceAfter).to.equal(contractBalanceBefore.add(TOTAL_AMOUNT));
  });
});
```

---

## 2. Integration Tests

### 2.1 Full Lifecycle Test

```javascript
describe("Integration: Full Token Lifecycle", function () {
  it("Should complete full deployment → vesting → distribution flow", async function () {
    // 1. Deploy token
    const token = await NusantaraToken.deploy(...);
    
    // 2. Create vesting schedules
    await teamVesting.createVestingSchedule(...);
    
    // 3. Fast forward past cliff
    await ethers.provider.send("evm_increaseTime", [CLIFF_DURATION]);
    
    // 4. Release vested tokens
    await teamVesting.release(teamMember1.address);
    
    // 5. Team member transfers to user
    await token.connect(teamMember1).transfer(user1.address, AMOUNT);
    
    // 6. User burns tokens
    await token.connect(user1).burn(100);
    
    // Verify final state
    expect(await token.totalSupply()).to.be.lt(INITIAL_SUPPLY);
  });
});
```

---

## 3. Security Tests

### 3.1 Reentrancy Attack

```javascript
describe("Security: Reentrancy", function () {
  it("Should prevent reentrancy on release", async function () {
    // Deploy malicious contract
    const attacker = await MaliciousReentrancy.deploy(vesting.address);
    
    // Setup vesting for attacker
    await vesting.createVestingSchedule(...);
    
    // Attempt reentrancy attack
    await expect(
      attacker.attack()
    ).to.be.reverted; // ReentrancyGuard should prevent
  });
});
```

### 3.2 Access Control

```javascript
describe("Security: Access Control", function () {
  it("Should prevent unauthorized pause", async function () {
    await expect(
      token.connect(attacker).pause("Hack")
    ).to.be.reverted;
  });
  
  it("Should prevent unauthorized vesting creation", async function () {
    await expect(
      vesting.connect(attacker).createVestingSchedule(...)
    ).to.be.reverted;
  });
});
```

---

## 4. Gas Optimization Tests

```javascript
describe("Gas Optimization", function () {
  it("Should use acceptable gas for transfer", async function () {
    const tx = await token.transfer(user1.address, 1000);
    const receipt = await tx.wait();
    
    expect(receipt.gasUsed).to.be.lt(100000); // <100k gas
  });
  
  it("Should use acceptable gas for vesting release", async function () {
    const tx = await vesting.release(beneficiary1.address);
    const receipt = await tx.wait();
    
    expect(receipt.gasUsed).to.be.lt(200000);
  });
});
```

---

## 5. Coverage Report

Run coverage:
```bash
npx hardhat coverage
```

**Target:**
- **Statements:** >95%
- **Branches:** >90%
- **Functions:** >95%
- **Lines:** >95%

---

## 6. Static Analysis

### Slither

```bash
slither contracts/NusantaraToken.sol --print human-summary
```

**Check for:**
- Reentrancy vulnerabilities
- Unprotected functions
- Integer overflow/underflow (should not occur with Solidity 0.8+)

### Mythril

```bash
myth analyze contracts/NusantaraToken.sol
```

---

**Prepared by:** Security Lead  
**Version:** 1.0  
**Status:** Ready for Implementation
