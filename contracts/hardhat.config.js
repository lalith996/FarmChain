require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";
const MUMBAI_RPC_URL = process.env.MUMBAI_RPC_URL || "";
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "";
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true
    }
  },
  networks: {
    hardhat: {
      chainId: 31337
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    mumbai: {
      url: MUMBAI_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
      gasPrice: 50000000000
    },
    polygon: {
      url: POLYGON_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 137,
      gasPrice: 50000000000
    }
  },
  etherscan: {
    apiKey: {
      polygon: POLYGONSCAN_API_KEY,
      polygonMumbai: POLYGONSCAN_API_KEY
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
