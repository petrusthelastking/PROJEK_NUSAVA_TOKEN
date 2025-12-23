# 🚀 Quick Testing Guide

## Langkah-langkah Testing Token

### 1️⃣ Install Dependencies (Pertama Kali)

```bash
cd "c:\Peyimpanan Pribadi\BELAJAR BLOCKCHAIN\TOKEN 22-12-20025"
npm install
```

**Install testing libraries tambahan:**
```bash
npm install --save-dev merkletreejs keccak256
```

---

### 2️⃣ Run All Tests

```bash
# Test semua contracts
npm test
```

**Expected Output:**
```
  NusantaraToken
    Deployment
      ✓ Should set the correct name and symbol (523ms)
      ✓ Should set the correct decimals
      ✓ Should set the correct total supply
      ...
    
  50 passing (5s)

  TokenVesting
    Deployment
      ✓ Should set the correct token address
      ...
    
  40 passing (8s)

  AirdropDistributor
    Deployment
      ✓ Should set the correct token address
      ...
    
  45 passing (12s)

  ✨ 135 tests passed in 25s
```

---

### 3️⃣ Test Individual Contracts

```bash
# Test hanya NusantaraToken
npx hardhat test test/NusantaraToken.test.js

# Test hanya TokenVesting
npx hardhat test test/TokenVesting.test.js

# Test hanya AirdropDistributor
npx hardhat test test/AirdropDistributor.test.js
```

---

### 4️⃣ Test Coverage (Recommended!)

```bash
npm run test:coverage
```

**Akan generate report:**
```
File                       |  % Stmts | % Branch |  % Funcs |  % Lines |
---------------------------|----------|----------|----------|----------|
 contracts/                |      100 |    96.43 |      100 |      100 |
  NusantaraToken.sol       |      100 |    95.45 |      100 |      100 |
  TokenVesting.sol         |      100 |      100 |      100 |      100 |
  AirdropDistributor.sol   |      100 |    94.12 |      100 |      100 |
---------------------------|----------|----------|----------|----------|
```

**Coverage report saved to:** `coverage/index.html` (open di browser)

---

### 5️⃣ Gas Report (Opsional)

```bash
npm run test:gas
```

**Sample Output:**
```
·----------------------------------------|---------------------------|
|  Methods                               ·               Gas         │
·················|·······················|·········|·········|·······│
|  Contract      ·  Method               ·  Min    ·  Max    ·  Avg  │
·················|·······················|·········|·········|·······│
|  NusantaraToken·  transfer            ·  51234  ·  68234  ·  59500│
|  NusantaraToken·  approve             ·  46123  ·  46123  ·  46123│
|  NusantaraToken·  burn                ·  32456  ·  42456  ·  37500│
·················|·······················|·········|·········|·······│
```

---

### 6️⃣ Run Specific Test

```bash
# Test specific function
npx hardhat test --grep "Should transfer tokens"

# Test specific category
npx hardhat test --grep "Deployment"

# Test with verbose output
npx hardhat test --logs
```

---

## 🎯 What's Being Tested?

### NusantaraToken (50 tests)

✅ **Deployment:**
- Total supply = 1 billion NUSA
- Correct allocations (35%, 20%, 12%, 15%, 3%, 15%)
- Role assignments (admin, pauser, allocator)

✅ **Transfers:**
- Standard ERC-20 transfers
- Approval & transferFrom
- Events emitted correctly

✅ **Burning:**
- Users can burn own tokens
- Total supply decreases
- Cannot burn more than balance

✅ **Pausing:**
- Emergency pause/unpause
- Transfers blocked when paused
- Only PAUSER_ROLE can pause

✅ **Access Control:**
- Role-based permissions
- Admin can grant/revoke roles
- Unauthorized users blocked

✅ **Edge Cases:**
- Zero amount transfers
- Self-transfers
- Maximum uint256 values

---

### TokenVesting (40 tests)

✅ **Vesting Schedules:**
- Cliff period enforcement (12 months team, 6 months advisors)
- Linear vesting calculation
- Multiple beneficiaries

✅ **Token Release:**
- No release before cliff
- Partial release during vesting
- Full release after vesting end
- Multiple partial releases

✅ **Revocation:**
- Owner can revoke revocable schedules
- Vested tokens go to beneficiary
- Unvested tokens return to owner
- Cannot revoke non-revocable

✅ **Time-based:**
- 12-month cliff + 24-month vesting (team)
- 6-month cliff + 18-month vesting (advisors)
- Very long vesting periods

---

### AirdropDistributor (45 tests)

✅ **Merkle Proofs:**
- Valid proof → claim successful
- Invalid proof → rejected
- One-time claim (anti-sybil)

✅ **Campaign Management:**
- Create/pause/unpause campaigns
- Active time window enforcement
- Finalize & recover unclaimed tokens

✅ **Vested Airdrops:**
- Linear vesting over time
- Multiple partial releases
- Correct vested amount calculation

✅ **Multiple Campaigns:**
- Independent tracking
- Users can claim from multiple campaigns
- Different merkle roots per campaign

---

## 🔧 Troubleshooting

### Problem: Tests fail with "Cannot find module"

**Solution:**
```bash
npm install --save-dev @nomicfoundation/hardhat-toolbox merkletreejs keccak256
```

---

### Problem: "Error: invalid BigNumberish value"

**Cause:** Using regular numbers instead of BigInt

**Solution:**
```javascript
// ❌ Wrong
const amount = 1000;

// ✅ Correct
const amount = ethers.parseUnits("1000", 18);
```

---

### Problem: Coverage report shows low coverage

**Solution:**
```bash
# Clean cache
npx hardhat clean

# Recompile
npx hardhat compile

# Run coverage again
npm run test:coverage
```

---

### Problem: Tests timeout

**Solution:**
Edit `hardhat.config.js`:
```javascript
mocha: {
  timeout: 100000 // Increase to 100 seconds
}
```

---

### Problem: Gas costs too high

**Check gas report:**
```bash
npm run test:gas
```

**If gas too high:**
- Review contract logic
- Optimize storage usage
- Reduce loop iterations

---

## ✅ Pre-Deploy Checklist

Before deploying to mainnet:

- [ ] All 135+ tests passing
- [ ] Coverage >95% on all contracts
- [ ] Gas costs within acceptable range
- [ ] No compiler warnings
- [ ] Security tests passed:
  - [ ] Reentrancy prevention
  - [ ] Access control working
  - [ ] Pause mechanism functional
  - [ ] Zero address validation
- [ ] Edge cases covered
- [ ] Integration tests passed
- [ ] Testnet deployment successful
- [ ] Third-party audit completed

---

## 📊 Test Results Interpretation

### ✅ All Green (Passing)
```
  135 passing (25s)
```
**Meaning:** All tests successful, safe to proceed

---

### ⚠️ Some Yellow (Pending/Skipped)
```
  130 passing (25s)
  5 pending
```
**Meaning:** Some tests skipped (usually okay if intentional)

---

### ❌ Red (Failing)
```
  120 passing (18s)
  15 failing
```
**Meaning:** STOP! Fix failing tests before deploying

**Common failures:**
1. **AssertionError:** Expected value doesn't match actual
2. **Revert:** Transaction reverted (check error message)
3. **Timeout:** Test took too long (increase timeout)

---

## 🎓 Understanding Test Output

### Successful Test:
```
✓ Should transfer tokens between accounts (234ms)
```
- ✅ Green checkmark = passed
- (234ms) = execution time

### Failed Test:
```
1) Should prevent unauthorized access
   Error: Expected transaction to be reverted
```
- ❌ Red X = failed
- Error message explains why

### Gas Usage:
```
      Gas used for transfer: 59500
```
- Informational (from console.log in test)
- Compare to benchmarks

---

## 🚀 Next Steps After Testing

1. **All tests pass?**
   → Proceed to deployment guide

2. **Some tests fail?**
   → Review failing tests, fix issues, re-run

3. **Coverage <95%?**
   → Add more tests for uncovered code

4. **Gas costs too high?**
   → Optimize contracts, re-test

5. **Ready for mainnet?**
   → Follow deployment-guide.md
   → Get third-party audit first!

---

## 📞 Need Help?

**Check detailed testing docs:**
- `test/README.md` - Full testing documentation
- `04-TESTING/test-plan.md` - Comprehensive test plan
- `FAQ.md` - Common questions

**Still stuck?**
- Review test code comments
- Check Hardhat docs: https://hardhat.org/tutorial
- OpenZeppelin test helpers: https://docs.openzeppelin.com/

---

## 💡 Pro Tips

1. **Run tests frequently** during development
2. **Watch mode** for continuous testing:
   ```bash
   npx hardhat test --watch
   ```
3. **Focus on failing tests:**
   ```bash
   npx hardhat test --bail  # Stop on first failure
   ```
4. **Clean build if weird errors:**
   ```bash
   npx hardhat clean && npx hardhat compile
   ```
5. **Check gas before deploy:**
   ```bash
   npm run test:gas
   ```

---

**Happy Testing! 🎉**

Semua tests dirancang untuk memastikan token AMAN dan RELIABLE sebelum deploy ke mainnet.

**Last Updated:** December 23, 2025  
**Test Coverage:** 135+ test cases  
**Expected Runtime:** ~25 seconds
