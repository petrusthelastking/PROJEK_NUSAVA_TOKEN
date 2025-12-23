const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("=".repeat(60));
  console.log("NUSANTARA TOKEN - DEPLOYMENT SCRIPT");
  console.log("=".repeat(60));
  
  const [deployer] = await ethers.getSigners();
  console.log(`\nDeploying contracts with account: ${deployer.address}`);
  console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH\n`);
  
  // Configuration from environment variables
  const config = {
    multisig: process.env.MULTISIG_ADDRESS,
    communityRewards: process.env.COMMUNITY_REWARDS_ADDRESS,
    ecosystem: process.env.ECOSYSTEM_ADDRESS,
    liquidity: process.env.LIQUIDITY_ADDRESS,
    teamVesting: process.env.TEAM_VESTING_ADDRESS,
    advisorVesting: process.env.ADVISOR_VESTING_ADDRESS,
    treasury: process.env.TREASURY_ADDRESS,
  };
  
  // Validate all addresses
  console.log("Validating configuration...");
  const requiredAddresses = [
    "multisig",
    "communityRewards",
    "ecosystem",
    "liquidity",
    "teamVesting",
    "advisorVesting",
    "treasury"
  ];
  
  for (const key of requiredAddresses) {
    if (!config[key] || config[key] === "0x0000000000000000000000000000000000000000") {
      throw new Error(`Missing or invalid ${key} address in .env file`);
    }
    console.log(`✓ ${key}: ${config[key]}`);
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("DEPLOYING NUSANTARA TOKEN");
  console.log("=".repeat(60));
  
  // Get contract factory
  const NusantaraToken = await ethers.getContractFactory("NusantaraToken");
  
  // Deploy
  console.log("\nDeploying NusantaraToken...");
  const token = await NusantaraToken.deploy(
    config.multisig,
    config.communityRewards,
    config.ecosystem,
    config.liquidity,
    config.teamVesting,
    config.advisorVesting,
    config.treasury
  );
  
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  
  console.log(`\n✅ NusantaraToken deployed to: ${tokenAddress}`);
  
  // Verify deployment
  console.log("\n" + "=".repeat(60));
  console.log("VERIFYING DEPLOYMENT");
  console.log("=".repeat(60));
  
  const name = await token.name();
  const symbol = await token.symbol();
  const decimals = await token.decimals();
  const totalSupply = await token.totalSupply();
  
  console.log(`\nToken Information:`);
  console.log(`  Name: ${name}`);
  console.log(`  Symbol: ${symbol}`);
  console.log(`  Decimals: ${decimals}`);
  console.log(`  Total Supply: ${ethers.formatEther(totalSupply)} NUSA`);
  
  // Verify allocations
  console.log(`\nVerifying Allocations:`);
  
  const allocations = [
    { name: "Community Rewards", address: config.communityRewards, expected: "350000000" },
    { name: "Ecosystem", address: config.ecosystem, expected: "200000000" },
    { name: "Liquidity", address: config.liquidity, expected: "120000000" },
    { name: "Team Vesting", address: config.teamVesting, expected: "150000000" },
    { name: "Advisor Vesting", address: config.advisorVesting, expected: "30000000" },
    { name: "Treasury", address: config.treasury, expected: "150000000" },
  ];
  
  let totalAllocated = BigInt(0);
  
  for (const allocation of allocations) {
    const balance = await token.balanceOf(allocation.address);
    const balanceFormatted = ethers.formatEther(balance);
    const isCorrect = balanceFormatted === allocation.expected + ".0";
    
    console.log(`  ${allocation.name}: ${balanceFormatted} NUSA ${isCorrect ? "✅" : "❌"}`);
    
    if (!isCorrect) {
      console.error(`    Expected: ${allocation.expected} NUSA`);
      throw new Error(`Allocation mismatch for ${allocation.name}`);
    }
    
    totalAllocated += balance;
  }
  
  console.log(`\n  Total Allocated: ${ethers.formatEther(totalAllocated)} NUSA`);
  
  if (totalAllocated !== totalSupply) {
    throw new Error("Total allocated doesn't match total supply!");
  }
  
  console.log("\n✅ All allocations verified!");
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      NusantaraToken: tokenAddress,
    },
    configuration: config,
    allocations: allocations.map(a => ({
      name: a.name,
      address: a.address,
      amount: a.expected + " NUSA"
    })),
  };
  
  const deploymentDir = path.join(__dirname, "..", "06-DEPLOYMENT", hre.network.name);
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentDir, "deployment.json");
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n📝 Deployment info saved to: ${deploymentFile}`);
  
  // Instructions for next steps
  console.log("\n" + "=".repeat(60));
  console.log("NEXT STEPS");
  console.log("=".repeat(60));
  
  console.log(`
1. VERIFY CONTRACT ON BLOCK EXPLORER:
   
   npx hardhat verify --network ${hre.network.name} ${tokenAddress} \\
     "${config.multisig}" \\
     "${config.communityRewards}" \\
     "${config.ecosystem}" \\
     "${config.liquidity}" \\
     "${config.teamVesting}" \\
     "${config.advisorVesting}" \\
     "${config.treasury}"

2. SETUP VESTING SCHEDULES:
   - Run deploy-vesting-schedules.js script
   - Coordinate with multisig signers

3. CREATE LIQUIDITY POOL:
   - Decide token pair (NUSA/USDC recommended)
   - Calculate initial price
   - Deploy liquidity from liquidity wallet

4. SUBMIT TO AGGREGATORS:
   - CoinMarketCap
   - CoinGecko
   
5. PREPARE CEX LISTING (if applicable):
   - Gather all documentation
   - Contact exchanges

---

⚠️  CRITICAL: Save this information securely!

Contract Address: ${tokenAddress}
Network: ${hre.network.name}
Deployer: ${deployer.address}

---
`);
  
  console.log("=".repeat(60));
  console.log("DEPLOYMENT COMPLETE");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
