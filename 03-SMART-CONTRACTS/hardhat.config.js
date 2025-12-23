require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  
  networks: {
    // Local Hardhat Network
    hardhat: {
      chainId: 31337,
    },
    
    // Testnets
    "polygon-mumbai": {
      url: process.env.POLYGON_MUMBAI_RPC || "https://rpc-mumbai.maticvigil.com",
      chainId: 80001,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 8000000000, // 8 gwei
    },
    
    "base-goerli": {
      url: process.env.BASE_GOERLI_RPC || "https://goerli.base.org",
      chainId: 84531,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    
    "arbitrum-goerli": {
      url: process.env.ARBITRUM_GOERLI_RPC || "https://goerli-rollup.arbitrum.io/rpc",
      chainId: 421613,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 100000000, // 0.1 gwei
    },
    
    // Mainnets
    polygon: {
      url: process.env.POLYGON_RPC || "https://polygon-rpc.com",
      chainId: 137,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 50000000000, // 50 gwei (adjust based on network)
    },
    
    base: {
      url: process.env.BASE_RPC || "https://mainnet.base.org",
      chainId: 8453,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 1000000000, // 1 gwei
    },
    
    arbitrum: {
      url: process.env.ARBITRUM_RPC || "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 100000000, // 0.1 gwei
    },
    
    bsc: {
      url: process.env.BSC_RPC || "https://bsc-dataseed.binance.org",
      chainId: 56,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      gasPrice: 5000000000, // 5 gwei
    },
  },
  
  // Contract Verification
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      baseGoerli: process.env.BASESCAN_API_KEY || "",
      base: process.env.BASESCAN_API_KEY || "",
      arbitrumGoerli: process.env.ARBISCAN_API_KEY || "",
      arbitrumOne: process.env.ARBISCAN_API_KEY || "",
      bsc: process.env.BSCSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      }
    ]
  },
  
  // Gas Reporter Configuration
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
    token: "MATIC", // Change based on network
  },
  
  // Paths Configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  
  // Mocha Test Configuration
  mocha: {
    timeout: 40000,
  },
};
