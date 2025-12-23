# Tokenomics Design - PT Nusantara Digital Ventura Token

**Token Name:** Nusantara Token (placeholder - final naming di workshop)  
**Ticker:** NUSA (placeholder)  
**Standard:** ERC-20  
**Blockchain:** [TBD - Polygon/Base/Arbitrum]  
**Total Supply:** 1,000,000,000 NUSA (1 Billion - Fixed Supply)

---

## 1. Design Philosophy

### Core Principles:
✅ **Utility-First:** Token memiliki kegunaan jelas, bukan spekulasi  
✅ **Sustainable Economics:** Emission rate terkontrol, tidak inflasi berlebihan  
✅ **Fair Distribution:** Tidak ada "whale dominance", distribusi merata  
✅ **Long-term Aligned:** Vesting ketat untuk team & advisors  
✅ **Transparent:** Semua alokasi dan vesting public & on-chain  

### Anti-Patterns (Yang Kami Hindari):
❌ Unlimited supply / arbitrary mint  
❌ Team allocation >20% without vesting  
❌ Liquidity <5% (risk: price manipulation)  
❌ Burn yang tidak masuk akal (artificial scarcity)  
❌ Complicated tokenomics (user bingung)  

---

## 2. Token Allocation

### Total Supply: 1,000,000,000 NUSA

| Allocation | Amount | Percentage | Vesting | Unlock Schedule |
|------------|--------|------------|---------|-----------------|
| **Community & Rewards** | 350,000,000 | 35% | Gradual | 36-48 bulan emission |
| **Ecosystem & Partnerships** | 200,000,000 | 20% | Gradual | 24-36 bulan |
| **Liquidity & Market Ops** | 120,000,000 | 12% | Partial | 50% TGE, 50% vesting 12 bulan |
| **Team** | 150,000,000 | 15% | Strict | 12 bulan cliff, 24 bulan linear |
| **Advisors** | 30,000,000 | 3% | Strict | 6 bulan cliff, 18 bulan linear |
| **Treasury** | 150,000,000 | 15% | Governed | Multisig, proposal-based |

**Total:** 1,000,000,000 NUSA (100%)

---

## 3. Allocation Breakdown & Justification

### A. Community & Rewards (35% - 350M NUSA)

**Purpose:** Mendorong user engagement, growth, dan retention.

#### Sub-Allocation:
- **User Engagement Rewards:** 150M (15%)
  - Transaction rewards
  - Activity milestones
  - Content creation incentives
  
- **Referral Program:** 80M (8%)
  - Referrer rewards
  - Referee welcome bonus
  - Tiered referral bonuses

- **Loyalty & Staking Rewards:** 70M (7%)
  - Loyalty tier benefits
  - Staking APY (if applicable)

- **Community Events:** 50M (5%)
  - Airdrop campaigns
  - Contests & challenges
  - Community initiatives

#### Emission Schedule:
- **Year 1:** 100M NUSA (28.5% of allocation)
- **Year 2:** 100M NUSA (28.5%)
- **Year 3:** 90M NUSA (25.7%)
- **Year 4:** 60M NUSA (17.1%)

**Rationale:** Front-loaded untuk bootstrap network effect, tapi tidak terlalu aggressive untuk avoid dump.

---

### B. Ecosystem & Partnerships (20% - 200M NUSA)

**Purpose:** Onboarding partner, merchant, dan integrasi strategis.

#### Sub-Allocation:
- **Partner Incentives:** 100M (10%)
  - Partner onboarding grants
  - Co-marketing campaigns
  - Integration subsidies

- **Strategic Partnerships:** 60M (6%)
  - Exchange partnerships
  - Infrastructure providers
  - Service integrations

- **Developer Grants:** 40M (4%)
  - API usage incentives
  - Third-party app development
  - Open-source contributions

#### Emission Schedule:
- **Year 1:** 60M NUSA (30%)
- **Year 2:** 70M NUSA (35%)
- **Year 3:** 70M NUSA (35%)

**Rationale:** Partnership takes time, gradual release sesuai deal milestone.

---

### C. Liquidity & Market Operations (12% - 120M NUSA)

**Purpose:** Memastikan token tradable dengan minimal slippage.

#### Sub-Allocation:
- **Initial DEX Liquidity:** 60M (6%)
  - Uniswap/PancakeSwap LP
  - Release: 50% TGE, 50% vesting 12 bulan

- **CEX Liquidity Support:** 30M (3%)
  - CEX listing deposits
  - Market making support

- **Liquidity Mining Incentives:** 30M (3%)
  - LP rewards untuk incentivize providers
  - Release: gradual 24 bulan

#### Unlock Schedule:
- **TGE:** 60M (50% dari allocation)
- **Month 1-12:** 5M per bulan (linear unlock)

**Rationale:** Liquidity krusial untuk user trust, tapi excess unlock bisa dump price.

---

### D. Team (15% - 150M NUSA)

**Purpose:** Align team dengan long-term success.

#### Vesting:
- **Cliff:** 12 bulan (no unlock sama sekali di tahun pertama)
- **Linear Vesting:** 24 bulan setelah cliff
- **Total Vesting Period:** 36 bulan

#### Example Unlock:
- **Month 0-12:** 0 NUSA (cliff)
- **Month 13:** 6.25M NUSA (unlock pertama)
- **Month 14-36:** 6.25M per bulan (linear)

**Team Size Assumption:** 10-15 orang  
**Per Person (avg):** 10M - 15M NUSA  

**Rationale:** Cliff ketat untuk prevent early exit. Vesting 3 tahun = commitment.

---

### E. Advisors (3% - 30M NUSA)

**Purpose:** Kompensasi advisor untuk expertise (legal, marketing, technical).

#### Vesting:
- **Cliff:** 6 bulan
- **Linear Vesting:** 18 bulan setelah cliff
- **Total Vesting Period:** 24 bulan

#### Advisor Allocation (example):
- Legal Advisor: 10M NUSA
- Marketing Advisor: 10M NUSA
- Technical Advisor: 10M NUSA

**Rationale:** Advisor biasanya part-time, jadi vesting lebih pendek vs team.

---

### F. Treasury (15% - 150M NUSA)

**Purpose:** Reserve untuk kebutuhan strategis yang tidak terprediksi.

#### Use Cases:
- Emergency liquidity injection
- Unexpected partnerships
- Buyback program (optional)
- Grant programs belum terprediksi

#### Governance:
- **Control:** Multisig (4/7)
- **Spending:** Proposal-based (community input)
- **Transparency:** Quarterly report untuk semua movement

**Rationale:** Flexibility untuk adapt strategy, tapi tidak sembarangan dipakai.

---

## 4. Token Emission Model

### Circulating Supply Projection (4 Years)

| Timeline | Community | Ecosystem | Liquidity | Team | Advisors | Treasury | **Total Circulating** |
|----------|-----------|-----------|-----------|------|----------|----------|-----------------------|
| **TGE** | 0 | 0 | 60M | 0 | 0 | 0 | **60M (6%)** |
| **Month 6** | 50M | 30M | 75M | 0 | 5M | 10M | **170M (17%)** |
| **Year 1** | 100M | 60M | 90M | 0 | 12.5M | 25M | **287.5M (28.75%)** |
| **Year 2** | 200M | 130M | 120M | 75M | 25M | 50M | **600M (60%)** |
| **Year 3** | 290M | 200M | 120M | 150M | 30M | 100M | **890M (89%)** |
| **Year 4** | 350M | 200M | 120M | 150M | 30M | 150M | **1,000M (100%)** |

**Key Observations:**
- **TGE circulating:** 6% (conservative, anti-dump)
- **Year 1 circulating:** 28.75% (moderate unlock)
- **Year 2 circulating:** 60% (team unlock mulai)
- **Year 4:** Fully circulating

---

## 5. Token Utility Recap

### Primary Utilities (MVP):

#### 1. **Engagement Rewards**
- User earn token untuk aktivitas produktif
- Redemption: fee discount, premium access

#### 2. **Referral Incentives**
- Earn token untuk invite new user
- Tiered bonuses untuk active referrals

#### 3. **Loyalty Tiers**
- Hold/stake token → unlock tier benefits
- Tiers: Bronze, Silver, Gold, Platinum

#### 4. **Fee Discounts**
- Pay platform fee dengan token → discount 10-20%

#### 5. **Premium Access**
- Hold min threshold → unlock premium features

### Secondary Utilities (Future):

#### 6. **Governance (Limited)**
- Vote untuk product features
- Community proposals

#### 7. **Partner Campaigns**
- Partner use token untuk marketing budget

---

## 6. Burn Mechanism (Optional, Defensible)

### Approach: **Buyback & Burn** (Conditional)

**Trigger:**
- Platform revenue above threshold
- Quarterly basis
- % of profit untuk buyback token dari market → burn

**Rationale:**
- Deflationary pressure (balance emission)
- Reward holders (supply reduction)
- Transparent: on-chain proof of burn

**Limitation:**
- NOT main value prop (utility tetap prioritas)
- Only jika revenue healthy (not forced)

**Alternative Burn Sources:**
- Transaction fee paid in token → X% burned
- Premium feature payment → Y% burned

---

## 7. Price Stability Mechanisms

### Challenge:
Token volatility bisa impact utility (fee discount tidak predictable, tier threshold berubah).

### Mitigations:

#### A. **Oracle-Based Pricing**
- Use Chainlink/API3 untuk fiat-equivalent pricing
- Example: Fee = $10 → calculate NUSA equivalent at current price
- User predictability: fee in dollar terms, token just payment method

#### B. **Moving Average Pricing**
- Use 7-day atau 30-day MA untuk reduce short-term spike impact
- Example: Loyalty tier threshold = hold 1000 NUSA (30-day avg balance)

#### C. **Liquidity Reserves**
- Maintain 10-15% liquidity allocation untuk stabilize price swings
- Market making partnership (optional) untuk tight spread

---

## 8. Anti-Inflation Strategy

### Problem:
350M NUSA emission over 4 tahun bisa inflasi jika demand tidak match supply.

### Strategies:

#### A. **Demand-Driven Emission**
- Emission rate adjust based on platform growth (MAU, transaction volume)
- Example: Jika MAU <target, reduce emission rate

#### B. **Vesting untuk Large Rewards**
- Referral reward >10K NUSA → vesting 3-6 bulan
- Prevent sybil attack reward dumping

#### C. **Staking Incentive**
- Encourage user stake token (lock supply)
- APY dari ecosystem allocation, not new mint

#### D. **Burn Offset**
- Burn rate target: 20-30% of emission rate
- Example: Emit 10M per bulan → burn 2-3M per bulan

---

## 9. Risks & Mitigation

### Risk 1: **Emission Too Aggressive**
- **Impact:** Supply > demand → price drop
- **Mitigation:** Adjustable emission, burn mechanism, staking lock-up

### Risk 2: **Utility Not Sticky**
- **Impact:** User earn & dump immediately
- **Mitigation:** Multi-layer utility, vesting untuk rewards, premium benefit compelling

### Risk 3: **Team Unlock Dump**
- **Impact:** Team sell allocation → price crash
- **Mitigation:** 12-month cliff, 24-month linear, team commitment legal agreement

### Risk 4: **Liquidity Fragmentation**
- **Impact:** Token di multiple chain/DEX → liquidity spread thin
- **Mitigation:** Focus 1-2 primary pool initially, expand gradually

---

## 10. Success Metrics (Tokenomics Health)

### KPIs:

#### A. **Supply Metrics**
- [ ] Circulating supply growth vs plan (tolerance ±5%)
- [ ] % token staked (target: >30%)
- [ ] Token velocity (transaction/holder ratio)

#### B. **Demand Metrics**
- [ ] Daily/Monthly Active Holders
- [ ] Token utility usage rate (% earned token actually used vs sold)
- [ ] Liquidity depth (min $100K per major pool)

#### C. **Price Stability**
- [ ] 30-day volatility (target: <50% swing)
- [ ] Trading volume / market cap ratio (healthy: 5-20%)

#### D. **Distribution Health**
- [ ] Top 10 holders <20% circulating supply
- [ ] Gini coefficient <0.6 (distribution equality)

---

## 11. Governance & Adjustment Mechanism

### Phase 1 (Year 1): **Multisig Control**
- Emission parameters bisa adjust dengan multisig approval
- Requires: 4/7 signers
- Announcement 7 days sebelum execution

### Phase 2 (Year 2+): **Community Governance**
- Major tokenomics change butuh token holder vote
- Proposal threshold: 1M NUSA (0.1% supply)
- Quorum: 10M NUSA participating
- Passing: >60% approval

### Emergency Powers:
- Pause contract (only if critical bug)
- Requires: 5/7 multisig + public announcement
- Time-bound: max 48 hours pause

---

## 12. Comparison dengan Industry Standards

| Metric | NUSA Token | Industry Avg | Notes |
|--------|------------|--------------|-------|
| **Team Allocation** | 15% | 15-25% | Conservative |
| **Community/Reward** | 35% | 20-40% | Above avg (growth focus) |
| **Liquidity** | 12% | 5-15% | Healthy |
| **Team Cliff** | 12 months | 6-12 months | Strict |
| **Team Vesting** | 36 months total | 24-48 months | Standard |
| **TGE Circulating** | 6% | 5-20% | Conservative |

**Verdict:** Tokenomics align dengan best practices, conservative di team allocation, generous di community (justified by utility focus).

---

## 13. Next Steps

### For Workshop Session 02:
- [ ] Validate allocation percentages dengan client
- [ ] Confirm emission rate suitable untuk platform size
- [ ] Legal review: apakah allocation structure defensible
- [ ] Finance review: liquidity budget sufficient

### For Development:
- [ ] Translate tokenomics ke smart contract spec
- [ ] Vesting contract design (cliff + linear)
- [ ] Emission controller design (if adjustable)

---

**Prepared by:** Tokenomics Lead  
**Reviewed by:** Product Lead (Client), Legal (Client)  
**Version:** 1.0  
**Date:** December 22, 2025  
**Status:** Draft for Workshop
