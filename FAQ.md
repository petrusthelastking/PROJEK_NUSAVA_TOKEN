# ❓ Frequently Asked Questions (FAQ)

## 📋 Daftar Isi
1. [General Questions](#general-questions)
2. [Technical Questions](#technical-questions)
3. [Legal & Compliance](#legal--compliance)
4. [Tokenomics](#tokenomics)
5. [Deployment](#deployment)
6. [Listing](#listing)
7. [Operations](#operations)

---

## 🌟 General Questions

### Q: Apa itu project ini?
**A:** Implementasi lengkap end-to-end token development untuk PT Nusantara Digital Ventura, mencakup:
- Smart contracts (Token, Vesting, Airdrop)
- Tokenomics design (1B supply)
- Legal framework & compliance
- Deployment guides
- Listing documentation (DEX, CMC, CoinGecko, CEX)

### Q: Apakah ini production-ready?
**A:** **YA**, tetapi dengan catatan:
- ✅ Code production-ready (perlu audit third-party)
- ✅ Documentation complete
- ⚠️ WAJIB legal review sebelum launch
- ⚠️ WAJIB third-party audit (strongly recommended)

### Q: Berapa lama dari sekarang sampai launch?
**A:** Timeline realistis:
- **Testnet:** 2-3 minggu (review + test)
- **Audit:** 3-4 minggu
- **Mainnet:** 1 minggu setelah audit clear
- **Total:** 6-8 minggu

### Q: Berapa biaya total project ini?
**A:** Breakdown:
- Development (sudah selesai): ~$40K-$60K (saved!)
- Audit: $15K-$40K (required)
- Liquidity: $50K-$100K (your budget)
- Listing fees: $0 (DEX/CMC/CG free) sampai $50K+ (CEX tier 1)
- Legal: $5K-$15K
- **Total:** $70K-$215K (tergantung scope)

---

## 💻 Technical Questions

### Q: Chain mana yang sebaiknya dipilih?
**A:** Rekomendasi berdasarkan kriteria:

| Chain | Gas Cost | Speed | Exchange Support | Recommendation |
|-------|----------|-------|------------------|----------------|
| **Polygon** | Very Low | Fast | Excellent | ⭐ **Recommended** |
| **Base** | Low | Very Fast | Good (growing) | ⭐ Good option |
| **Arbitrum** | Very Low | Fast | Excellent | ⭐ Good option |
| **BSC** | Low | Fast | Excellent | ✅ Alternative |
| **Ethereum** | Very High | Medium | Best | ❌ Too expensive |

**Best choice:** **Polygon** (mature ecosystem, low cost, wide support)

### Q: Apakah bisa multi-chain?
**A:** YA, tetapi:
- Phase 1: Launch di 1 chain dulu (Polygon recommended)
- Phase 2: Bridge ke chain lain (6-12 bulan kemudian)
- **Reason:** Simplicity, liquidity tidak terfragmentasi

### Q: Apakah smart contract bisa diupgrade?
**A:** **TIDAK** (by design).
- ✅ Fixed supply, immutable contract = trust & security
- ⚠️ No upgrade = harus perfect sebelum deploy
- Alternative: Deploy V2 contract + migration (jika benar-benar perlu)

### Q: Bagaimana kalau ada bug setelah deploy?
**A:** Mitigasi:
1. **Pausable:** Contract bisa di-pause (emergency only)
2. **Multisig:** No single point of failure
3. **Audit:** Minimize risk dengan audit thorough
4. **Insurance:** Opsi bug bounty + insurance (Nexus Mutual)
5. **Worst case:** Deploy V2 + airdrop migration

### Q: Apa yang terjadi jika kehilangan private key multisig?
**A:** Serious issue:
- **Prevention:** 4/7 multisig (bisa kehilangan 3 keys, masih oke)
- **Backup:** Setiap signer backup private key (cold storage)
- **Recovery:** Jika 4+ keys hilang = contract terkunci PERMANENT
- **Mitigation:** Social recovery wallet (Argent, Gnosis Safe with guardians)

---

## ⚖️ Legal & Compliance

### Q: Apakah NUSA token legal di Indonesia?
**A:** **YA**, dengan catatan:
- ✅ Token classified sebagai **UTILITY** (bukan security)
- ✅ Sesuai Bappebti Regulation No. 5/2019 (crypto as commodity)
- ⚠️ Trading harus melalui registered exchange (PFKA members)
- ⚠️ **WAJIB** konsultasi legal counsel Indonesia

### Q: Apakah butuh license dari OJK atau Bappebti?
**A:** **TIDAK** untuk issuer (PT NDV), TAPI:
- OJK: Tidak regulate crypto (di luar jurisdiksi)
- Bappebti: Regulate **exchanges**, bukan token issuer
- PT NDV: Legal entity sudah cukup (no special license)
- ⚠️ If integrate payment system → Bank Indonesia oversight

### Q: Apakah legal untuk US citizens?
**A:** **COMPLICATED**:
- SEC bisa classify utility token sebagai security
- **Recommendation:** **Geo-block US** (tidak available untuk US persons)
- Terms: "Not offered to US persons"
- If want US exposure: hire US securities lawyer ($$$)

### Q: Apa yang harus ada di risk disclosure?
**A:** Mandatory warnings:
- ⚠️ High volatility (total loss possible)
- ⚠️ No investment guarantee
- ⚠️ Regulatory uncertainty
- ⚠️ Technical risks (smart contract bugs)
- ⚠️ Liquidity risk
- ⚠️ No buyback obligation
- ⚠️ Platform dependency

Template lengkap ada di: [`compliance-checklist.md`](08-LEGAL-COMPLIANCE/compliance-checklist.md)

### Q: Apakah butuh KYC untuk semua users?
**A:** **TIDAK** (threshold-based):
- Hold <$1,000: No KYC
- Hold $1K-$10K: Basic KYC (email verification)
- Hold >$10K: Enhanced KYC (ID, proof of address)
- Withdraw to fiat: Full KYC (mandatory)

---

## 💰 Tokenomics

### Q: Kenapa total supply 1 Billion?
**A:** Balance antara:
- ✅ Psychological pricing (easier for users to understand)
- ✅ Enough untuk distribution (tidak terlalu sedikit)
- ✅ Not too large (avoid "meme coin" perception)
- ✅ Industry standard (banyak utility token 1B-10B range)

### Q: Kenapa team allocation "hanya" 15%?
**A:** **Conservative by design**:
- Industry avg: 15-25%
- NUSA: 15% (low end = less "rug pull" concern)
- Vesting: 36 bulan (12 cliff + 24 linear) = strong commitment
- Comparison: Many projects 20-30% team = red flag

### Q: Apakah bisa mengubah allocation setelah deploy?
**A:** **TIDAK** (impossible):
- Allocation distributed di constructor (immutable)
- Total supply fixed (no mint function)
- **Only** yang bisa diubah: emission rate dari allocation wallets (via governance)

### Q: Bagaimana kalau token price turun drastis?
**A:** Reality check:
- ✅ Token utility tetap ada (platform features)
- ✅ Tidak dependent on price untuk use case
- ⚠️ Fee discount might need adjustment (oracle-based pricing)
- ⚠️ Loyalty tier threshold might need review
- **Mitigation:** Fiat-pegged utility pricing (not token-based)

### Q: Apakah ada buyback program?
**A:** **Optional** (bukan promise):
- Treasury bisa allocate untuk buyback (via multisig proposal)
- Burn dari buyback = deflationary
- **NEVER promise** guaranteed buyback (securities violation!)
- Communicate: "may consider" not "will do"

---

## 🚀 Deployment

### Q: Testnet atau langsung mainnet?
**A:** **TESTNET FIRST** (mandatory):
- Deploy ke Mumbai/Goerli: 2-4 minggu testing
- Community testing: invite beta users
- Fix bugs (if any)
- **Then** mainnet (after confidence 100%)

### Q: Berapa gas cost untuk deploy?
**A:** Estimates:

| Network | Deploy Cost | Per Transaction |
|---------|-------------|-----------------|
| Polygon | ~0.5 MATIC ($0.50) | ~0.002 MATIC |
| Base | ~0.01 ETH ($30) | ~0.0001 ETH |
| Arbitrum | ~0.005 ETH ($15) | ~0.0001 ETH |
| Ethereum | ~0.5 ETH ($1,500) | ~0.01 ETH |

**Recommendation:** Polygon = cheapest + good UX

### Q: Siapa yang deploy contract?
**A:** Options:
- **Option A:** Vendor deploy (dari deployer EOA) → transfer ownership to multisig
- **Option B:** PT NDV technical team deploy (if capable)
- **Recommended:** Vendor deploy (experience + less risk)

### Q: Bagaimana verify contract di block explorer?
**A:** Automated via Hardhat:
```bash
npx hardhat verify --network polygon [contract_address] [constructor_args]
```
Manual: Upload source code + constructor args di Polygonscan

### Q: Apa yang terjadi jika deployment gagal?
**A:** Scenarios:
- **Out of gas:** Transaction reverted, deployer tidak kehilangan tokens, retry with higher gas
- **Wrong parameters:** Contract deployed but wrong → deploy new contract (address berbeda)
- **Network congestion:** Wait & retry
- **Critical:** Test di local & testnet first!

---

## 📈 Listing

### Q: Berapa lama sampai listed di CoinMarketCap?
**A:** Timeline:
- Submission: 10 minutes (fill form)
- Review: 7-14 days (if data complete)
- Approval: Instant (muncul di CMC)
- **Total:** 1-2 minggu dari DEX launch

### Q: Apakah bayar untuk listing CMC/CoinGecko?
**A:** **GRATIS** (free listing):
- ✅ CMC: Free organic listing
- ✅ CoinGecko: Free
- ❌ Paid options: $5K-$50K+ (sponsored placement, not necessary)

### Q: Apa syarat minimum untuk CMC listing?
**A:** Requirements:
- [x] DEX pool aktif (liquidity >$10K)
- [x] Trading history (min 24 jam)
- [x] Contract verified
- [x] Circulating supply API
- [x] Official website
- [x] Social media
- [x] Proof of authority

### Q: Berapa biaya listing di CEX?
**A:** Varies widely:

| Exchange Tier | Listing Fee | Timeline |
|---------------|-------------|----------|
| **DEX** (Uniswap, etc) | $0 (permissionless) | Instant |
| **Tier 3 CEX** (MEXC, BitMart) | $10K-$50K | 1-3 months |
| **Tier 2 CEX** (Gate.io, KuCoin) | $50K-$200K | 3-6 months |
| **Tier 1 CEX** (Binance, Coinbase) | $500K-$5M+ | 6-18 months |

**Recommendation:** Focus DEX + Tier 3 awal

### Q: Apakah butuh market maker?
**A:** **Opsional** tapi helpful:
- **Without MM:** Organic trading (might have low volume awal)
- **With MM:** Tight spread, better liquidity (~$5K-$20K/month)
- **When:** Jika liquidity <$100K atau spread >5%

---

## 🛠️ Operations

### Q: Siapa yang handle multisig?
**A:** Recommended signers:
- CEO (1)
- CFO (1)
- CTO (1)
- Legal Counsel (1)
- Independent Board Members (3)
- **Total:** 7 signers, threshold 4/7

### Q: Bagaimana cara distribute token dari allocation wallet?
**A:** Methods:
1. **Manual:** Transfer via multisig (for large amounts)
2. **Smart contract:** Automated via reward distributor (for user rewards)
3. **Airdrop:** Merkle-based airdrop contract (campaigns)

### Q: Apakah bisa freeze user's tokens?
**A:** **NO** (by design):
- No blacklist function (unless legal requirement)
- User owns private key = full control
- **Only** pausable: emergency stop ALL transfers (not individual)

### Q: Bagaimana monitor token activity?
**A:** Tools:
- **Block explorer:** Polygonscan (on-chain data)
- **Analytics:** Dune Analytics, Nansen
- **Monitoring:** Tenderly, OpenZeppelin Defender
- **Alerts:** Discord/Telegram bot untuk large transfers

### Q: Apa yang dilakukan kalau terjadi hack?
**A:** Incident response:
1. **Detect:** Monitoring alerts
2. **Assess:** Severity & impact
3. **Pause:** Pause contract (if possible & necessary)
4. **Communicate:** Public announcement immediate
5. **Coordinate:** Contact exchanges (halt trading if needed)
6. **Investigate:** Engage security firm
7. **Remediate:** Fix & plan recovery (might need new contract + migration)

---

## 🔧 Development & Customization

### Q: Apakah bisa customize smart contract?
**A:** **YA**, tetapi:
- ⚠️ Any change butuh: re-testing + re-audit
- ✅ Simple changes (token name, symbol): easy
- ⚠️ Logic changes (vesting formula): complex, risky
- **Recommendation:** Use as-is (sudah best practice)

### Q: Apakah bisa add governance setelah launch?
**A:** **YA** (upgradable governance):
- Phase 1: Multisig control
- Phase 2: Deploy governance contract (3-6 bulan)
- Phase 3: Transfer control ke governance
- **No impact** on token contract (token stays immutable)

### Q: Bagaimana add new features (staking, rewards)?
**A:** Via **new contracts**:
- Deploy StakingContract (users stake NUSA → earn rewards)
- Deploy RewardDistributor (automate reward distribution)
- Token contract stays unchanged (permissionless composability)

---

## 💡 Best Practices

### Q: Apa yang WAJIB dilakukan sebelum mainnet?
**A:** Critical checklist:
- [ ] Legal review completed ⚠️
- [ ] Third-party audit completed ⚠️
- [ ] Testnet tested (min 2-4 minggu)
- [ ] Multisig setup & tested
- [ ] All addresses verified (TRIPLE CHECK!)
- [ ] Team approval (CEO, CFO, Legal sign-off)
- [ ] Communication plan ready
- [ ] Liquidity budget confirmed
- [ ] Incident response plan documented

### Q: Red flags yang harus dihindari?
**A:** Don'ts:
- ❌ Promise "guaranteed profit" or "10x returns"
- ❌ Anonymous team (use real identities)
- ❌ Deploy without audit (high-value projects)
- ❌ Single EOA as admin (use multisig!)
- ❌ No vesting for team (instant dump risk)
- ❌ Unlimited mint function (hyperinflation risk)
- ❌ No risk disclosure (legal liability!)

### Q: Tips untuk successful launch?
**A:** Success factors:
- ✅ **Strong utility:** Token solves real problem
- ✅ **Community building:** Start early (pre-launch)
- ✅ **Transparency:** Public audit, verified contract, open team
- ✅ **Realistic expectations:** Don't overpromise
- ✅ **Long-term focus:** Not pump-and-dump
- ✅ **Compliance:** Legal dari awal
- ✅ **Security first:** Audit + monitoring

---

## 📞 Getting Help

### Q: Dimana bisa belajar lebih lanjut?
**A:** Resources:
- **This project docs:** [`README.md`](README.md), [`IMPLEMENTATION-SUMMARY.md`](IMPLEMENTATION-SUMMARY.md)
- **Smart contracts:** OpenZeppelin docs (https://docs.openzeppelin.com/)
- **Hardhat:** https://hardhat.org/tutorial
- **Legal:** Consult qualified lawyer (mandatory!)

### Q: Siapa yang bisa dihubungi untuk support?
**A:** Support channels:
- **Technical:** Review inline code comments, docs
- **Legal:** Hire Indonesian crypto lawyer
- **Audit:** Contact CertiK, Hacken, OpenZeppelin
- **Community:** Telegram developer groups, Discord

### Q: Apakah ada maintenance contract?
**A:** Post-deployment support scope:
- **Included:** Documentation, code handover
- **Optional:** Monthly retainer for ongoing support ($5K-$10K/month)
- **Scope:** Troubleshooting, upgrades, feature additions

---

## 🎯 Quick Answers

**Q: Sudah siap deploy?**  
**A:** Review checklist di [`deployment-guide.md`](06-DEPLOYMENT/deployment-guide.md)

**Q: Berapa total cost?**  
**A:** $70K-$215K (development saved, audit $15K-$40K, liquidity $50K-$100K)

**Q: Berapa lama sampai listed?**  
**A:** DEX instant, CMC 1-2 minggu, CEX 1-6 bulan

**Q: Apakah legal?**  
**A:** YA (utility token), tapi WAJIB legal review

**Q: Apakah aman?**  
**A:** Code solid, butuh third-party audit before mainnet

---

**Masih ada pertanyaan?**  
Check comprehensive documentation di setiap folder atau hire qualified consultant.

**Last Updated:** December 22, 2025  
**Version:** 1.0
