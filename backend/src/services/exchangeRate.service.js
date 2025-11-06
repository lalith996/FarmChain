const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Exchange Rate Service
 * Fetches real-time cryptocurrency exchange rates
 * Supports multiple providers with fallback
 */
class ExchangeRateService {
  constructor() {
    this.cache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.SUPPORTED_CURRENCIES = ['USD', 'INR', 'EUR'];
    this.SUPPORTED_CRYPTO = ['MATIC', 'ETH', 'BTC'];
  }

  /**
   * Get exchange rate from fiat to crypto
   * @param {string} fiatCurrency - USD, INR, EUR
   * @param {string} cryptoCurrency - MATIC, ETH, BTC
   * @param {number} amount - Amount in fiat
   * @returns {Promise<object>} - Exchange rate and crypto amount
   */
  async convertFiatToCrypto(fiatCurrency, cryptoCurrency, amount) {
    try {
      // Validate inputs
      if (!this.SUPPORTED_CURRENCIES.includes(fiatCurrency)) {
        throw new Error(`Unsupported fiat currency: ${fiatCurrency}`);
      }

      if (!this.SUPPORTED_CRYPTO.includes(cryptoCurrency)) {
        throw new Error(`Unsupported cryptocurrency: ${cryptoCurrency}`);
      }

      if (typeof amount !== 'number' || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }

      // Check cache first
      const cacheKey = `${fiatCurrency}_${cryptoCurrency}`;
      const cachedRate = this._getFromCache(cacheKey);

      let rate;
      if (cachedRate) {
        rate = cachedRate;
        logger.debug(`Using cached exchange rate for ${cacheKey}: ${rate}`);
      } else {
        // Fetch new rate
        rate = await this._fetchExchangeRate(fiatCurrency, cryptoCurrency);
        this._setCache(cacheKey, rate);
        logger.info(`Fetched new exchange rate for ${cacheKey}: ${rate}`);
      }

      // Calculate crypto amount
      const cryptoAmount = amount / rate;

      return {
        success: true,
        fiatCurrency,
        cryptoCurrency,
        fiatAmount: amount,
        cryptoAmount,
        exchangeRate: rate,
        timestamp: new Date().toISOString(),
        cached: !!cachedRate
      };
    } catch (error) {
      logger.error('Exchange rate conversion error:', error);
      throw error;
    }
  }

  /**
   * Fetch exchange rate from multiple providers with fallback
   * @private
   */
  async _fetchExchangeRate(fiatCurrency, cryptoCurrency) {
    const providers = [
      () => this._fetchFromCoinGecko(fiatCurrency, cryptoCurrency),
      () => this._fetchFromCoinCap(fiatCurrency, cryptoCurrency),
      () => this._fetchFromFallback(fiatCurrency, cryptoCurrency)
    ];

    for (const provider of providers) {
      try {
        const rate = await provider();
        if (rate && rate > 0) {
          return rate;
        }
      } catch (error) {
        logger.warn(`Provider failed, trying next: ${error.message}`);
        continue;
      }
    }

    throw new Error('All exchange rate providers failed');
  }

  /**
   * Fetch from CoinGecko API (Primary)
   * @private
   */
  async _fetchFromCoinGecko(fiatCurrency, cryptoCurrency) {
    const coinIds = {
      'MATIC': 'matic-network',
      'ETH': 'ethereum',
      'BTC': 'bitcoin'
    };

    const coinId = coinIds[cryptoCurrency];
    if (!coinId) {
      throw new Error(`Unknown crypto: ${cryptoCurrency}`);
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      {
        params: {
          ids: coinId,
          vs_currencies: fiatCurrency.toLowerCase()
        },
        timeout: 5000
      }
    );

    const rate = response.data[coinId]?.[fiatCurrency.toLowerCase()];
    if (!rate) {
      throw new Error('Rate not found in response');
    }

    return rate;
  }

  /**
   * Fetch from CoinCap API (Secondary)
   * @private
   */
  async _fetchFromCoinCap(fiatCurrency, cryptoCurrency) {
    const assetIds = {
      'MATIC': 'polygon',
      'ETH': 'ethereum',
      'BTC': 'bitcoin'
    };

    const assetId = assetIds[cryptoCurrency];
    if (!assetId) {
      throw new Error(`Unknown crypto: ${cryptoCurrency}`);
    }

    const response = await axios.get(
      `https://api.coincap.io/v2/assets/${assetId}`,
      { timeout: 5000 }
    );

    let priceUSD = parseFloat(response.data.data.priceUsd);

    // Convert to target fiat if not USD
    if (fiatCurrency !== 'USD') {
      const fiatRate = await this._getFiatExchangeRate('USD', fiatCurrency);
      priceUSD = priceUSD * fiatRate;
    }

    return priceUSD;
  }

  /**
   * Get fiat-to-fiat exchange rate
   * @private
   */
  async _getFiatExchangeRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return 1;

    // Use a free forex API
    const response = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
      { timeout: 5000 }
    );

    const rate = response.data.rates[toCurrency];
    if (!rate) {
      throw new Error(`Fiat exchange rate not found: ${fromCurrency} to ${toCurrency}`);
    }

    return rate;
  }

  /**
   * Fallback with static rates (last resort)
   * Updates monthly or as needed
   * @private
   */
  async _fetchFromFallback(fiatCurrency, cryptoCurrency) {
    logger.warn('Using fallback exchange rates - update these regularly!');

    // Static rates as of November 2024 (UPDATE THESE REGULARLY!)
    const fallbackRates = {
      'USD_MATIC': 0.75,    // 1 MATIC = $0.75
      'USD_ETH': 2000,      // 1 ETH = $2000
      'USD_BTC': 35000,     // 1 BTC = $35000
      'INR_MATIC': 62,      // 1 MATIC = ₹62
      'INR_ETH': 165000,    // 1 ETH = ₹165000
      'INR_BTC': 2900000,   // 1 BTC = ₹2900000
      'EUR_MATIC': 0.70,    // 1 MATIC = €0.70
      'EUR_ETH': 1850,      // 1 ETH = €1850
      'EUR_BTC': 32500      // 1 BTC = €32500
    };

    const key = `${fiatCurrency}_${cryptoCurrency}`;
    const rate = fallbackRates[key];

    if (!rate) {
      throw new Error(`No fallback rate for ${key}`);
    }

    logger.warn(`Using fallback rate ${key}: ${rate} (Last updated: Nov 2024)`);
    return rate;
  }

  /**
   * Get rate from cache
   * @private
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.rate;
  }

  /**
   * Set rate in cache
   * @private
   */
  _setCache(key, rate) {
    this.cache.set(key, {
      rate,
      timestamp: Date.now()
    });

    // Cleanup old entries (keep cache size reasonable)
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache() {
    this.cache.clear();
    logger.info('Exchange rate cache cleared');
  }

  /**
   * Get current exchange rate without conversion
   */
  async getExchangeRate(fiatCurrency, cryptoCurrency) {
    const cacheKey = `${fiatCurrency}_${cryptoCurrency}`;
    const cachedRate = this._getFromCache(cacheKey);

    if (cachedRate) {
      return {
        rate: cachedRate,
        cached: true,
        timestamp: new Date().toISOString()
      };
    }

    const rate = await this._fetchExchangeRate(fiatCurrency, cryptoCurrency);
    this._setCache(cacheKey, rate);

    return {
      rate,
      cached: false,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new ExchangeRateService();
