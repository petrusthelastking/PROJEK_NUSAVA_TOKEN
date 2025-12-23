# 🚀 QUICK START GUIDE - 15 Menit Setup

Panduan cepat untuk memulai project Nusantara Token dalam 15 menit.

---

## ⚡ Prerequisites (5 menit)

### 1. Install Node.js
```bash
# Download dari: https://nodejs.org/ (v18+)
node --version  # Check: v18.0.0 or higher
npm --version   # Check: v9.0.0 or higher
```

### 2. Install Git
```bash
# Download dari: https://git-scm.com/
git --version  # Check installed
```

### 3. Prepare Wallets
- [ ] Buat Gnosis Safe (multisig): https://app.safe.global/
- [ ] Buat 6 wallet addresses (untuk allocations)
- [ ] Simpan semua addresses (JANGAN HILANG!)

---

## 📦 Installation (3 menit)

### Step 1: Navigate to Project
```bash
cd "c:\Peyimpanan Pribadi\BELAJAR BLOCKCHAIN\TOKEN 22-12-20025\03-SMART-CONTRACTS"
```

### Step 2: Install Dependencies
```bash
npm install
```

**Expected output:**
```
added 324 packages in 45s
```

---

## ⚙️ Configuration (5 menit)

### Step 1: Copy Environment File
```bash
# Windows PowerShell
copy .env.example .env

# Windows CMD
copy .env.example .env

# Git Bash / WSL
cp .env.example .env
```

### Step 2: Edit .env File
Buka file `.env` dengan text editor (Notepad++, VS Code, dll)

**Minimal configuration untuk testing:**
```bash
# Deployer (use any test wallet private key)
DEPLOYER_PRIVATE_KEY=0x...your_test_private_key...

# For local testing, you can use any addresses
# Example: Use Hardhat default accounts
MULTISIG_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
COMMUNITY_REWARDS_ADDRESS=0x70997970C51812dc3A010C7d01b50e0d17dc79C8
ECOSYSTEM_ADDRESS=0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
LIQUIDITY_ADDRESS=0x90F79bf6EB2c4f870365E785982E1f101E93b906
TEAM_VESTING_ADDRESS=0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
ADVISOR_VESTING_ADDRESS=0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
TREASURY_ADDRESS=0x976EA74026E726554dB657fA54763abd0C3a0aa9
```

**For testnet deployment:**
- Get Mumbai MATIC faucet: https://faucet.polygon.technology/
- Use real wallet addresses (NOT Hardhat defaults)

---

## 🧪 Testing (2 menit)

### Step 1: Compile Contracts
```bash
npm run compile
```

**Expected output:**
```
Compiled 15 Solidity files successfully
```

### Step 2: Run Tests
```bash
npm run test
```

**Expected output:**
```
  NusantaraToken
    ✔ Should deploy with correct name
    ✔ Should set total supply
    ... (more tests)
    
  68 passing (5s)
```

### Step 3 (Optional): Coverage
```bash
npm run test:coverage
```

---

## 🎯 NEXT STEPS

### Option A: Quick Demo (Local Testing)
```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy to local
npx hardhat run scripts/deploy-token.js --network localhost
```

### Option B: Testnet Deployment
1. **Fund deployer wallet** with Mumbai MATIC
2. **Update .env** with real addresses
3. **Deploy:**
   ```bash
   npm run deploy:testnet
   ```
4. **Verify contract:**
   ```bash
   npx hardhat verify --network polygon-mumbai [CONTRACT_ADDRESS] [CONSTRUCTOR_ARGS]
   ```

### Option C: Full Production Flow
**Follow comprehensive guides:**
1. [Deployment Guide](../06-DEPLOYMENT/deployment-guide.md)
2. [Testing Guide](../04-TESTING/test-plan.md)
3. [Compliance Checklist](../08-LEGAL-COMPLIANCE/compliance-checklist.md)

---

## 📚 Documentation Map

| What You Need | Document |
|---------------|----------|
| **Overview** | [README.md](../README.md) |
| **Implementation Summary** | [IMPLEMENTATION-SUMMARY.md](../IMPLEMENTATION-SUMMARY.md) |
| **Tokenomics** | [tokenomics-design.md](../02-TOKENOMICS/tokenomics-design.md) |
| **Smart Contracts** | [contracts/](contracts/) |
| **Deployment** | [deployment-guide.md](../06-DEPLOYMENT/deployment-guide.md) |
| **Legal** | [compliance-checklist.md](../08-LEGAL-COMPLIANCE/compliance-checklist.md) |
| **Listing** | [cmc-submission-guide.md](../09-LISTING-PREPARATION/aggregators/coinmarketcap/cmc-submission-guide.md) |

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error: "Invalid private key"
```bash
# Solution: Check .env file
# Private key must start with 0x
# Example: DEPLOYER_PRIVATE_KEY=0x1234...
```

### Error: "Insufficient funds for gas"
```bash
# Solution: Fund your deployer wallet
# Testnet faucet: https://faucet.polygon.technology/
# Mainnet: Buy MATIC from exchange
```

### Tests failing
```bash
# Solution: Check Node.js version
node --version  # Must be v18+

# Update if needed
# Download from: https://nodejs.org/
```

---

## ✅ Checklist

### Before Testing:
- [ ] Node.js 18+ installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created
- [ ] Contracts compiled successfully

### Before Testnet:
- [ ] Deployer wallet has testnet tokens
- [ ] All addresses in `.env` are valid
- [ ] Tests passing
- [ ] Contract verification API key set

### Before Mainnet:
- [ ] Legal review completed ⚠️
- [ ] Audit completed ⚠️
- [ ] Tested on testnet thoroughly
- [ ] All addresses verified (IRREVERSIBLE!)
- [ ] Multisig signers ready
- [ ] Team approval obtained

---

## 🎉 You're Ready!

Time to complete: **~15 minutes**

Next action:
1. ✅ Run tests to verify setup
2. 📖 Read [IMPLEMENTATION-SUMMARY.md](../IMPLEMENTATION-SUMMARY.md)
3. 🎯 Decide: Local demo, Testnet, or Mainnet?

---

**Questions?** Check comprehensive guides in each folder.

**Need help?** Review inline comments in smart contracts.

**Ready to deploy?** Follow [deployment-guide.md](../06-DEPLOYMENT/deployment-guide.md)

🚀 **Happy Building!**
