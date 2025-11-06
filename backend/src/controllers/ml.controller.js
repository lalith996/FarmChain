const { asyncHandler, AppError } = require('../middleware/errorHandler');
const mlService = require('../services/ml.service');
const AuditLog = require('../models/AuditLog.model');

/**
 * Predict crop yield
 * POST /api/ml/predict-yield
 */
exports.predictYield = asyncHandler(async (req, res, next) => {
  const { Area, Item, Year, average_rain_fall_mm_per_year, pesticides_tonnes, avg_temp } = req.body;

  // Validate required fields
  if (!Area || !Item || !Year || !average_rain_fall_mm_per_year || !pesticides_tonnes || !avg_temp) {
    return next(new AppError('All fields are required for yield prediction', 400));
  }

  // Call ML service
  const prediction = await mlService.predictYield({
    Area,
    Item,
    Year,
    average_rain_fall_mm_per_year,
    pesticides_tonnes,
    avg_temp
  });

  // Log action
  await AuditLog.logAction({
    user: req.user._id,
    walletAddress: req.user.walletAddress,
    action: 'ml:predict_yield',
    actionCategory: 'ml_prediction',
    success: true,
    metadata: {
      crop: Item,
      area: Area,
      predicted_yield: prediction.prediction.yield
    }
  });

  res.json({
    success: true,
    data: prediction
  });
});

/**
 * Recommend crop
 * POST /api/ml/recommend-crop
 */
exports.recommendCrop = asyncHandler(async (req, res, next) => {
  const { N, P, K, temperature, humidity, ph, rainfall } = req.body;

  // Validate required fields
  if (N === undefined || P === undefined || K === undefined || 
      !temperature || !humidity || !ph || !rainfall) {
    return next(new AppError('All soil and climate parameters are required', 400));
  }

  // Call ML service
  const recommendation = await mlService.recommendCrop({
    N,
    P,
    K,
    temperature,
    humidity,
    ph,
    rainfall
  });

  // Log action
  await AuditLog.logAction({
    user: req.user._id,
    walletAddress: req.user.walletAddress,
    action: 'ml:recommend_crop',
    actionCategory: 'ml_prediction',
    success: true,
    metadata: {
      recommended_crop: recommendation.recommended_crop,
      soil_conditions: { N, P, K, ph }
    }
  });

  res.json({
    success: true,
    data: recommendation
  });
});

/**
 * Batch crop recommendations
 * POST /api/ml/batch-recommend
 */
exports.batchRecommend = asyncHandler(async (req, res, next) => {
  const { samples } = req.body;

  if (!samples || !Array.isArray(samples) || samples.length === 0) {
    return next(new AppError('Samples array is required', 400));
  }

  if (samples.length > 50) {
    return next(new AppError('Maximum 50 samples allowed per batch', 400));
  }

  // Call ML service
  const recommendations = await mlService.batchRecommend(samples);

  // Log action
  await AuditLog.logAction({
    user: req.user._id,
    walletAddress: req.user.walletAddress,
    action: 'ml:batch_recommend',
    actionCategory: 'ml_prediction',
    success: true,
    metadata: {
      sample_count: samples.length
    }
  });

  res.json({
    success: true,
    data: recommendations
  });
});

/**
 * Get ML service health
 * GET /api/ml/health
 */
exports.getMLHealth = asyncHandler(async (req, res) => {
  const isHealthy = await mlService.checkHealth();

  res.json({
    success: true,
    data: {
      ml_service: isHealthy ? 'healthy' : 'unhealthy',
      status: isHealthy ? 'operational' : 'down'
    }
  });
});
