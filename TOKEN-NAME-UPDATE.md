# Token Name Update Notice

## Official Token Information

**Token Name**: NUSAVA Token  
**Token Ticker**: NUSV  
**Standard**: ERC-20  
**Blockchain**: Polygon (Primary)  
**Total Supply**: 1,000,000,000 NUSV (Fixed)  
**Decimals**: 18

---

## Important Notes

### Updated Files:
- ✅ README.md → All references updated to NUSAVA/NUSV

### Files That Need Manual Update:

⚠️ **Smart Contract Files** (requires code changes):
1. `03-SMART-CONTRACTS/contracts/NusantaraToken.sol` 
   - Rename file to: `NUSAVAToken.sol`
   - Update contract name: `contract NUSAVAToken`
   - Update constructor symbol: `ERC20("NUSAVA Token", "NUSV")`

2. `03-SMART-CONTRACTS/test/NusantaraToken.simple.test.js`
   - Rename and update test descriptions
   - Update import statements

3. `03-SMART-CONTRACTS/scripts/deploy.js`
   - Update deployment script references

4. All documentation references in folders:
   - `00-PROPOSAL-RESPONSE/`
   - `01-DISCOVERY-DESIGN/`
   - `02-TOKENOMICS/`
   - `04-TESTING/`
   - `06-DEPLOYMENT/`
   - `08-LEGAL-COMPLIANCE/`
   - `09-LISTING-PREPARATION/`

---

## Action Required Before Deployment

**CRITICAL**: Before deploying to testnet or mainnet:

1. Rename smart contract file from `NusantaraToken.sol` to `NUSAVAToken.sol`
2. Update contract name inside the file
3. Update all test files
4. Update deployment scripts
5. Re-compile contracts: `npm run compile`
6. Re-run tests to ensure everything works
7. Update all documentation files

---

## Quick Find & Replace Commands

For bulk updates in other files:

```bash
# PowerShell commands to find files that need updating
Get-ChildItem -Recurse -Include *.md,*.sol,*.js,*.json | Select-String "NUSA[^V]" | Select-Object Path,LineNumber

# Replace in all markdown files (review first!)
Get-ChildItem -Recurse -Include *.md | ForEach-Object {
    (Get-Content $_) -replace 'Nusantara Token', 'NUSAVA Token' | Set-Content $_
    (Get-Content $_) -replace '\bNUSA\b(?!V)', 'NUSV' | Set-Content $_
}
```

**Warning**: Review each change carefully before applying bulk replacements!

---

**Last Updated**: December 23, 2025  
**Updated By**: Development Team
