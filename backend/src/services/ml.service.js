const axios = require('axios');

/**
 * ML Service Integration
 * Connects Node.js backend with Python ML service
 */
class MLService {
  constructor() {
    this.mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
  }

  /**
   * Predict crop yield
   * @param {Object} data - Yield prediction parameters
   * @returns {Promise<Object>} Prediction result
   */
  async predictYield(data) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/ml/predict-yield`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      return response.data;
    } catch (error) {
      console.error('ML Service - Yield Prediction Error:', error.message);
      throw new Error('Failed to predict crop yield. Please try again later.');
    }
  }

  /**
   * Recommend crop based on soil conditions
   * @param {Object} data - Soil and climate parameters
   * @returns {Promise<Object>} Crop recommendation
   */
  async recommendCrop(data) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/ml/recommend-crop`,
        data,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );

      return response.data;
    } catch (error) {
      console.error('ML Service - Crop Recommendation Error:', error.message);
      throw new Error('Failed to recommend crop. Please try again later.');
    }
  }

  /**
   * Get batch crop recommendations
   * @param {Array} samples - Array of soil samples
   * @returns {Promise<Object>} Batch recommendations
   */
  async batchRecommend(samples) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/ml/batch-recommend`,
        { samples },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error) {
      console.error('ML Service - Batch Recommendation Error:', error.message);
      throw new Error('Failed to process batch recommendations.');
    }
  }

  /**
   * Check ML service health
   * @returns {Promise<Boolean>} Service health status
   */
  async checkHealth() {
    try {
      const response = await axios.get(`${this.mlServiceUrl}/health`, {
        timeout: 5000
      });
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('ML Service - Health Check Failed:', error.message);
      return false;
    }
  }
}

module.exports = new MLService();
