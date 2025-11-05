const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("SupplyChainRegistry", function () {
  let supplyChain;
  let owner, farmer, distributor, retailer, consumer;
  let FARMER_ROLE, DISTRIBUTOR_ROLE, RETAILER_ROLE, ADMIN_ROLE;

  beforeEach(async function () {
    [owner, farmer, distributor, retailer, consumer] = await ethers.getSigners();

    const SupplyChainRegistry = await ethers.getContractFactory("SupplyChainRegistry");
    supplyChain = await SupplyChainRegistry.deploy();
    await supplyChain.waitForDeployment();

    // Get role hashes
    FARMER_ROLE = await supplyChain.FARMER_ROLE();
    DISTRIBUTOR_ROLE = await supplyChain.DISTRIBUTOR_ROLE();
    RETAILER_ROLE = await supplyChain.RETAILER_ROLE();
    ADMIN_ROLE = await supplyChain.ADMIN_ROLE();

    // Grant roles
    await supplyChain.grantRole(FARMER_ROLE, farmer.address);
    await supplyChain.grantRole(DISTRIBUTOR_ROLE, distributor.address);
    await supplyChain.grantRole(RETAILER_ROLE, retailer.address);
  });

  describe("Deployment", function () {
    it("Should set the correct admin role", async function () {
      expect(await supplyChain.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should initialize with zero products", async function () {
      expect(await supplyChain.getTotalProducts()).to.equal(0);
    });
  });

  describe("Product Registration", function () {
    it("Should register a product successfully", async function () {
      const tx = await supplyChain.connect(farmer).registerProduct(
        "Organic Tomatoes",
        "Vegetables",
        1000,
        "kg",
        ethers.parseEther("0.05"),
        Math.floor(Date.now() / 1000) - 86400,
        0, // Grade A
        "QmTest123"
      );

      await expect(tx)
        .to.emit(supplyChain, "ProductRegistered")
        .withArgs(1, farmer.address, "Organic Tomatoes", 1000, await time.latest());

      const product = await supplyChain.getProduct(1);
      expect(product.name).to.equal("Organic Tomatoes");
      expect(product.farmer).to.equal(farmer.address);
      expect(product.quantity).to.equal(1000);
    });

    it("Should fail if non-farmer tries to register", async function () {
      await expect(
        supplyChain.connect(consumer).registerProduct(
          "Organic Tomatoes",
          "Vegetables",
          1000,
          "kg",
          ethers.parseEther("0.05"),
          Math.floor(Date.now() / 1000),
          0,
          "QmTest123"
        )
      ).to.be.revertedWith("Only farmers can register");
    });

    it("Should fail with invalid parameters", async function () {
      await expect(
        supplyChain.connect(farmer).registerProduct(
          "",
          "Vegetables",
          1000,
          "kg",
          ethers.parseEther("0.05"),
          Math.floor(Date.now() / 1000),
          0,
          "QmTest123"
        )
      ).to.be.revertedWith("Name cannot be empty");

      await expect(
        supplyChain.connect(farmer).registerProduct(
          "Tomatoes",
          "Vegetables",
          0,
          "kg",
          ethers.parseEther("0.05"),
          Math.floor(Date.now() / 1000),
          0,
          "QmTest123"
        )
      ).to.be.revertedWith("Quantity must be greater than 0");
    });
  });

  describe("Ownership Transfer", function () {
    beforeEach(async function () {
      await supplyChain.connect(farmer).registerProduct(
        "Organic Tomatoes",
        "Vegetables",
        1000,
        "kg",
        ethers.parseEther("0.05"),
        Math.floor(Date.now() / 1000) - 86400,
        0,
        "QmTest123"
      );
    });

    it("Should transfer ownership successfully", async function () {
      const tx = await supplyChain.connect(farmer).transferOwnership(
        1,
        distributor.address,
        "Warehouse A"
      );

      await expect(tx)
        .to.emit(supplyChain, "OwnershipTransferred")
        .withArgs(1, farmer.address, distributor.address, await time.latest());

      const product = await supplyChain.getProduct(1);
      expect(product.farmer).to.equal(distributor.address);

      const history = await supplyChain.getProductHistory(1);
      expect(history.length).to.equal(2);
      expect(history[1].to).to.equal(distributor.address);
    });

    it("Should fail if not owner", async function () {
      await expect(
        supplyChain.connect(consumer).transferOwnership(1, distributor.address, "Test")
      ).to.be.revertedWith("Not authorized");
    });

    it("Should fail with invalid recipient", async function () {
      await expect(
        supplyChain.connect(farmer).transferOwnership(1, ethers.ZeroAddress, "Test")
      ).to.be.revertedWith("Invalid address");

      await expect(
        supplyChain.connect(farmer).transferOwnership(1, farmer.address, "Test")
      ).to.be.revertedWith("Cannot transfer to yourself");
    });
  });

  describe("Status Updates", function () {
    beforeEach(async function () {
      await supplyChain.connect(farmer).registerProduct(
        "Organic Tomatoes",
        "Vegetables",
        1000,
        "kg",
        ethers.parseEther("0.05"),
        Math.floor(Date.now() / 1000) - 86400,
        0,
        "QmTest123"
      );
    });

    it("Should update product status", async function () {
      const tx = await supplyChain.connect(farmer).updateProductStatus(
        1,
        1, // InTransit
        "En route to warehouse"
      );

      await expect(tx)
        .to.emit(supplyChain, "ProductStatusUpdated")
        .withArgs(1, 1, "En route to warehouse", await time.latest());

      const product = await supplyChain.getProduct(1);
      expect(product.status).to.equal(1);
    });
  });

  describe("Quality Checks", function () {
    beforeEach(async function () {
      await supplyChain.connect(farmer).registerProduct(
        "Organic Tomatoes",
        "Vegetables",
        1000,
        "kg",
        ethers.parseEther("0.05"),
        Math.floor(Date.now() / 1000) - 86400,
        0,
        "QmTest123"
      );
    });

    it("Should add quality check", async function () {
      const tx = await supplyChain.connect(farmer).addQualityCheck(
        1,
        0, // Grade A
        "QmQualityReport",
        "Excellent quality"
      );

      await expect(tx)
        .to.emit(supplyChain, "QualityCheckAdded")
        .withArgs(1, farmer.address, 0, await time.latest());

      const checks = await supplyChain.getQualityChecks(1);
      expect(checks.length).to.equal(1);
      expect(checks[0].grade).to.equal(0);
    });

    it("Should update product grade after quality check", async function () {
      await supplyChain.connect(farmer).addQualityCheck(
        1,
        1, // Grade B
        "QmQualityReport",
        "Good quality"
      );

      const product = await supplyChain.getProduct(1);
      expect(product.grade).to.equal(1);
    });
  });

  describe("Price Updates", function () {
    beforeEach(async function () {
      await supplyChain.connect(farmer).registerProduct(
        "Organic Tomatoes",
        "Vegetables",
        1000,
        "kg",
        ethers.parseEther("0.05"),
        Math.floor(Date.now() / 1000) - 86400,
        0,
        "QmTest123"
      );
    });

    it("Should update product price", async function () {
      const newPrice = ethers.parseEther("0.06");
      const tx = await supplyChain.connect(farmer).updateProductPrice(1, newPrice);

      await expect(tx)
        .to.emit(supplyChain, "ProductPriceUpdated");

      const product = await supplyChain.getProduct(1);
      expect(product.pricePerUnit).to.equal(newPrice);
    });
  });

  describe("Admin Functions", function () {
    it("Should pause and unpause contract", async function () {
      await supplyChain.pause();
      
      await expect(
        supplyChain.connect(farmer).registerProduct(
          "Tomatoes",
          "Vegetables",
          1000,
          "kg",
          ethers.parseEther("0.05"),
          Math.floor(Date.now() / 1000),
          0,
          "QmTest123"
        )
      ).to.be.reverted;

      await supplyChain.unpause();
      
      await expect(
        supplyChain.connect(farmer).registerProduct(
          "Tomatoes",
          "Vegetables",
          1000,
          "kg",
          ethers.parseEther("0.05"),
          Math.floor(Date.now() / 1000) - 86400,
          0,
          "QmTest123"
        )
      ).to.not.be.reverted;
    });
  });
});
