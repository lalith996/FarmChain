const { ethers } = require('ethers');
const logger = require('../utils/logger');

// Import contract ABIs
const SupplyChainABI = require('../../contracts/SupplyChainRegistry.json');
const PaymentABI = require('../../contracts/PaymentContract.json');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.supplyChainContract = null;
    this.paymentContract = null;
    this.initialize();
  }

  initialize() {
    try {
      // Setup provider
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

      // Setup wallet
      if (process.env.PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      }

      // Setup contracts
      if (process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS) {
        this.supplyChainContract = new ethers.Contract(
          process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS,
          SupplyChainABI.abi,
          this.wallet || this.provider
        );
      }

      if (process.env.PAYMENT_CONTRACT_ADDRESS) {
        this.paymentContract = new ethers.Contract(
          process.env.PAYMENT_CONTRACT_ADDRESS,
          PaymentABI.abi,
          this.wallet || this.provider
        );
      }

      logger.info('✅ Blockchain service initialized');
      logger.info(`🌐 Network: ${process.env.BLOCKCHAIN_NETWORK}`);
      logger.info(`📝 Supply Chain Contract: ${process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS}`);
      logger.info(`💰 Payment Contract: ${process.env.PAYMENT_CONTRACT_ADDRESS}`);

    } catch (error) {
      logger.error('Error initializing blockchain service:', error);
      throw error;
    }
  }

  // Product Management
  async registerProduct(productData) {
    try {
      const tx = await this.supplyChainContract.registerProduct(
        productData.name,
        productData.category,
        productData.quantity,
        productData.unit,
        ethers.parseEther(productData.pricePerUnit.toString()),
        Math.floor(new Date(productData.harvestDate).getTime() / 1000),
        productData.grade || 0,
        productData.ipfsHash
      );

      const receipt = await tx.wait();
      logger.info(`Product registered: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        productId: receipt.logs[0].topics[1]
      };
    } catch (error) {
      logger.error('Error registering product:', error);
      throw error;
    }
  }

  async transferOwnership(productId, newOwner, location) {
    try {
      const tx = await this.supplyChainContract.transferOwnership(
        productId,
        newOwner,
        location
      );

      const receipt = await tx.wait();
      logger.info(`Ownership transferred: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Error transferring ownership:', error);
      throw error;
    }
  }

  async updateProductStatus(productId, status, location) {
    try {
      const tx = await this.supplyChainContract.updateProductStatus(
        productId,
        status,
        location
      );

      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Error updating product status:', error);
      throw error;
    }
  }

  async addQualityCheck(productId, grade, reportHash, notes) {
    try {
      const tx = await this.supplyChainContract.addQualityCheck(
        productId,
        grade,
        reportHash,
        notes
      );

      const receipt = await tx.wait();
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Error adding quality check:', error);
      throw error;
    }
  }

  async getProduct(productId) {
    try {
      const product = await this.supplyChainContract.getProduct(productId);
      return product;
    } catch (error) {
      logger.error('Error getting product:', error);
      throw error;
    }
  }

  async getProductHistory(productId) {
    try {
      const history = await this.supplyChainContract.getProductHistory(productId);
      return history;
    } catch (error) {
      logger.error('Error getting product history:', error);
      throw error;
    }
  }

  // Payment Management
  async createPayment(orderId, seller, amount, releaseTime) {
    try {
      const tx = await this.paymentContract.createPayment(
        orderId,
        seller,
        releaseTime,
        { value: ethers.parseEther(amount.toString()) }
      );

      const receipt = await tx.wait();
      logger.info(`Payment created: ${receipt.hash}`);

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        paymentId: receipt.logs[0].topics[1]
      };
    } catch (error) {
      logger.error('Error creating payment:', error);
      throw error;
    }
  }

  async releasePayment(paymentId) {
    try {
      const tx = await this.paymentContract.releasePayment(paymentId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Error releasing payment:', error);
      throw error;
    }
  }

  async requestRefund(paymentId, reason) {
    try {
      const tx = await this.paymentContract.requestRefund(paymentId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        reason
      };
    } catch (error) {
      logger.error('Error requesting refund:', error);
      throw error;
    }
  }

  async resolveDispute(paymentId, refundBuyer) {
    try {
      const tx = await this.paymentContract.resolveDispute(paymentId, refundBuyer);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        refundBuyer
      };
    } catch (error) {
      logger.error('Error resolving dispute:', error);
      throw error;
    }
  }

  async cancelPayment(paymentId) {
    try {
      const tx = await this.paymentContract.cancelPayment(paymentId);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      logger.error('Error cancelling payment:', error);
      throw error;
    }
  }

  async getPayment(paymentId) {
    try {
      const payment = await this.paymentContract.getPayment(paymentId);
      return payment;
    } catch (error) {
      logger.error('Error getting payment:', error);
      throw error;
    }
  }

  // Utility Methods
  async getTransaction(txHash) {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      return {
        transaction: tx,
        receipt: receipt
      };
    } catch (error) {
      logger.error('Error getting transaction:', error);
      throw error;
    }
  }

  async getBlockNumber() {
    try {
      return await this.provider.getBlockNumber();
    } catch (error) {
      logger.error('Error getting block number:', error);
      throw error;
    }
  }

  async getGasPrice() {
    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice.toString();
    } catch (error) {
      logger.error('Error getting gas price:', error);
      throw error;
    }
  }

  async getNetwork() {
    try {
      return await this.provider.getNetwork();
    } catch (error) {
      logger.error('Error getting network:', error);
      throw error;
    }
  }

  async verifyMessage(message, signature, expectedAddress) {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
      logger.error('Error verifying message:', error);
      return false;
    }
  }
}

module.exports = new BlockchainService();
