/**
 * QR Code Service
 * Generate and verify QR codes for products
 * Note: Requires 'qrcode' npm package
 */

class QRService {
  /**
   * Generate QR code data for a product
   */
  generateProductQRData(product) {
    return {
      type: 'product',
      productId: product._id,
      name: product.name,
      farmer: product.farmer,
      blockchainHash: product.blockchain?.registrationTxHash,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/${product._id}`,
      timestamp: Date.now()
    };
  }

  /**
   * Generate QR code data URL (for display)
   * This is a placeholder - in production, use 'qrcode' npm package
   */
  async generateQRCodeURL(data) {
    // TODO: Install and use 'qrcode' package
    // const QRCode = require('qrcode');
    // return await QRCode.toDataURL(JSON.stringify(data));
    
    // For now, return the data as JSON
    return {
      dataUrl: null,
      data: JSON.stringify(data),
      message: 'Install qrcode package: npm install qrcode'
    };
  }

  /**
   * Verify QR code data
   */
  verifyQRData(qrData) {
    try {
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      
      // Basic validation
      if (!data.type || !data.productId) {
        return { valid: false, error: 'Invalid QR code format' };
      }

      // Check timestamp (QR codes valid for 30 days)
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      if (data.timestamp && data.timestamp < thirtyDaysAgo) {
        return { valid: false, error: 'QR code expired' };
      }

      return { valid: true, data };
    } catch (error) {
      return { valid: false, error: 'Invalid QR code data' };
    }
  }

  /**
   * Generate batch QR code
   */
  generateBatchQRData(batch) {
    return {
      type: 'batch',
      batchId: batch._id,
      batchNumber: batch.batchNumber,
      productType: batch.productType,
      farmer: batch.farmerId,
      harvestDate: batch.harvestDate,
      blockchainHash: batch.blockchain?.txHash,
      verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify/batch/${batch._id}`,
      timestamp: Date.now()
    };
  }
}

module.exports = new QRService();
