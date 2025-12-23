# CoinMarketCap Listing Guide

## Overview
CoinMarketCap (CMC) adalah aggregator harga crypto terbesar. Listing di CMC = credibility boost + discovery untuk retail investors.

**Timeline:** 7-14 hari setelah submission (jika data lengkap)  
**Cost:** FREE (organic listing)  
**Requirements:** DEX pool aktif + verified contract

---

## Prerequisites (Must Have)

✅ Token sudah live di mainnet  
✅ DEX pool aktif (Uniswap, PancakeSwap, dll) dengan liquidity >$10K  
✅ Contract verified di block explorer  
✅ Official website live  
✅ Social media aktif (Twitter minimal)  

---

## Submission Process

### Step 1: Create CMC Account

1. Go to https://coinmarketcap.com/
2. Click "Sign Up" (top right)
3. Register dengan email bisnis (bukan personal email)
4. Verify email

### Step 2: Access Request Form

1. Login ke CMC
2. Go to https://coinmarketcap.com/request/
3. Click "Add Cryptocurrency" (jika token baru)

**ATAU** use direct form:
https://support.coinmarketcap.com/hc/en-us/requests/new?ticket_form_id=360000493911

### Step 3: Fill Application Form

#### Section A: Project Information

**Project Name:**  
`Nusantara Token`

**Ticker Symbol:**  
`NUSA`

**Project Launch Date:**  
`[Date of mainnet deployment]`

**Project Description (max 500 characters):**
```
Nusantara Token (NUSA) is a utility token powering the PT Nusantara Digital 
Ventura ecosystem. Users earn NUSA through platform engagement, referrals, and 
can use it for fee discounts, premium access, and loyalty benefits. NUSA is 
built on [Polygon/Base/Arbitrum] with fixed supply of 1 billion tokens and 
transparent vesting schedules.
```

**Website:**  
`https://nusantaratoken.io` (example)

---

#### Section B: Contract & Blockchain Info

**Blockchain Platform:**  
`Polygon` (or Base, Arbitrum, etc.)

**Contract Address:**  
`0x...` (your deployed token contract address)

**Block Explorer URL:**  
`https://polygonscan.com/token/0x...`

**Decimals:**  
`18`

**Total Supply:**  
`1000000000` (1 billion)

**Circulating Supply:**  
`60000000` (at TGE - adjust based on actual)

**Circulating Supply API (CRITICAL):**  
You MUST provide an API endpoint that returns circulating supply.

Example:
```
https://api.nusantaratoken.io/circulating-supply
```

Response (plain text):
```
60000000
```

Or JSON:
```json
{
  "circulatingSupply": "60000000"
}
```

**Why important?**  
CMC uses this to calculate market cap correctly.

**Implementation:**
Create simple API (Node.js/Python):
```javascript
// Express.js example
app.get('/circulating-supply', (req, res) => {
  // Calculate actual circulating (total - locked in vesting)
  const total = 1000000000;
  const lockedInVesting = 180000000; // Team + Advisor locked
  const circulating = total - lockedInVesting;
  
  res.send(circulating.toString());
});
```

---

#### Section C: Market & Trading Info

**Exchange Information:**

**DEX Name:**  
`Uniswap V3` (or PancakeSwap, QuickSwap)

**Trading Pair:**  
`NUSA/USDC`

**Exchange URL:**  
`https://app.uniswap.org/tokens/polygon/0x...`

**Trading Start Date:**  
`[Date pool created]`

**Proof of Reserves (optional but helpful):**  
`https://polygonscan.com/address/0x...#tokentxns`

---

#### Section D: Social Media & Community

**Official Project Links:**

- **Website:** https://nusantaratoken.io
- **Twitter:** https://twitter.com/nusantara_token
- **Telegram:** https://t.me/nusantara_official
- **Discord:** https://discord.gg/nusantara (optional)
- **Medium:** https://medium.com/@nusantara (optional)
- **GitHub:** https://github.com/nusantara-token (if open source)

**Whitepaper/Documentation:**  
`https://docs.nusantaratoken.io/whitepaper.pdf`

**Announcement/Blog Post:**  
`https://medium.com/@nusantara/token-launch-announcement`

---

#### Section E: Team & Proof of Authority

**Relationship to Project:**  
`Official Team` (select this option)

**Proof of Authority:**

You need to PROVE you're authorized to submit. Options:

1. **Tweet from official account:**
   ```
   We have submitted @Nusantara_Token ($NUSA) to @CoinMarketCap 
   for listing. Contract: 0x... #NUSA #Polygon
   ```
   Link to tweet: `https://twitter.com/nusantara_token/status/...`

2. **Website announcement:**
   Add banner or page: "We're applying to CoinMarketCap"
   Link: `https://nusantaratoken.io/cmc-application`

3. **Smart contract interaction:**
   Make transaction FROM contract deployer address with message.

**Best:** Do all 3 for fastest approval.

---

#### Section F: Logo & Branding

**Project Logo (Required):**

**Specifications:**
- Format: PNG with transparent background
- Size: 200x200 px (minimum)
- Quality: High resolution, clean
- File size: <500KB

Upload to:
- IPFS (permanent storage) OR
- GitHub repo OR
- Your website

**Logo URL:**  
`https://nusantaratoken.io/logo/nusa-logo-200x200.png`

**Example:**
```
https://ipfs.io/ipfs/Qm... 
```

---

### Step 4: Additional Documentation (Recommended)

While not strictly required, these improve approval chances:

#### A. Token Allocation Chart

Upload image showing:
- Community: 35%
- Ecosystem: 20%
- Liquidity: 12%
- Team: 15%
- Advisors: 3%
- Treasury: 15%

**URL:** `https://nusantaratoken.io/tokenomics/allocation-chart.png`

#### B. Vesting Schedule

Document or image showing unlock timeline.

**URL:** `https://docs.nusantaratoken.io/vesting-schedule`

#### C. Audit Report

If audited (highly recommended):

**URL:** `https://nusantaratoken.io/audit/nusa-audit-report.pdf`

**Audit Firm:** `[CertiK / Hacken / OpenZeppelin]`

---

### Step 5: Submit & Track

1. Review all information (triple-check contract address!)
2. Click "Submit"
3. Save confirmation email
4. Track status at: https://coinmarketcap.com/request-status/

**Status Updates:**
- **Submitted:** Form received
- **Under Review:** CMC team reviewing
- **Approved:** Listed! (usually no email, just appears)
- **Rejected:** Email with reason (fix & resubmit)

---

## Common Rejection Reasons & Fixes

### Rejection 1: "Insufficient Liquidity"

**Reason:** DEX pool <$10K or low trading volume

**Fix:**
- Increase liquidity to min $20K-$50K
- Wait for organic volume to pick up
- Run small marketing to bootstrap trading
- Resubmit after 1-2 weeks

---

### Rejection 2: "Circulating Supply API Not Working"

**Reason:** API returns error or incorrect format

**Fix:**
- Test API endpoint: `curl https://your-api.com/circulating-supply`
- Ensure returns plain number or valid JSON
- Check CORS if API blocks CMC bots
- Add API to documentation

---

### Rejection 3: "Unable to Verify Authority"

**Reason:** No proof that you're official team

**Fix:**
- Post tweet from verified account
- Add announcement to website
- Make transaction from deployer wallet with message
- Email CMC from official domain email

---

### Rejection 4: "Incomplete Information"

**Reason:** Missing required fields

**Fix:**
- Check ALL fields filled
- Ensure URLs are live (not 404)
- Logo accessible
- Social media links valid
- Resubmit with complete info

---

## Post-Approval: Maintaining Listing

### 1. Update Circulating Supply API

CRITICAL: Keep API updated as tokens unlock.

**Update schedule:**
- Monthly (minimum)
- After major unlock events (team vesting, etc.)
- Real-time (ideal)

CMC scrapes API regularly. Stale data = inaccurate market cap.

### 2. Update Project Info

If anything changes (website, social, partnerships):

1. Login to CMC
2. Go to "Update Project"
3. Submit changes
4. Provide proof (if major change)

### 3. Monitor Listing Accuracy

Check CMC page weekly:
- [ ] Price updating correctly
- [ ] Volume accurate
- [ ] Market cap correct (= price × circulating supply)
- [ ] Logo displaying
- [ ] Links working

**If error:** Submit support ticket: https://support.coinmarketcap.com/

---

## Advanced: Apply for Verification Badge

**Blue Checkmark** = Verified Project (credibility boost)

**Requirements:**
- Listed on CMC >3 months
- Active trading (volume >$50K/day)
- Strong community (>10K followers)
- Regular updates
- No controversy

**Application:**
After meeting criteria, email: verify@coinmarketcap.com

---

## Paid Options (Optional)

CMC offers paid services (NOT required for listing):

### 1. Self-Reported Circulating Supply

**Cost:** Free (default method we use)

### 2. Sponsored Listings

**Cost:** $5,000 - $50,000+

**Benefits:**
- Higher visibility (banner placement)
- Featured in "Trending" section
- NOT necessary for organic growth

**Recommendation:** Skip for now. Use funds for actual marketing.

---

## Timeline Expectations

| Milestone | Time from Submission |
|-----------|---------------------|
| Submission confirmation | Instant (email) |
| Under review | 2-3 days |
| Approval (if complete) | 7-14 days |
| Live listing | Immediately after approval |
| Verification badge | 3-6 months |

**Faster approval if:**
✅ All fields complete  
✅ Active DEX trading  
✅ Audit report provided  
✅ Strong social presence  

---

## Troubleshooting

### Q: Submitted 2 weeks ago, no response?

**A:** 
1. Check spam folder for CMC emails
2. Check status page: https://coinmarketcap.com/request-status/
3. If "Under Review" >2 weeks: email support@coinmarketcap.com
4. Reference your ticket number

### Q: Listed but price not updating?

**A:**
- CMC pulls price from DEX pools
- If pool has low liquidity: price may lag
- Check "Markets" tab on CMC: is your pool listed?
- If pool missing: submit "Add Market" request

### Q: Circulating supply wrong on CMC?

**A:**
1. Check your API: `curl https://your-api/circulating-supply`
2. If API correct but CMC wrong: 24-48 hour cache delay
3. If still wrong after 48h: email support with evidence

### Q: Can I list on CMC before DEX launch?

**A:** NO. CMC requires:
- Active trading (DEX or CEX)
- Price discovery mechanism
- Verifiable liquidity

Launch DEX first, then apply.

---

## Checklist: Before Submitting to CMC

- [ ] Token live on mainnet (contract deployed)
- [ ] Contract verified on block explorer
- [ ] DEX pool created (liquidity >$10K)
- [ ] Trading active (min 24 hours history)
- [ ] Circulating supply API live & tested
- [ ] Website live dengan all pages complete
- [ ] Logo uploaded (200x200 PNG transparent)
- [ ] Social media accounts created & active
- [ ] Whitepaper/docs published
- [ ] Proof of authority prepared (tweet/announcement)
- [ ] All URLs tested (no 404 errors)
- [ ] Form fields double-checked

---

## Resources

**Official CMC Guides:**
- Listing Criteria: https://support.coinmarketcap.com/hc/en-us/articles/360043659351
- Methodology: https://coinmarketcap.com/methodology/

**API Documentation:**
- CMC API (for developers): https://coinmarketcap.com/api/documentation/v1/

**Support:**
- Email: support@coinmarketcap.com
- Twitter: @CoinMarketCap
- Help Center: https://support.coinmarketcap.com/

---

**Prepared by:** Listing Operations Lead  
**Last Updated:** December 22, 2025  
**Version:** 1.0  
**Status:** Ready for Use
