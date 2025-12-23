# Deployment Guide - Nusantara Token

## Prerequisites

### 1. Environment Setup
- Node.js v18+ installed
- Hardhat installed (`npm install --save-dev hardhat`)
- OpenZeppelin contracts (`npm install @openzeppelin/contracts`)

### 2. Required Information
- [ ] Multisig address (Gnosis Safe recommended)
- [ ] Network RPC URL (Polygon, Base, Arbitrum, etc.)
- [ ] Deployer wallet private key (funded with native token for gas)
- [ ] Allocation wallet addresses (6 addresses total)

---

## Deployment Steps

### Phase 1: Testnet Deployment

#### Step 1.1: Configure Environment

Create `.env` file:
```bash
# Network Configuration
NETWORK=polygon-mumbai  # or base-goerli, arbitrum-goerli
RPC_URL=https://rpc-mumbai.maticvigil.com
CHAIN_ID=80001

# Deployer (akan pay gas fees)
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Block Explorer (for verification)
BLOCK_EXPLORER_API_KEY=your_polygonscan_api_key

# Multisig Address (Gnosis Safe)
MULTISIG_ADDRESS=0x...

# Allocation Addresses
COMMUNITY_REWARDS_ADDRESS=0x...
ECOSYSTEM_ADDRESS=0x...
LIQUIDITY_ADDRESS=0x...
TEAM_VESTING_ADDRESS=0x...  # Will be TokenVesting contract address
ADVISOR_VESTING_ADDRESS=0x... # Will be second TokenVesting contract address
TREASURY_ADDRESS=0x...      # Multisig recommended
```

#### Step 1.2: Deploy Vesting Contracts First

```bash
# Deploy Team Vesting Contract
npx hardhat run scripts/deploy-team-vesting.js --network polygon-mumbai

# Deploy Advisor Vesting Contract
npx hardhat run scripts/deploy-advisor-vesting.js --network polygon-mumbai
```

**Save the deployed vesting contract addresses!**

Update `.env`:
```bash
TEAM_VESTING_ADDRESS=0x...    # From deployment output
ADVISOR_VESTING_ADDRESS=0x... # From deployment output
```

#### Step 1.3: Deploy Main Token Contract

```bash
npx hardhat run scripts/deploy-token.js --network polygon-mumbai
```

**Expected output:**
```
Deploying NusantaraToken...
Constructor params:
  Admin (Multisig): 0x...
  Community Rewards: 0x...
  Ecosystem: 0x...
  Liquidity: 0x...
  Team Vesting: 0x...
  Advisor Vesting: 0x...
  Treasury: 0x...

Deployment tx: 0x...
NusantaraToken deployed to: 0x...
Gas used: 3,245,123

Verifying allocations...
✅ Community allocation: 350,000,000 NUSA
✅ Ecosystem allocation: 200,000,000 NUSA
✅ Liquidity allocation: 120,000,000 NUSA
✅ Team allocation: 150,000,000 NUSA
✅ Advisor allocation: 30,000,000 NUSA
✅ Treasury allocation: 150,000,000 NUSA
Total: 1,000,000,000 NUSA ✅

Deployment successful!
```

#### Step 1.4: Verify Contracts on Block Explorer

```bash
# Verify Token Contract
npx hardhat verify --network polygon-mumbai 0xTOKEN_ADDRESS \
  "0xMULTISIG" \
  "0xCOMMUNITY" \
  "0xECOSYSTEM" \
  "0xLIQUIDITY" \
  "0xTEAM_VESTING" \
  "0xADVISOR_VESTING" \
  "0xTREASURY"

# Verify Team Vesting Contract
npx hardhat verify --network polygon-mumbai 0xTEAM_VESTING_ADDRESS \
  "0xTOKEN_ADDRESS"

# Verify Advisor Vesting Contract
npx hardhat verify --network polygon-mumbai 0xADVISOR_VESTING_ADDRESS \
  "0xTOKEN_ADDRESS"
```

#### Step 1.5: Setup Vesting Schedules

**Team Vesting Setup:**

Create `scripts/setup-team-vesting.js`:
```javascript
// Example: 10 team members, 15M NUSA each
const teamMembers = [
  { address: "0xTeamMember1", amount: "15000000" },
  { address: "0xTeamMember2", amount: "15000000" },
  // ... add all team members
];

const CLIFF_DURATION = 365 * 24 * 60 * 60; // 12 months in seconds
const VESTING_DURATION = 730 * 24 * 60 * 60; // 24 months in seconds

// Execute via Gnosis Safe transaction
for (const member of teamMembers) {
  await vestingContract.createVestingSchedule(
    member.address,
    ethers.utils.parseEther(member.amount),
    CLIFF_DURATION,
    VESTING_DURATION,
    true // revocable
  );
}
```

Run:
```bash
npx hardhat run scripts/setup-team-vesting.js --network polygon-mumbai
```

**Advisor Vesting Setup:**

Same process dengan parameters berbeda:
- Cliff: 6 bulan (180 days)
- Vesting: 18 bulan (548 days)

#### Step 1.6: Deploy Airdrop Distributor (Optional)

```bash
npx hardhat run scripts/deploy-airdrop.js --network polygon-mumbai
```

#### Step 1.7: Testnet Testing Checklist

- [ ] Token minted dengan total supply correct (1B)
- [ ] Allocations distributed correctly
- [ ] Token transfer works
- [ ] Pause/unpause works (via multisig)
- [ ] Vesting cliff period enforced
- [ ] Vesting linear release works
- [ ] Burn function works
- [ ] All contracts verified on explorer

---

### Phase 2: Mainnet Deployment

#### Pre-Deployment Checklist

- [ ] Testnet thoroughly tested
- [ ] Audit completed & issues fixed
- [ ] Multisig setup & signers ready
- [ ] All allocation addresses confirmed (triple-check!)
- [ ] Deployer wallet funded (0.5-1 ETH equivalent for gas)
- [ ] Team legal approval
- [ ] Communications plan ready

#### Step 2.1: Final Environment Configuration

Create `.env.mainnet`:
```bash
NETWORK=polygon
RPC_URL=https://polygon-rpc.com
CHAIN_ID=137

DEPLOYER_PRIVATE_KEY=your_mainnet_deployer_key

# CRITICAL: Triple-check these addresses!
MULTISIG_ADDRESS=0x...
COMMUNITY_REWARDS_ADDRESS=0x...
ECOSYSTEM_ADDRESS=0x...
LIQUIDITY_ADDRESS=0x...
TREASURY_ADDRESS=0x...
```

#### Step 2.2: Dry Run Simulation

```bash
# Simulate deployment (doesn't actually deploy)
npx hardhat run scripts/deploy-token.js --network localhost
```

Verify simulation output matches expectations.

#### Step 2.3: Deploy to Mainnet

```bash
# Deploy vesting contracts first
npx hardhat run scripts/deploy-team-vesting.js --network polygon
npx hardhat run scripts/deploy-advisor-vesting.js --network polygon

# Update .env.mainnet with vesting addresses

# Deploy main token
npx hardhat run scripts/deploy-token.js --network polygon
```

**⚠️ CRITICAL: Save all deployment outputs immediately!**

Create deployment log:
```
Deployment Log - Mainnet
Date: [timestamp]
Network: Polygon
Deployer: 0x...
Gas Price: X gwei

Contract Addresses:
- NusantaraToken: 0x...
- TeamVesting: 0x...
- AdvisorVesting: 0x...
- AirdropDistributor: 0x...

Transaction Hashes:
- Token Deploy: 0x...
- Team Vesting Deploy: 0x...
- Advisor Vesting Deploy: 0x...

Verification Status:
- [ ] Token verified
- [ ] Team Vesting verified
- [ ] Advisor Vesting verified
```

#### Step 2.4: Verify All Contracts

```bash
npx hardhat verify --network polygon [addresses] [constructor params]
```

#### Step 2.5: Setup Vesting Schedules (via Multisig)

**IMPORTANT:** Mainnet vesting setup harus via Gnosis Safe (multisig), bukan EOA.

1. Go to Gnosis Safe UI
2. Create transaction batch:
   - Call `createVestingSchedule` for each team member
   - Call `createVestingSchedule` for each advisor
3. Get signatures from required signers (e.g., 4/7)
4. Execute transaction

#### Step 2.6: Transfer Ownership to Multisig

```bash
# Via Gnosis Safe, execute:
# tokenContract.grantRole(DEFAULT_ADMIN_ROLE, multisigAddress)
# tokenContract.renounceRole(DEFAULT_ADMIN_ROLE, deployerAddress)
```

#### Step 2.7: Post-Deployment Verification

Checklist:
- [ ] Token contract verified on Polygonscan
- [ ] Total supply = 1,000,000,000 NUSA
- [ ] Community address balance = 350M NUSA
- [ ] Ecosystem address balance = 200M NUSA
- [ ] Liquidity address balance = 120M NUSA
- [ ] Team vesting contract balance = 150M NUSA
- [ ] Advisor vesting contract balance = 30M NUSA
- [ ] Treasury address balance = 150M NUSA
- [ ] Ownership transferred to multisig
- [ ] Deployer has no admin rights
- [ ] Vesting schedules created for all team/advisors

---

## Phase 3: DEX Liquidity Setup

### Step 3.1: Prepare Liquidity

From liquidity allocation (120M NUSA):
- 60M NUSA for initial pool (50%)
- 60M NUSA vested over 12 months (50%)

**Token pair:** NUSA/USDC (recommended for stability)

**Initial liquidity example:**
- 60M NUSA
- $300K USDC (implied price: $0.005 per NUSA)

### Step 3.2: Create Uniswap V3 Pool (or PancakeSwap)

```bash
npx hardhat run scripts/create-pool.js --network polygon
```

Or manual via UI:
1. Go to Uniswap Interface
2. Select "Add Liquidity" → "Create Pool" (if doesn't exist)
3. Token A: NUSA (paste contract address)
4. Token B: USDC
5. Fee Tier: 0.3% (standard)
6. Set price range (e.g., $0.004 - $0.006)
7. Deposit amounts
8. Confirm transaction

**Save pool address!**

### Step 3.3: Add Liquidity to Pool

Via Gnosis Safe (from liquidity wallet):
1. Approve NUSA spend
2. Approve USDC spend
3. Add liquidity to pool

### Step 3.4: Lock LP Tokens (Optional but Recommended)

Options:
- **Unicrypt:** Lock LP tokens for 6-12 months
- **Team Finance:** Lock with vesting
- **Gnosis Safe:** Just hold in multisig (transparent)

---

## Phase 4: Post-Deployment Operations

### Step 4.1: Setup Monitoring

**On-chain monitoring:**
- OpenZeppelin Defender
- Tenderly
- Custom scripts (check balances, events)

**Setup alerts for:**
- Large transfers (>1M NUSA)
- Pause events
- Vesting releases
- Unusual activity

### Step 4.2: Create Token Info Sheet

```markdown
# NUSA Token Information

**Contract Address:** 0x...
**Name:** Nusantara Token
**Symbol:** NUSA
**Decimals:** 18
**Total Supply:** 1,000,000,000 NUSA
**Chain:** Polygon

**Official Links:**
- Website: https://...
- Twitter: https://twitter.com/...
- Telegram: https://t.me/...
- Docs: https://docs...

**DEX Pools:**
- Uniswap V3 (NUSA/USDC): 0x...
- QuickSwap (NUSA/MATIC): 0x...

**Verified Contract:** [Polygonscan link]
**Audit Report:** [Link to audit PDF]

**Tokenomics:**
- Community: 35%
- Ecosystem: 20%
- Liquidity: 12%
- Team: 15% (36-month vesting)
- Advisors: 3% (24-month vesting)
- Treasury: 15%

**Security:**
- Multisig: 4/7 Gnosis Safe
- Audit: [Firm name]
- Bug Bounty: [Link if any]
```

### Step 4.3: Submit to Aggregators (Next Phase)

See `09-LISTING-PREPARATION/aggregators/` for detailed guides.

---

## Emergency Procedures

### Scenario 1: Bug Discovered Pre-Launch

**Action:**
1. Do NOT deploy to mainnet
2. Fix bug in code
3. Re-audit if critical
4. Re-deploy to testnet
5. Extensive testing

### Scenario 2: Bug Discovered Post-Launch (Minor)

**Action:**
1. Assess severity
2. If minor & no exploit possible: document & plan v2
3. Communicate transparently to community

### Scenario 3: Critical Vulnerability Post-Launch

**Action:**
1. Emergency multisig meeting
2. Pause contract (if pausable)
3. Public announcement immediately
4. Coordinate with exchanges to halt trading
5. Plan migration/fix strategy
6. Engage audit firm for emergency review

---

## Gas Cost Estimates (Polygon Mainnet)

| Operation | Gas Limit | Estimated Cost (50 gwei) |
|-----------|-----------|-------------------------|
| Deploy Token | ~3,500,000 | ~0.175 MATIC |
| Deploy Vesting | ~2,000,000 | ~0.100 MATIC |
| Create Vesting Schedule | ~150,000 | ~0.0075 MATIC |
| Transfer Token | ~50,000 | ~0.0025 MATIC |
| Add Liquidity | ~200,000 | ~0.010 MATIC |

**Total Deployment Cost (estimate):** 0.5-1 MATIC (~$0.50-$1 at $1/MATIC)

For Ethereum mainnet: multiply by 100-200x (significantly higher).

---

## Post-Deployment Checklist

- [ ] All contracts deployed & verified
- [ ] Allocations correct
- [ ] Vesting schedules setup
- [ ] Ownership transferred to multisig
- [ ] Liquidity pool created & funded
- [ ] Monitoring setup
- [ ] Token info sheet published
- [ ] Team/legal approval
- [ ] Communications sent
- [ ] Documentation updated
- [ ] Backup of all deployment data
- [ ] Incident response plan ready

---

**Prepared by:** DevOps Lead  
**Last Updated:** December 22, 2025  
**Version:** 1.0
