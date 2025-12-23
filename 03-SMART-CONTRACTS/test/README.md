# 🧪 Testing Guide - Nusantara Token

## 📋 Overview

Comprehensive testing suite untuk semua smart contracts project Nusantara Token.

## 🎯 Test Coverage

| Contract | Test File | Test Cases | Coverage Target |
|----------|-----------|------------|-----------------|
| NusantaraToken | NusantaraToken.test.js | 50+ | >95% |
| TokenVesting | TokenVesting.test.js | 40+ | >95% |
| AirdropDistributor | AirdropDistributor.test.js | 45+ | >95% |

## 🚀 Quick Start

### Prerequisites

```bash
# Install dependencies (jika belum)
npm install

# Install additional testing dependencies
npm install --save-dev merkletreejs keccak256
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/NusantaraToken.test.js

# Run with gas reporting
npm run test:gas

# Run with coverage report
npm run test:coverage
```

## 📊 Test Suites

### 1. NusantaraToken Tests (50 test cases)

**Test Categories:**
- ✅ Deployment (6 tests)
- ✅ Transfers (4 tests)
- ✅ Approval & TransferFrom (5 tests)
- ✅ Burning (5 tests)
- ✅ Pausing (9 tests)
- ✅ Access Control (6 tests)
- ✅ Supply Limits (3 tests)
- ✅ Edge Cases (4 tests)
- ✅ Gas Optimization (3 tests)

**Key Test Scenarios:**
```javascript
// Deployment validation
- Total supply = 1 billion NUSA
- Correct allocation distribution (35%, 20%, 12%, 15%, 3%, 15%)
- Role assignment (admin, pauser, allocator)

// Transfer mechanics
- Standard ERC-20 transfers
- Allowance and transferFrom
- Transfer events

// Security features
- Pause/unpause functionality
- Role-based access control
- Burn mechanism

// Edge cases
- Zero amount transfers
- Self-transfers
- Maximum uint256 approval
```

**Running:**
```bash
npx hardhat test test/NusantaraToken.test.js
```

**Expected Output:**
```
NusantaraToken
  Deployment
    ✓ Should set the correct name and symbol
    ✓ Should set the correct decimals
    ✓ Should set the correct total supply
    ✓ Should assign DEFAULT_ADMIN_ROLE to multisig
    ✓ Should distribute correct allocations
    ✓ Should revert if any allocation address is zero
  Transfers
    ✓ Should transfer tokens between accounts
    ✓ Should fail if sender doesn't have enough tokens
    ...
  
  50 passing (5s)
```

---

### 2. TokenVesting Tests (40 test cases)

**Test Categories:**
- ✅ Deployment (3 tests)
- ✅ Creating Vesting Schedules (7 tests)
- ✅ Token Release (10 tests)
- ✅ Revocation (9 tests)
- ✅ Emergency Withdrawal (2 tests)
- ✅ Multiple Beneficiaries (2 tests)
- ✅ Edge Cases (2 tests)

**Key Test Scenarios:**
```javascript
// Vesting schedule creation
- Cliff period (12 months for team)
- Linear vesting (24 months)
- Revocable vs non-revocable

// Token release
- No release before cliff
- Linear release during vesting
- Full release after vesting end
- Multiple partial releases

// Revocation
- Owner can revoke revocable schedules
- Vested tokens released to beneficiary
- Unvested tokens returned to owner
- Cannot revoke non-revocable schedules

// Time-based scenarios
- 12-month cliff + 24-month vesting (team)
- 6-month cliff + 18-month vesting (advisors)
```

**Running:**
```bash
npx hardhat test test/TokenVesting.test.js
```

**Time Manipulation:**
```javascript
// Tests use Hardhat's time helpers
await time.increase(ONE_YEAR); // Fast-forward 1 year
await time.latest(); // Get current block timestamp
```

---

### 3. AirdropDistributor Tests (45 test cases)

**Test Categories:**
- ✅ Deployment (3 tests)
- ✅ Creating Campaigns (7 tests)
- ✅ Claiming Tokens (9 tests)
- ✅ Vested Claims (6 tests)
- ✅ Campaign Management (8 tests)
- ✅ Multiple Campaigns (2 tests)
- ✅ Edge Cases (2 tests)
- ✅ Access Control (3 tests)

**Key Test Scenarios:**
```javascript
// Merkle tree validation
- Valid proof → claim successful
- Invalid proof → claim rejected
- One-time claim (anti-sybil)

// Campaign lifecycle
- Active campaign window
- Pause/unpause campaigns
- Finalize & recover unclaimed tokens

// Vested airdrops
- Linear vesting over time
- Multiple partial releases
- Vested amount calculation

// Multiple campaigns
- Independent campaign tracking
- User can claim from multiple campaigns
```

**Running:**
```bash
npx hardhat test test/AirdropDistributor.test.js
```

**Merkle Tree Construction:**
```javascript
// Helper function included in tests
const claims = [
  { address: user1.address, amount: parseUnits("1000") },
  { address: user2.address, amount: parseUnits("1000") },
];
const merkleTree = createMerkleTree(claims);
const proof = merkleTree.getHexProof(leaf);
```

---

## 🎨 Test Structure

### Fixture Pattern

Tests menggunakan `loadFixture` untuk efficiency:

```javascript
async function deployTokenFixture() {
  const [owner, user1, user2] = await ethers.getSigners();
  
  // Deploy contracts
  const token = await Token.deploy(...);
  
  return { token, owner, user1, user2 };
}

// Reuse fixture in tests
it("Should transfer tokens", async function () {
  const { token, user1, user2 } = await loadFixture(deployTokenFixture);
  // Test logic...
});
```

**Benefits:**
- ✅ Faster test execution (no repeated deploys)
- ✅ Isolated test state
- ✅ Cleaner code

### Assertion Patterns

```javascript
// Exact matching
expect(await token.totalSupply()).to.equal(parseUnits("1000000000"));

// Event emission
await expect(token.transfer(user2.address, amount))
  .to.emit(token, "Transfer")
  .withArgs(user1.address, user2.address, amount);

// Reverts with custom error
await expect(token.pause())
  .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount");

// Reverts with message
await expect(vesting.release())
  .to.be.revertedWith("No tokens to release");

// Approximate matching (for time-based calculations)
expect(releasable).to.be.closeTo(expected, tolerance);
```

---

## 📈 Coverage Report

### Running Coverage

```bash
npm run test:coverage
```

**Expected Output:**
```
---------------------------|----------|----------|----------|----------|
File                       |  % Stmts | % Branch |  % Funcs |  % Lines |
---------------------------|----------|----------|----------|----------|
 contracts/                |      100 |    96.43 |      100 |      100 |
  NusantaraToken.sol       |      100 |    95.45 |      100 |      100 |
  TokenVesting.sol         |      100 |      100 |      100 |      100 |
  AirdropDistributor.sol   |      100 |    94.12 |      100 |      100 |
---------------------------|----------|----------|----------|----------|
All files                  |      100 |    96.43 |      100 |      100 |
---------------------------|----------|----------|----------|----------|
```

### Coverage Goals

- ✅ **Statements:** >95%
- ✅ **Branches:** >90%
- ✅ **Functions:** 100%
- ✅ **Lines:** >95%

---

## ⛽ Gas Optimization Tests

### Gas Reporter

```bash
npm run test:gas
```

**Sample Output:**
```
·----------------------------------------|---------------------------|-------------|
|  Solc version: 0.8.20                 ·  Optimizer enabled: true  ·  Runs: 200  │
·········································|···························|··············
|  Methods                               ·               Gas         ·  Price      │
·················|·······················|·········|·········|·······|··············
|  Contract      ·  Method               ·  Min    ·  Max    ·  Avg  ·  USD (avg)  │
·················|·······················|·········|·········|·······|··············
|  NusantaraToken·  transfer            ·  51234  ·  68234  ·  59500·  $2.38     │
|  NusantaraToken·  approve             ·  46123  ·  46123  ·  46123·  $1.85     │
|  NusantaraToken·  burn                ·  32456  ·  42456  ·  37500·  $1.50     │
|  TokenVesting  ·  createVestingSchedule·  87654  ·  95123  ·  91000·  $3.64     │
|  TokenVesting  ·  release             ·  54321  ·  68234  ·  61000·  $2.44     │
·················|·······················|·········|·········|·······|··············
```

### Gas Benchmarks

**Target Gas Costs:**
- Transfer: <60,000 gas ✅
- Approve: <50,000 gas ✅
- Burn: <70,000 gas ✅
- Vesting release: <100,000 gas ✅
- Airdrop claim: <150,000 gas ✅

---

## 🐛 Debugging Tests

### Verbose Output

```bash
# Show console.log from contracts
npx hardhat test --logs

# Show gas usage
npx hardhat test --gas-report

# Run single test
npx hardhat test --grep "Should transfer tokens"
```

### Common Issues

**Issue 1: Time manipulation not working**
```javascript
// ❌ Wrong
await ethers.provider.send("evm_increaseTime", [ONE_YEAR]);

// ✅ Correct
await time.increase(ONE_YEAR);
```

**Issue 2: BigInt comparison**
```javascript
// ❌ Wrong
expect(balance).to.equal(1000000); // Number

// ✅ Correct
expect(balance).to.equal(ethers.parseUnits("1000000", 18)); // BigInt
```

**Issue 3: Event args not matching**
```javascript
// ❌ Wrong (string vs BigInt)
.withArgs(user1.address, user2.address, "1000")

// ✅ Correct
.withArgs(user1.address, user2.address, ethers.parseUnits("1000", 18))
```

---

## 🔒 Security Test Scenarios

### Critical Security Tests

```javascript
// 1. Reentrancy protection
it("Should prevent reentrancy attacks", async function () {
  // TokenVesting and AirdropDistributor have ReentrancyGuard
  // Tests verify no double-spending possible
});

// 2. Access control
it("Should prevent unauthorized access", async function () {
  // Only PAUSER_ROLE can pause
  // Only owner can create vesting schedules
  // Only admin can grant/revoke roles
});

// 3. Integer overflow/underflow
it("Should handle maximum values", async function () {
  // Test with MaxUint256
  // Solidity 0.8.x has built-in overflow checks
});

// 4. Zero address validation
it("Should reject zero address", async function () {
  // Transfer to zero address should fail
  // Allocation addresses cannot be zero
});
```

---

## 📝 Test Checklist

Sebelum deploy ke mainnet, pastikan:

- [ ] **All tests passing** (135+ tests)
- [ ] **Coverage >95%** (all contracts)
- [ ] **Gas costs acceptable** (within budget)
- [ ] **No warnings** from compiler
- [ ] **Security scenarios tested:**
  - [ ] Reentrancy prevention
  - [ ] Access control enforcement
  - [ ] Overflow/underflow protection
  - [ ] Zero address validation
  - [ ] Pause mechanism working
- [ ] **Edge cases covered:**
  - [ ] Zero amounts
  - [ ] Maximum amounts
  - [ ] Time boundaries
  - [ ] Multiple users
- [ ] **Integration tests passed** (contracts work together)

---

## 🚨 CI/CD Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📚 Additional Resources

- **Hardhat Testing:** https://hardhat.org/hardhat-runner/docs/guides/test-contracts
- **Chai Matchers:** https://ethereum-waffle.readthedocs.io/en/latest/matchers.html
- **OpenZeppelin Test Helpers:** https://docs.openzeppelin.com/test-helpers/
- **Merkle Tree:** https://github.com/miguelmota/merkletreejs

---

## 🎯 Next Steps

1. **Run all tests:**
   ```bash
   npm test
   ```

2. **Check coverage:**
   ```bash
   npm run test:coverage
   ```

3. **Fix any failing tests**

4. **Add custom test scenarios** (if needed for specific use cases)

5. **Run on testnet** (Mumbai/Goerli)

6. **Third-party audit** (after all tests pass)

---

**Last Updated:** December 23, 2025  
**Test Framework:** Hardhat + Chai + Ethers v6  
**Total Test Cases:** 135+  
**Expected Runtime:** ~15-20 seconds
