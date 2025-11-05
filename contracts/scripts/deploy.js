const hre = require("hardhat");

async function main() {
  console.log("Starting deployment...");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy SupplyChainRegistry
  console.log("\nDeploying SupplyChainRegistry...");
  const SupplyChainRegistry = await hre.ethers.getContractFactory("SupplyChainRegistry");
  const supplyChain = await SupplyChainRegistry.deploy();
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("SupplyChainRegistry deployed to:", supplyChainAddress);

  // Deploy PaymentContract
  console.log("\nDeploying PaymentContract...");
  const platformWallet = process.env.PLATFORM_WALLET_ADDRESS || deployer.address;
  const PaymentContract = await hre.ethers.getContractFactory("PaymentContract");
  const payment = await PaymentContract.deploy(platformWallet);
  await payment.waitForDeployment();
  const paymentAddress = await payment.getAddress();
  console.log("PaymentContract deployed to:", paymentAddress);
  console.log("Platform wallet:", platformWallet);

  // Wait for block confirmations
  console.log("\nWaiting for block confirmations...");
  await supplyChain.deploymentTransaction().wait(5);
  await payment.deploymentTransaction().wait(5);

  // Verify contracts on block explorer (if not local network)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\nVerifying contracts on block explorer...");
    
    try {
      await hre.run("verify:verify", {
        address: supplyChainAddress,
        constructorArguments: [],
      });
      console.log("SupplyChainRegistry verified");
    } catch (error) {
      console.log("Error verifying SupplyChainRegistry:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: paymentAddress,
        constructorArguments: [platformWallet],
      });
      console.log("PaymentContract verified");
    } catch (error) {
      console.log("Error verifying PaymentContract:", error.message);
    }
  }

  // Save deployment addresses
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployer: deployer.address,
    contracts: {
      SupplyChainRegistry: supplyChainAddress,
      PaymentContract: paymentAddress
    },
    timestamp: new Date().toISOString()
  };

  const deploymentPath = `./deployments/${hre.network.name}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to:", deploymentPath);

  // Grant initial roles
  console.log("\nSetting up initial roles...");
  const FARMER_ROLE = await supplyChain.FARMER_ROLE();
  const DISTRIBUTOR_ROLE = await supplyChain.DISTRIBUTOR_ROLE();
  const RETAILER_ROLE = await supplyChain.RETAILER_ROLE();

  // Grant deployer all roles for testing
  await supplyChain.grantRole(FARMER_ROLE, deployer.address);
  await supplyChain.grantRole(DISTRIBUTOR_ROLE, deployer.address);
  await supplyChain.grantRole(RETAILER_ROLE, deployer.address);
  console.log("Initial roles granted to deployer");

  console.log("\n✅ Deployment completed successfully!");
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("SupplyChainRegistry:", supplyChainAddress);
  console.log("PaymentContract:", paymentAddress);
  console.log("\nUpdate your frontend with these addresses.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
