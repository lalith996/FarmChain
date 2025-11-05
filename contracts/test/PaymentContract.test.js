const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PaymentContract", function () {
  let payment;
  let owner, buyer, seller, platformWallet;

  beforeEach(async function () {
    [owner, buyer, seller, platformWallet] = await ethers.getSigners();

    const PaymentContract = await ethers.getContractFactory("PaymentContract");
    payment = await PaymentContract.deploy(platformWallet.address);
    await payment.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct platform wallet", async function () {
      expect(await payment.platformWallet()).to.equal(platformWallet.address);
    });

    it("Should set default platform fee", async function () {
      expect(await payment.platformFeePercent()).to.equal(2);
    });
  });

  describe("Payment Creation", function () {
    it("Should create payment successfully", async function () {
      const orderId = 1;
      const amount = ethers.parseEther("1");
      const releaseTime = (await time.latest()) + 86400; // 1 day

      const tx = await payment.connect(buyer).createPayment(
        orderId,
        seller.address,
        releaseTime,
        { value: amount }
      );

      await expect(tx)
        .to.emit(payment, "PaymentCreated")
        .withArgs(1, orderId, buyer.address, seller.address, amount);

      const createdPayment = await payment.getPayment(1);
      expect(createdPayment.buyer).to.equal(buyer.address);
      expect(createdPayment.seller).to.equal(seller.address);
      expect(createdPayment.amount).to.equal(amount);
      expect(createdPayment.status).to.equal(1); // Escrowed
    });

    it("Should fail with invalid parameters", async function () {
      const releaseTime = (await time.latest()) + 86400;

      await expect(
        payment.connect(buyer).createPayment(1, seller.address, releaseTime, { value: 0 })
      ).to.be.revertedWith("Payment amount must be greater than 0");

      await expect(
        payment.connect(buyer).createPayment(1, ethers.ZeroAddress, releaseTime, {
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWith("Invalid seller address");

      await expect(
        payment.connect(buyer).createPayment(1, buyer.address, releaseTime, {
          value: ethers.parseEther("1")
        })
      ).to.be.revertedWith("Buyer and seller cannot be same");
    });
  });

  describe("Payment Release", function () {
    beforeEach(async function () {
      const orderId = 1;
      const amount = ethers.parseEther("1");
      const releaseTime = (await time.latest()) + 86400;

      await payment.connect(buyer).createPayment(
        orderId,
        seller.address,
        releaseTime,
        { value: amount }
      );
    });

    it("Should release payment by buyer", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const platformBalanceBefore = await ethers.provider.getBalance(platformWallet.address);

      await payment.connect(buyer).releasePayment(1);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      const platformBalanceAfter = await ethers.provider.getBalance(platformWallet.address);

      // Seller should receive 98% (2% platform fee)
      const expectedSellerAmount = ethers.parseEther("0.98");
      const expectedPlatformFee = ethers.parseEther("0.02");

      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedSellerAmount);
      expect(platformBalanceAfter - platformBalanceBefore).to.equal(expectedPlatformFee);

      const paymentData = await payment.getPayment(1);
      expect(paymentData.status).to.equal(2); // Released
    });

    it("Should auto-release after release time", async function () {
      // Fast forward time
      await time.increase(86400 + 1);

      const canRelease = await payment.canAutoRelease(1);
      expect(canRelease).to.be.true;

      await payment.connect(owner).releasePayment(1);

      const paymentData = await payment.getPayment(1);
      expect(paymentData.status).to.equal(2);
    });
  });

  describe("Refund Request", function () {
    beforeEach(async function () {
      const orderId = 1;
      const amount = ethers.parseEther("1");
      const releaseTime = (await time.latest()) + 86400;

      await payment.connect(buyer).createPayment(
        orderId,
        seller.address,
        releaseTime,
        { value: amount }
      );
    });

    it("Should request refund successfully", async function () {
      const tx = await payment.connect(buyer).requestRefund(1);

      await expect(tx)
        .to.emit(payment, "DisputeRaised")
        .withArgs(1, buyer.address, await time.latest());

      const paymentData = await payment.getPayment(1);
      expect(paymentData.disputed).to.be.true;
    });

    it("Should fail if not buyer", async function () {
      await expect(
        payment.connect(seller).requestRefund(1)
      ).to.be.revertedWith("Only buyer can request refund");
    });
  });

  describe("Dispute Resolution", function () {
    beforeEach(async function () {
      const orderId = 1;
      const amount = ethers.parseEther("1");
      const releaseTime = (await time.latest()) + 86400;

      await payment.connect(buyer).createPayment(
        orderId,
        seller.address,
        releaseTime,
        { value: amount }
      );

      await payment.connect(buyer).requestRefund(1);
    });

    it("Should resolve dispute in favor of buyer", async function () {
      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      await payment.connect(owner).resolveDispute(1, true);

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      expect(buyerBalanceAfter - buyerBalanceBefore).to.equal(ethers.parseEther("1"));

      const paymentData = await payment.getPayment(1);
      expect(paymentData.status).to.equal(3); // Refunded
      expect(paymentData.disputed).to.be.false;
    });

    it("Should resolve dispute in favor of seller", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

      await payment.connect(owner).resolveDispute(1, false);

      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(ethers.parseEther("0.98"));

      const paymentData = await payment.getPayment(1);
      expect(paymentData.status).to.equal(2); // Released
      expect(paymentData.disputed).to.be.false;
    });
  });

  describe("Payment Cancellation", function () {
    it("Should cancel payment within grace period", async function () {
      const orderId = 1;
      const amount = ethers.parseEther("1");
      const releaseTime = (await time.latest()) + 86400;

      await payment.connect(buyer).createPayment(
        orderId,
        seller.address,
        releaseTime,
        { value: amount }
      );

      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      const tx = await payment.connect(buyer).cancelPayment(1);
      const receipt = await tx.wait();
      const gasCost = receipt.gasUsed * receipt.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);
      const refundedAmount = buyerBalanceAfter - buyerBalanceBefore + gasCost;

      expect(refundedAmount).to.equal(amount);

      const paymentData = await payment.getPayment(1);
      expect(paymentData.status).to.equal(3); // Refunded
    });

    it("Should fail after grace period", async function () {
      const orderId = 1;
      const amount = ethers.parseEther("1");
      const releaseTime = (await time.latest()) + 86400;

      await payment.connect(buyer).createPayment(
        orderId,
        seller.address,
        releaseTime,
        { value: amount }
      );

      await time.increase(3601); // More than 1 hour

      await expect(
        payment.connect(buyer).cancelPayment(1)
      ).to.be.revertedWith("Grace period expired");
    });
  });

  describe("Admin Functions", function () {
    it("Should update platform fee", async function () {
      await payment.setPlatformFee(5);
      expect(await payment.platformFeePercent()).to.equal(5);
    });

    it("Should fail with invalid fee", async function () {
      await expect(
        payment.setPlatformFee(11)
      ).to.be.revertedWith("Fee cannot exceed maximum");
    });

    it("Should update platform wallet", async function () {
      const [, , , , newWallet] = await ethers.getSigners();
      await payment.setPlatformWallet(newWallet.address);
      expect(await payment.platformWallet()).to.equal(newWallet.address);
    });
  });
});
