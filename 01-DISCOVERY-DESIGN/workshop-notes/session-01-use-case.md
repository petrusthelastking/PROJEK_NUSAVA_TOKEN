# Workshop Session 01 - Use Case & Token Utility Mapping

**Client:** PT Nusantara Digital Ventura  
**Date:** [TBD]  
**Duration:** 2 hours  
**Participants:** Product Lead, CTO, Tokenomics Lead (Vendor), Blockchain Architect (Vendor)

---

## Agenda

1. **Pengenalan & Tujuan** (15 min)
2. **Product Ecosystem Deep Dive** (30 min)
3. **Token Utility Brainstorming** (45 min)
4. **Use Case Prioritization** (20 min)
5. **Preliminary Risk Scan** (10 min)

---

## 1. Pengenalan & Tujuan

### Goal Workshop Ini:
- Memahami ekosistem produk PT Nusantara Digital Ventura secara mendalam
- Mapping token utility yang **genuine & defensible** (bukan forced)
- Identifikasi user journey dan friction points
- Validate bahwa token **benar-benar dibutuhkan** (vs loyalty points biasa)

### Anti-Goals:
❌ Token sebagai "fundraising tool" (investment)  
❌ Token yang tidak ada utility jelas (speculative)  
❌ Use case yang bisa diselesaikan dengan database biasa  

---

## 2. Product Ecosystem Deep Dive

### Questions to Client:

#### A. Core Product/Platform
1. **Deskripsi produk utama PT NDV:**
   - [ ] Apa produk/layanan utama yang ditawarkan?
   - [ ] Siapa target user (B2C, B2B, B2B2C)?
   - [ ] Berapa banyak active users saat ini?
   - [ ] Apa business model saat ini (subscription, transaction fee, ads, etc.)?

2. **User Behavior & Pain Points:**
   - [ ] Bagaimana user flow saat ini (sign up → engagement → monetization)?
   - [ ] Apa yang membuat user churn?
   - [ ] Apa incentive yang paling efektif untuk retention saat ini?

#### B. Partner/Merchant Ecosystem (jika ada)
1. **Partner Integration:**
   - [ ] Apakah ada partner/merchant yang terlibat?
   - [ ] Bagaimana revenue sharing saat ini?
   - [ ] Pain points dalam partner onboarding/payment?

2. **Network Effect:**
   - [ ] Apakah value platform naik dengan jumlah user/partner?
   - [ ] Apakah ada chicken-egg problem (butuh user untuk menarik partner, vice versa)?

---

## 3. Token Utility Brainstorming

### Framework: "Why Token, Not Database?"

Setiap use case harus lulus test ini:
1. **Decentralization benefit:** Apakah decentralization/transparency wajib?
2. **Cross-platform value:** Apakah token perlu transferable antar platform?
3. **Ownership clarity:** Apakah user perlu "own" value mereka (not loyalty points)?
4. **Network effect:** Apakah token mempercepat network growth?

---

### Use Case Category A: **Reward & Incentive**

#### UC-001: User Engagement Rewards
**Deskripsi:**  
User mendapat token untuk aktivitas produktif di platform (mis. complete transaction, invite friend, review product, create content).

**Why Token?**
- Tradable value → user motivated lebih
- Transparent accrual → trust
- Dapat dipakai di ecosystem lain (future partnership)

**Implementation:**
- [ ] Event trigger: transaction complete → emit X tokens
- [ ] Accrual: wallet atau internal balance?
- [ ] Redemption: fee discount, premium feature, withdraw?

**Questions:**
- Berapa "value" setiap action? (risk: inflasi jika terlalu generous)
- Cap per user per hari/bulan?
- Vesting untuk large rewards (anti-gaming)?

---

#### UC-002: Referral & Community Growth
**Deskripsi:**  
User mendapat token untuk mengajak user baru (referral program on-chain).

**Why Token?**
- Viral loop jelas (incentivized sharing)
- Transparency: user bisa track reward history
- Auto-distribution via smart contract

**Implementation:**
- [ ] Referral code/link tracking (on-chain atau hybrid)
- [ ] Reward structure: fixed per referral atau tiered?
- [ ] Anti-sybil: KYC, min activity requirement

**Questions:**
- Apakah referee juga dapat token? (double-sided incentive)
- Max reward per referrer?
- Time window (expired referral)?

---

### Use Case Category B: **Access & Membership**

#### UC-003: Premium Feature Access
**Deskripsi:**  
User stake/hold token untuk akses fitur premium (gated access).

**Why Token?**
- Decentralized gating (tidak butuh database permission)
- Transferable membership (user bisa jual/beli status)
- Transparent eligibility

**Implementation:**
- [ ] Threshold: hold X tokens → unlock premium
- [ ] Staking mechanism: lock atau just hold?
- [ ] Tiered membership (bronze/silver/gold based on token amount)

**Questions:**
- Apakah token dikonsumsi (burn) atau just hold?
- Benefit apa yang masuk akal? (ad-free, priority support, early access)
- Risk: price volatility bikin membership tidak stabil

---

#### UC-004: Governance (Limited)
**Deskripsi:**  
Token holder bisa vote untuk keputusan tertentu (product roadmap, feature prioritization, partnership approval).

**Why Token?**
- Aligned incentive: holder = user yang committed
- Transparent voting (on-chain)
- Community-driven development

**Implementation:**
- [ ] Voting power: 1 token = 1 vote atau quadratic?
- [ ] Proposal submission: siapa bisa submit? (min token threshold)
- [ ] Execution: binding atau non-binding vote?

**Questions:**
- Keputusan apa yang suitable untuk governance? (jangan critical business decision)
- Apakah perlu snapshot untuk prevent vote manipulation?
- Quorum & threshold untuk pass proposal?

---

### Use Case Category C: **Fee & Discount**

#### UC-005: Transaction Fee Discount
**Deskripsi:**  
User bayar fee pakai token → dapat diskon (mis. 5-20% off).

**Why Token?**
- Incentive untuk hold token
- Reduce selling pressure (token has utility)
- Win-win: user save money, platform lock liquidity

**Implementation:**
- [ ] Fee calculation: fiat base price, discount if pay with token
- [ ] Price feed: oracle untuk token price (risk: volatility)
- [ ] Settlement: token burned atau recirculated?

**Questions:**
- Discount % yang sustainable? (jangan terlalu tinggi)
- Apakah fee revenue turun signifikan?
- Alternatif: flat fee in token (mis. 10 tokens per transaction, regardless price)

---

#### UC-006: Loyalty Tier Benefits
**Deskripsi:**  
Semakin banyak token yang dihold/stake, semakin tinggi loyalty tier → benefits bertambah.

**Why Token?**
- Gamification loyalty program
- Transparent tier calculation
- Long-term holder reward

**Implementation:**
- [ ] Tier structure: Bronze (<100 token), Silver (100-1000), Gold (>1000)
- [ ] Benefits per tier: cashback, priority, exclusive deals
- [ ] Dynamic tier: real-time adjustment based on balance

**Questions:**
- Apakah balance snapshot (monthly) atau real-time?
- Benefit yang feasible untuk PT NDV?
- Prevent gaming: min hold duration?

---

### Use Case Category D: **Partner/Merchant Utility**

#### UC-007: Partner Payment & Settlement
**Deskripsi:**  
Partner/merchant terima pembayaran dalam token (opsi), settle lebih cepat vs fiat.

**Why Token?**
- Faster settlement (on-chain vs bank transfer)
- Lower fee (blockchain vs payment gateway)
- Cross-border easier

**Implementation:**
- [ ] Payment option: fiat atau token (partner choice)
- [ ] Conversion: auto-swap token to fiat (if partner want fiat)
- [ ] Settlement schedule: instant atau batching?

**Questions:**
- Apakah partner mau hold token atau instant convert?
- Fee struktur: siapa bayar gas fee?
- Regulatory: apakah token payment legal di Indonesia?

---

#### UC-008: Marketing & Campaign Budget
**Deskripsi:**  
Partner alokasikan token untuk marketing campaign (cashback, giveaway) di platform PT NDV.

**Why Token?**
- Transparent budget allocation
- User terima token langsung (not manual transfer)
- Platform facilitate discovery

**Implementation:**
- [ ] Partner deposit token to campaign pool
- [ ] User claim token saat meet requirement (purchase, review)
- [ ] Platform fee: % dari campaign budget

**Questions:**
- Apakah partner buy token dari market atau PT NDV provide?
- Campaign rule: siapa yang set (partner atau platform)?
- Abuse prevention: sybil, fake transaction?

---

## 4. Use Case Prioritization

### Prioritization Matrix: Impact vs Effort

| Use Case | User Impact | Business Impact | Dev Effort | Risk | Priority |
|----------|-------------|-----------------|------------|------|----------|
| UC-001: Engagement Rewards | High | Medium | Medium | Medium (inflation) | **P0** |
| UC-002: Referral Program | High | High | Low | Medium (sybil) | **P0** |
| UC-003: Premium Access | Medium | Medium | Low | Low | **P1** |
| UC-004: Governance | Low | Low | High | Low | **P2** (future) |
| UC-005: Fee Discount | Medium | Medium | Medium | High (volatility) | **P1** |
| UC-006: Loyalty Tier | High | Medium | Medium | Low | **P1** |
| UC-007: Partner Payment | Medium | High | High | High (regulatory) | **P2** (research) |
| UC-008: Campaign Budget | Low | Medium | Medium | Medium | **P2** |

### Recommended MVP (Phase 1):
✅ **UC-001:** Engagement Rewards (core utility)  
✅ **UC-002:** Referral Program (growth lever)  
✅ **UC-006:** Loyalty Tier (retention)  

### Phase 2 (Post-Launch):
🔄 **UC-003:** Premium Access  
🔄 **UC-005:** Fee Discount (jika token price stabil)  

### Research Phase:
🔬 **UC-007:** Partner Payment (legal clarity needed)  
🔬 **UC-004:** Governance (if community mature)  

---

## 5. Preliminary Risk Scan

### Risk Kategori: **Economic**

#### Risk E-01: Token Inflation
**Deskripsi:** Terlalu banyak token diberikan sebagai reward → supply inflasi → price turun → disincentive hold.

**Mitigation:**
- [ ] Set max emission rate (hard cap per bulan/tahun)
- [ ] Burn mechanism untuk offset emission
- [ ] Vesting untuk large distributions

#### Risk E-02: Utility Not Compelling
**Deskripsi:** User tidak lihat value dari token → tidak mau hold → dump.

**Mitigation:**
- [ ] Ensure utility benar-benar solve pain point (not forced)
- [ ] Multi-layer utility (not depend on one use case)
- [ ] Continuous feature expansion

#### Risk E-03: Price Volatility Impact Utility
**Deskripsi:** Token price swing wild → fee discount/tier benefits jadi tidak predictable.

**Mitigation:**
- [ ] Use fiat-pegged pricing (oracle)
- [ ] Buffer mechanism (mis. 7-day average price)
- [ ] Consider stablecoin hybrid (future)

---

### Risk Kategori: **Regulatory**

#### Risk R-01: Token Classification Unclear
**Deskripsi:** Regulator classify token sebagai security → compliance nightmare.

**Mitigation:**
- [ ] Design pure utility (no investment promise)
- [ ] Legal opinion dari counsel familiar dengan OJK/BI
- [ ] No profit-sharing/dividend
- [ ] Clear risk disclosure

#### Risk R-02: KYC/AML Requirement
**Deskripsi:** Jika user bisa withdraw token ke fiat, mungkin perlu KYC.

**Mitigation:**
- [ ] Implement KYC untuk withdraw above threshold
- [ ] Partner dengan exchange yang sudah compliant
- [ ] Internal AML monitoring

---

### Risk Kategori: **Technical**

#### Risk T-01: Smart Contract Vulnerability
**Deskripsi:** Bug di contract → token hack/exploit.

**Mitigation:**
- [ ] Extensive testing + audit
- [ ] Bug bounty program
- [ ] Insurance (opsi: Nexus Mutual, InsurAce)

#### Risk T-02: Oracle Manipulation
**Deskripsi:** Jika pakai oracle untuk price feed, bisa dimanipulate.

**Mitigation:**
- [ ] Use reputable oracle (Chainlink, API3)
- [ ] Multi-source price aggregation
- [ ] Circuit breaker untuk price anomaly

---

### Risk Kategori: **Operational**

#### Risk O-01: Liquidity Pool Insufficient
**Deskripsi:** User mau jual token tapi liquidity rendah → price impact besar.

**Mitigation:**
- [ ] Allocate sufficient liquidity budget
- [ ] Market maker partnership (opsional)
- [ ] Incentivize LP providers

#### Risk O-02: Community Perception "Rug Pull"
**Deskripsi:** Community tidak trust → labeling scam.

**Mitigation:**
- [ ] Transparent team (KYC'd, not anon)
- [ ] Multisig ownership
- [ ] Audit report public
- [ ] Clear communication

---

## 6. Action Items

### Untuk Client (PT NDV):
- [ ] Confirm use case prioritization (P0, P1, P2)
- [ ] Provide user data untuk sizing (DAU, MAU, transaction volume)
- [ ] Legal team review token classification
- [ ] Finance team confirm liquidity budget

### Untuk Vendor:
- [ ] Deep dive UC-001, UC-002, UC-006 (P0/P1) di workshop session 2
- [ ] Draft preliminary tokenomics based on prioritized use case
- [ ] Chain comparison analysis (considering use case technical requirement)

---

## 7. Next Workshop

**Workshop Session 02: Economics & Incentive Design**  
**Focus:**
- Token supply & emission model
- Reward calculation mechanics
- Anti-inflation mechanisms
- Vesting schedules

**Preparation:**
- User behavior data (transaction frequency, average value, churn rate)
- Competitor analysis (jika ada token sejenis)

---

**Notes:**  
_[Space for live notes during workshop]_

---

**Prepared by:** Tokenomics Lead  
**Reviewed by:** Product Lead (Client)  
**Date:** [TBD]  
**Status:** Draft
