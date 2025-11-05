const { asyncHandler, AppError } = require('../middleware/errorHandler');
const verificationService = require('../services/verification.service');

/**
 * Verification Controller
 * Handles user-facing KYC and verification operations
 */

/**
 * Initiate KYC process
 * POST /api/verification/kyc
 */
exports.initiateKYC = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { documents, businessDetails } = req.body;

  if (!documents || !Array.isArray(documents) || documents.length === 0) {
    return next(new AppError('At least one KYC document is required', 400, 'MISSING_DOCUMENTS'));
  }

  const result = await verificationService.initiateKYC({
    userId,
    documents,
    businessDetails
  });

  res.status(201).json({
    success: true,
    data: result,
    message: 'KYC documents submitted successfully'
  });
});

/**
 * Resubmit KYC after rejection
 * POST /api/verification/kyc/resubmit
 */
exports.resubmitKYC = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { newDocuments } = req.body;

  if (!newDocuments || !Array.isArray(newDocuments) || newDocuments.length === 0) {
    return next(new AppError('At least one KYC document is required for resubmission', 400, 'MISSING_DOCUMENTS'));
  }

  const result = await verificationService.resubmitKYC({
    userId,
    newDocuments
  });

  res.json({
    success: true,
    data: result,
    message: 'KYC documents resubmitted successfully'
  });
});

/**
 * Get verification status
 * GET /api/verification/status
 */
exports.getVerificationStatus = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const result = await verificationService.getVerificationStatus(userId);

  res.json({
    success: true,
    data: result
  });
});

/**
 * Verify business license
 * POST /api/verification/business-license
 */
exports.verifyBusinessLicense = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;
  const { licenseNumber, issuingAuthority, issueDate, expiryDate } = req.body;

  if (!licenseNumber || !issuingAuthority) {
    return next(new AppError('License number and issuing authority are required', 400, 'MISSING_FIELDS'));
  }

  const result = await verificationService.verifyBusinessLicense({
    userId,
    licenseNumber,
    issuingAuthority,
    issueDate,
    expiryDate
  });

  res.json({
    success: true,
    data: result,
    message: 'Business license submitted for verification'
  });
});
