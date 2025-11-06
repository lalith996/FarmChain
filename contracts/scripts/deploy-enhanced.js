const hre = require("hardhat");

async function main() {
  console.log("Starting deployment of enhanced contracts...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString(), "\n");

  // Step 1: Deploy AccessControl
  console.log("1. Deploying AccessControl...");
  const AccessControl = await hre.ethers.getContractFactory("AgriChainAccessControl");
  const accessControl = await AccessControl.deploy();
  await accessControl.deployed();
  console.log("✓ AccessControl deployed to:", accessControl.address);
  console.log("");

  // Step 2: Deploy PaymentContractEnhanced
  console.log("2. Deploying PaymentContractEnhanced...");
  const platformWallet = deployer.address; // Change this to actual platform wallet
  const PaymentContractEnhanced = await hre.ethers.getContractFactory("PaymentContractEnhanced");
  const paymentContract = await PaymentContractEnhanced.deploy(platformWallet);
  await paymentContract.deployed();
  console.log("✓ PaymentContractEnhanced deployed to:", paymentContract.address);
  console.log("  Platform wallet:", platformWallet);
  console.log("");

  // Step 3: Deploy SupplyChainRegistryV3
  console.log("3. Deploying SupplyChainRegistryV3...");
  const SupplyChainRegistryV3 = await hre.ethers.getContractFactory("SupplyChainRegistryV3");
  const registry = await SupplyChainRegistryV3.deploy(accessControl.address);
  await registry.deployed();
  console.log("✓ SupplyChainRegistryV3 deployed to:", registry.address);
  console.log("  AccessControl address:", accessControl.address);
  console.log("");

  // Step 4: Configure roles
  console.log("4. Configuring initial roles...");
  
  // Grant ADMIN_ROLE to deployer
  const ADMIN_ROLE = await accessControl.ADMIN_ROLE();
  await accessControl.grantRoleWithVerification(ADMIN_ROLE, deployer.address);
  console.log("✓ Granted ADMIN_ROLE to deployer");
  
  // Verify deployer
  await accessControl.verifyUser(deployer.address);
  console.log("✓ Verified deployer");
  
  console.log("");

  // Step 5: Display summary
  console.log("=".repeat(60));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log("AccessControl:           ", accessControl.address);
  console.log("PaymentContractEnhanced: ", paymentContract.address);
  console.log("SupplyChainRegistryV3:   ", registry.address);
  console.log("");
  console.log("Configuration:");
  console.log("--------------");
  console.log("Platform Wallet:         ", platformWallet);
  console.log("Platform Fee:            ", await paymentContract.platformFeePercent(), "%");
  console.log("Daily Payment Limit:     ", await paymentContract.DAILY_PAYMENT_LIMIT());
  console.log("Max Batch Size:          ", await registry.MAX_BATCH_SIZE());
  console.log("Price Reveal Delay:      ", await registry.REVEAL_DELAY(), "seconds");
  console.log("");
  console.log("Next Steps:");
  console.log("-----------");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Set up multi-sig wallet (recommended)");
  console.log("3. Configure multi-sig for critical operations");
  console.log("4. Grant roles to team members");
  console.log("5. Test all functionality on testnet");
  console.log("");
  console.log("Multi-Sig Setup Commands:");
  console.log("-------------------------");
  console.log(`await paymentContract.setMultiSigWallet("<GNOSIS_SAFE_ADDRESS>");`);
  console.log(`await paymentContract.setMultiSigEnabled(true);`);
  console.log(`await registry.setMultiSigWallet("<GNOSIS_SAFE_ADDRESS>");`);
  console.log(`await registry.setMultiSigEnabled(true);`);
  console.log("");
  console.log("=".repeat(60));

  // Save deployment info to file
  const fs = require('fs');
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      AccessControl: accessControl.address,
      PaymentContractEnhanced: paymentContract.address,
      SupplyChainRegistryV3: registry.address
    },
    configuration: {
      platformWallet: platformWallet,
      platformFeePercent: (await paymentContract.platformFeePercent()).toString(),
      dailyPaymentLimit: (await paymentContract.DAILY_PAYMENT_LIMIT()).toString(),
      maxBatchSize: (await registry.MAX_BATCH_SIZE()).toString(),
      revealDelay: (await registry.REVEAL_DELAY()).toString()
    }
  };

  fs.writeFileSync(
    `deployment-${hre.network.name}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to deployment-*.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
