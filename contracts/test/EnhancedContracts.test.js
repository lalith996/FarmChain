const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Enhanced Contracts Security Tests", function () {
  let accessControl, paymentContract, registry;
  let owner, farmer, distributor, retailer, platformWallet, multiSig;
  let FARMER_ROLE, DISTRIBUTOR_ROLE, RETAILER_ROLE, ADMIN_ROLE;

  beforeEach(async function () {
    [owner, farmer, distributor, retailer, platformWallet, multiSig] = await ethers.getSigners();

    // Deploy AccessControl
    const AccessControl = await ethers.getContractFactory("AgriChainAccessControl");
    accessControl = await AccessControl.deploy();
    await accessControl.deployed();

    // Deploy PaymentContractEnhanced
    const PaymentContractEnhanced = await ethers.getContractFactory("PaymentContractEnhanced");
    paymentContract = await PaymentContractEnhanced.deploy(platformWallet.address);
    await paymentContract.deployed();

    // Deploy SupplyChainRegistryV3
    const SupplyChainRegistryV3 = await ethers.getContractFactory("SupplyChainRegistryV3");
    registry = await SupplyChainRegistryV3.deploy(accessControl.address);
    await registry.deployed();

    // Get role constants
    FARMER_ROLE = await accessControl.FARMER_ROLE();
    DISTRIBUTOR_ROLE = await accessControl.DISTRIBUTOR_ROLE();
    RETAILER_ROLE = await accessControl.RETAILER_ROLE();
    ADMIN_ROLE = await accessControl.ADMIN_ROLE();

    // Setup roles
    await accessControl.grantRoleWithVerification(ADMIN_ROLE, owner.address);
    await accessControl.grantRoleWithVerification(FARMER_ROLE, farmer.address);
    await accessControl.grantRoleWithVerification(DISTRIBUTOR_ROLE, distributor.address);
    await accessControl.grantRoleWithVerification(RETAILER_ROLE, retailer.address);

    // Verify users
    await accessControl.verifyUser(farmer.address);
    await accessControl.approveKYC(farmer.address);
    await accessControl.verifyUser(distributor.address);
    await accessControl.approveKYC(distributor.address);
  });

  describe("FIX #16: Rate Limiting", function () {
    it("Should enforce daily payment creation limit", async function () {
      const DAILY_LIMIT = await paymentContract.DAILY_PAYMENT_LIMIT();
      const releaseTime = (await time.latest()) + 86400; // 1 day

      // Create payments up to limit
      for (let i = 0; i < DAILY_LIMIT; i++) {
        await paymentContract.connect(farmer).createPayment(
          i + 1, // orderId
          distributor.address,
          releaseTime,
          { value: ethers.utils.parseEther("1") }
        );
      }

      // Next payment should fail
      await expect(
        paymentContract.connect(farmer).createPayment(
          DAILY_LIMIT + 1,
          distributor.address,
          releaseTime,
          { value: ethers.utils.parseEther("1") }
        )
      ).to.be.revertedWith("Daily payment creation limit reached");
    });

    it("Should reset rate limit after 24 hours", async function () {
      const releaseTime = (await time.latest()) + 86400;

      // Create one payment
      await paymentContract.connect(farmer).createPayment(
        1,
        distributor.address,
        releaseTime,
        { value: ethers.utils.parseEther("1") }
      );

      // Fast forward 24 hours
      await time.increase(86400);

      // Should be able to create another payment
      await expect(
        paymentContract.connect(farmer).createPayment(
          2,
          distributor.address,
          releaseTime + 86400,
          { value: ethers.utils.parseEther("1") }
        )
      ).to.not.be.reverted;
    });

    it("Should enforce product creation rate limit", async function () {
      const DAILY_LIMIT = 50;

      // Create products up to limit
      for (let i = 0; i < DAILY_LIMIT; i++) {
        await registry.connect(farmer).registerProduct(
          `Product ${i}`,
          "Vegetables",
          100,
          "kg",
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("8"),
          `ipfs://hash${i}`
        );
      }

      // Next product should fail
      await expect(
        registry.connect(farmer).registerProduct(
          "Product Overflow",
          "Vegetables",
          100,
          "kg",
          ethers.utils.parseEther("10"),
          ethers.utils.parseEther("8"),
          "ipfs://overflow"
        )
      ).to.be.revertedWith("Daily product creation limit reached");
    });
  });

  describe("FIX #18: Front-Running Protection", function () {
    let productId;

    beforeEach(async function () {
      // Register a product
      const tx = await registry.connect(farmer).registerProduct(
        "Tomatoes",
        "Vegetables",
        100,
        "kg",
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("8"),
        "ipfs://tomatoes"
      );
      const receipt = await tx.wait();
      productId = receipt.events.find(e => e.event === "ProductRegistered").args.productId;

      // Approve product
      await registry.connect(owner).approveProduct(productId);
    });

    it("Should require commit before reveal", async function () {
      const newPrice = ethers.utils.parseEther("15");
      const salt = ethers.utils.randomBytes(32);

      // Try to reveal without commit
      await expect(
        registry.connect(farmer).revealPriceUpdate(productId, newPrice, salt)
      ).to.be.revertedWith("No commitment found");
    });

    it("Should enforce reveal delay", async function () {
      const newPrice = ethers.utils.parseEther("15");
      const salt = ethers.utils.randomBytes(32);

      // Create commitment hash
      const commitmentHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'uint256', 'bytes32', 'address'],
          [productId, newPrice, salt, farmer.address]
        )
      );

      // Commit
      await registry.connect(farmer).commitPriceUpdate(productId, commitmentHash);

      // Try to reveal immediately
      await expect(
        registry.connect(farmer).revealPriceUpdate(productId, newPrice, salt)
      ).to.be.revertedWith("Reveal delay not met");
    });

    it("Should successfully update price with commit-reveal", async function () {
      const newPrice = ethers.utils.parseEther("15");
      const salt = ethers.utils.randomBytes(32);

      // Create commitment hash
      const commitmentHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'uint256', 'bytes32', 'address'],
          [productId, newPrice, salt, farmer.address]
        )
      );

      // Commit
      await registry.connect(farmer).commitPriceUpdate(productId, commitmentHash);

      // Wait for reveal delay (5 minutes)
      await time.increase(300);

      // Reveal
      await expect(
        registry.connect(farmer).revealPriceUpdate(productId, newPrice, salt)
      ).to.emit(registry, "PriceRevealed");

      // Verify price updated
      const product = await registry.getProduct(productId);
      expect(product.pricePerUnit).to.equal(newPrice);
    });

    it("Should reject invalid reveal", async function () {
      const newPrice = ethers.utils.parseEther("15");
      const wrongPrice = ethers.utils.parseEther("20");
      const salt = ethers.utils.randomBytes(32);

      // Create commitment hash with correct price
      const commitmentHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'uint256', 'bytes32', 'address'],
          [productId, newPrice, salt, farmer.address]
        )
      );

      // Commit
      await registry.connect(farmer).commitPriceUpdate(productId, commitmentHash);

      // Wait for reveal delay
      await time.increase(300);

      // Try to reveal with wrong price
      await expect(
        registry.connect(farmer).revealPriceUpdate(productId, wrongPrice, salt)
      ).to.be.revertedWith("Invalid reveal");
    });

    it("Should expire commitment after 1 hour", async function () {
      const newPrice = ethers.utils.parseEther("15");
      const salt = ethers.utils.randomBytes(32);

      const commitmentHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'uint256', 'bytes32', 'address'],
          [productId, newPrice, salt, farmer.address]
        )
      );

      await registry.connect(farmer).commitPriceUpdate(productId, commitmentHash);

      // Wait more than 1 hour
      await time.increase(3601);

      // Try to reveal
      await expect(
        registry.connect(farmer).revealPriceUpdate(productId, newPrice, salt)
      ).to.be.revertedWith("Commitment expired");
    });
  });

  describe("FIX #19, #20: Multi-Sig Support", function () {
    it("Should allow setting multi-sig wallet", async function () {
      await expect(
        paymentContract.setMultiSigWallet(multiSig.address)
      ).to.emit(paymentContract, "MultiSigWalletUpdated");

      expect(await paymentContract.multiSigWallet()).to.equal(multiSig.address);
    });

    it("Should reject zero address for multi-sig", async function () {
      await expect(
        paymentContract.setMultiSigWallet(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid multi-sig address");
    });

    it("Should enable multi-sig requirement", async function () {
      await paymentContract.setMultiSigWallet(multiSig.address);
      
      await expect(
        paymentContract.setMultiSigEnabled(true)
      ).to.emit(paymentContract, "MultiSigEnabled");

      expect(await paymentContract.multiSigEnabled()).to.be.true;
    });

    it("Should require multi-sig for critical operations when enabled", async function () {
      // Set up multi-sig
      await paymentContract.setMultiSigWallet(multiSig.address);
      await paymentContract.setMultiSigEnabled(true);

      // Try to change fee as owner (should fail)
      await expect(
        paymentContract.setPlatformFee(5)
      ).to.be.revertedWith("Only multi-sig can execute");

      // Should work from multi-sig address
      await expect(
        paymentContract.connect(multiSig).setPlatformFee(5)
      ).to.not.be.reverted;
    });

    it("Should require multi-sig for pause when enabled", async function () {
      await paymentContract.setMultiSigWallet(multiSig.address);
      await paymentContract.setMultiSigEnabled(true);

      // Try to pause as owner (should fail)
      await expect(
        paymentContract.pause()
      ).to.be.revertedWith("Only multi-sig can execute");

      // Should work from multi-sig
      await expect(
        paymentContract.connect(multiSig).pause()
      ).to.not.be.reverted;
    });

    it("Should allow owner operations when multi-sig disabled", async function () {
      // Multi-sig not enabled
      await expect(
        paymentContract.setPlatformFee(5)
      ).to.not.be.reverted;
    });
  });

  describe("Integration: All Fixes Working Together", function () {
    it("Should handle complete product lifecycle with all security features", async function () {
      // 1. Register product (with rate limiting)
      const tx = await registry.connect(farmer).registerProduct(
        "Organic Apples",
        "Fruits",
        500,
        "kg",
        ethers.utils.parseEther("20"),
        ethers.utils.parseEther("15"),
        "ipfs://apples"
      );
      const receipt = await tx.wait();
      const productId = receipt.events.find(e => e.event === "ProductRegistered").args.productId;

      // 2. Approve product
      await registry.connect(owner).approveProduct(productId);

      // 3. Update price with commit-reveal (front-running protection)
      const newPrice = ethers.utils.parseEther("25");
      const salt = ethers.utils.randomBytes(32);
      const commitmentHash = ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ['uint256', 'uint256', 'bytes32', 'address'],
          [productId, newPrice, salt, farmer.address]
        )
      );

      await registry.connect(farmer).commitPriceUpdate(productId, commitmentHash);
      await time.increase(300);
      await registry.connect(farmer).revealPriceUpdate(productId, newPrice, salt);

      // 4. Create payment (with rate limiting)
      const releaseTime = (await time.latest()) + 86400;
      const paymentTx = await paymentContract.connect(distributor).createPayment(
        1,
        farmer.address,
        releaseTime,
        { value: ethers.utils.parseEther("100") }
      );

      // 5. Transfer ownership
      await registry.connect(farmer).transferOwnership(
        productId,
        distributor.address,
        "Warehouse A",
        ethers.utils.parseEther("100"),
        { value: ethers.utils.parseEther("100") }
      );

      // Verify final state
      const product = await registry.getProduct(productId);
      expect(product.pricePerUnit).to.equal(newPrice);
      expect(await registry.getCurrentOwner(productId)).to.equal(distributor.address);
    });
  });

  describe("Backward Compatibility", function () {
    it("Should maintain compatibility with existing functionality", async function () {
      // Test that all original features still work
      const tx = await registry.connect(farmer).registerProduct(
        "Test Product",
        "Test Category",
        100,
        "kg",
        ethers.utils.parseEther("10"),
        ethers.utils.parseEther("8"),
        "ipfs://test"
      );

      await expect(tx).to.emit(registry, "ProductRegistered");
    });
  });
});
