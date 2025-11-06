const User = require('../models/User.model');
const Role = require('../models/Role.model');
const AuditLog = require('../models/AuditLog.model');

/**
 * Verification Service
 * Handles KYC, business license verification, and user verification workflows
 */
class VerificationService {
  /**
   * Initiate KYC process for a user
   * @param {object} data - KYC initiation data
   * @returns {object} - Updated user with KYC status
   */
  async initiateKYC(data) {
    const { userId, documents, businessDetails } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user's role requires KYC
    const role = await Role.findOne({ name: user.primaryRole });
    if (!role || !role.requirements.requiresKYC) {
      throw new Error(`KYC not required for role ${user.primaryRole}`);
    }

    // Validate KYC status
    if (user.verification.kycStatus === 'approved') {
      throw new Error('KYC already approved');
    }

    if (user.verification.kycStatus === 'pending') {
      throw new Error('KYC already in pending state. Please wait for review.');
    }

    // Validate documents
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      throw new Error('At least one KYC document is required');
    }

    // Validate document structure
    for (const doc of documents) {
      if (!doc.type || !doc.ipfsHash) {
        throw new Error('Each document must have type and ipfsHash');
      }
      
      // Validate IPFS hash format
      if (!/^(Qm|ba)[a-zA-Z0-9]{44,}$/.test(doc.ipfsHash)) {
        throw new Error(`Invalid IPFS hash format: ${doc.ipfsHash}`);
      }

      // Validate document type
      const validTypes = ['government_id', 'passport', 'drivers_license', 'utility_bill', 'bank_statement', 'business_license', 'tax_id', 'other'];
      if (!validTypes.includes(doc.type)) {
        throw new Error(`Invalid document type: ${doc.type}. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Update user KYC documents
    user.verification.kycDocuments = documents.map(doc => ({
      type: doc.type,
      ipfsHash: doc.ipfsHash,
      status: 'pending',
      uploadedAt: new Date()
    }));

    user.verification.kycStatus = 'pending';
    user.verification.kycSubmittedAt = new Date();

    // Add business details if provided
    if (businessDetails) {
      if (businessDetails.licenseNumber) {
        user.verification.businessLicense = {
          licenseNumber: businessDetails.licenseNumber,
          issuingAuthority: businessDetails.issuingAuthority,
          issueDate: businessDetails.issueDate,
          expiryDate: businessDetails.expiryDate,
          isVerified: false
        };
      }

      if (businessDetails.taxId) {
        user.verification.taxId = businessDetails.taxId;
      }
    }

    await user.save();

    // Log KYC initiation
    await AuditLog.logAction({
      user: userId,
      walletAddress: user.walletAddress,
      action: 'verification:kyc_initiated',
      actionCategory: 'verification',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        roleAtTime: user.primaryRole,
        documentCount: documents.length,
        documentTypes: documents.map(d => d.type),
        hasBusinessLicense: !!businessDetails?.licenseNumber
      }
    });

    // TODO: Send notification to admins for review
    console.log(`KYC initiated for user ${user.walletAddress}. Admin review required.`);

    return {
      user: user.toPublicJSON(),
      kycStatus: 'pending',
      message: 'KYC documents submitted successfully. Your submission will be reviewed within 24-48 hours.'
    };
  }

  /**
   * Approve KYC for a user
   * @param {object} data - KYC approval data
   * @returns {object} - Updated user
   */
  async approveKYC(data) {
    const { userId, approvedBy, comments, verificationLevel = 2 } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const approver = await User.findById(approvedBy);
    if (!approver) {
      throw new Error('Approver not found');
    }

    // Check approver permissions
    if (!approver.hasPermission('user_management:approve_kyc')) {
      throw new Error('Insufficient permissions to approve KYC');
    }

    // Validate current KYC status
    if (user.verification.kycStatus !== 'pending') {
      throw new Error(`Cannot approve KYC with status: ${user.verification.kycStatus}`);
    }

    // Update KYC status
    user.verification.kycStatus = 'approved';
    user.verification.isVerified = true;
    user.verification.verificationLevel = verificationLevel;
    user.verification.verifiedAt = new Date();
    user.verification.verifiedBy = approvedBy;

    // Mark all documents as approved
    if (user.verification.kycDocuments && user.verification.kycDocuments.length > 0) {
      user.verification.kycDocuments = user.verification.kycDocuments.map(doc => ({
        ...doc,
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: approvedBy
      }));
    }

    await user.save();

    // Log KYC approval
    await AuditLog.logAction({
      user: approvedBy,
      walletAddress: approver.walletAddress,
      action: 'verification:kyc_approved',
      actionCategory: 'verification',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        approverRole: approver.primaryRole,
        affectedUser: user.walletAddress,
        verificationLevel,
        comments
      },
      securityFlags: {
        isCritical: true
      }
    });

    // Check if blockchain role needs to be granted
    const role = await Role.findOne({ name: user.primaryRole });
    if (role && role.requirements.requiresKYC) {
      // TODO: Trigger blockchain role sync
      console.log(`KYC approved for ${user.walletAddress}. Blockchain role sync may be required.`);
    }

    // TODO: Send approval notification to user
    console.log(`KYC approved for user ${user.walletAddress}`);

    return {
      user: user.toPublicJSON(),
      kycStatus: 'approved',
      verificationLevel,
      message: 'KYC approved successfully'
    };
  }

  /**
   * Reject KYC for a user
   * @param {object} data - KYC rejection data
   * @returns {object} - Updated user
   */
  async rejectKYC(data) {
    const { userId, rejectedBy, reason, documentIssues } = data;

    if (!reason) {
      throw new Error('Rejection reason is required');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const rejector = await User.findById(rejectedBy);
    if (!rejector) {
      throw new Error('Rejector not found');
    }

    // Check rejector permissions
    if (!rejector.hasPermission('user_management:approve_kyc')) {
      throw new Error('Insufficient permissions to reject KYC');
    }

    // Validate current KYC status
    if (user.verification.kycStatus !== 'pending') {
      throw new Error(`Cannot reject KYC with status: ${user.verification.kycStatus}`);
    }

    // Update KYC status
    user.verification.kycStatus = 'rejected';
    user.verification.rejectionReason = reason;
    user.verification.rejectedAt = new Date();
    user.verification.rejectedBy = rejectedBy;

    // Mark documents with issues
    if (documentIssues && Array.isArray(documentIssues)) {
      user.verification.kycDocuments = user.verification.kycDocuments.map(doc => {
        const issue = documentIssues.find(i => i.ipfsHash === doc.ipfsHash);
        if (issue) {
          return {
            ...doc,
            status: 'rejected',
            rejectionReason: issue.reason,
            reviewedAt: new Date(),
            reviewedBy: rejectedBy
          };
        }
        return doc;
      });
    }

    await user.save();

    // Log KYC rejection
    await AuditLog.logAction({
      user: rejectedBy,
      walletAddress: rejector.walletAddress,
      action: 'verification:kyc_rejected',
      actionCategory: 'verification',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        rejectorRole: rejector.primaryRole,
        affectedUser: user.walletAddress,
        reason,
        documentIssueCount: documentIssues?.length || 0
      },
      securityFlags: {
        isCritical: true
      }
    });

    // TODO: Send rejection notification with detailed feedback to user
    console.log(`KYC rejected for user ${user.walletAddress}. Reason: ${reason}`);

    return {
      user: user.toPublicJSON(),
      kycStatus: 'rejected',
      reason,
      message: 'KYC rejected. Please review the feedback and resubmit with correct documentation.'
    };
  }

  /**
   * Resubmit KYC after rejection
   * @param {object} data - KYC resubmission data
   * @returns {object} - Updated user
   */
  async resubmitKYC(data) {
    const { userId, newDocuments } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate current KYC status
    if (user.verification.kycStatus !== 'rejected') {
      throw new Error('Can only resubmit KYC after rejection');
    }

    // Validate new documents
    if (!newDocuments || !Array.isArray(newDocuments) || newDocuments.length === 0) {
      throw new Error('At least one KYC document is required for resubmission');
    }

    // Update documents
    user.verification.kycDocuments = newDocuments.map(doc => ({
      type: doc.type,
      ipfsHash: doc.ipfsHash,
      status: 'pending',
      uploadedAt: new Date()
    }));

    user.verification.kycStatus = 'pending';
    user.verification.kycSubmittedAt = new Date();
    user.verification.rejectionReason = null;
    user.verification.rejectedAt = null;
    user.verification.rejectedBy = null;

    await user.save();

    // Log resubmission
    await AuditLog.logAction({
      user: userId,
      walletAddress: user.walletAddress,
      action: 'verification:kyc_resubmitted',
      actionCategory: 'verification',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        roleAtTime: user.primaryRole,
        documentCount: newDocuments.length
      }
    });

    return {
      user: user.toPublicJSON(),
      kycStatus: 'pending',
      message: 'KYC documents resubmitted successfully'
    };
  }

  /**
   * Verify business license
   * @param {object} data - Business license verification data
   * @returns {object} - Verification result
   */
  async verifyBusinessLicense(data) {
    const { userId, licenseNumber, issuingAuthority, issueDate, expiryDate, verifiedBy } = data;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user role requires business license
    if (!['DISTRIBUTOR', 'RETAILER'].includes(user.primaryRole)) {
      throw new Error('Business license only required for distributors and retailers');
    }

    const verifier = verifiedBy ? await User.findById(verifiedBy) : null;
    if (verifiedBy && !verifier) {
      throw new Error('Verifier not found');
    }

    // Validate license data
    if (!licenseNumber || !issuingAuthority) {
      throw new Error('License number and issuing authority are required');
    }

    // Check expiry date
    const expiry = new Date(expiryDate);
    if (expiry < new Date()) {
      throw new Error('Business license has expired');
    }

    // Update business license info
    user.verification.businessLicense = {
      licenseNumber,
      issuingAuthority,
      issueDate: new Date(issueDate),
      expiryDate: expiry,
      isVerified: true,
      verifiedAt: new Date(),
      verifiedBy: verifiedBy || null
    };

    await user.save();

    // Log business license verification
    await AuditLog.logAction({
      user: verifiedBy || userId,
      walletAddress: verifier?.walletAddress || user.walletAddress,
      action: 'verification:business_license_verified',
      actionCategory: 'verification',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        affectedUser: user.walletAddress,
        licenseNumber,
        issuingAuthority,
        expiryDate
      }
    });

    return {
      user: user.toPublicJSON(),
      message: 'Business license verified successfully'
    };
  }

  /**
   * Get verification status for a user
   * @param {string} userId - User ID
   * @returns {object} - Verification status
   */
  async getVerificationStatus(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const role = await Role.findOne({ name: user.primaryRole });

    // Determine pending actions
    const pendingActions = [];
    
    if (role.requirements.requiresKYC && user.verification.kycStatus !== 'approved') {
      pendingActions.push({
        action: 'kyc_submission',
        status: user.verification.kycStatus,
        message: user.verification.kycStatus === 'rejected' 
          ? `KYC rejected: ${user.verification.rejectionReason}`
          : 'KYC submission required'
      });
    }

    if (
      ['DISTRIBUTOR', 'RETAILER'].includes(user.primaryRole) &&
      !user.verification.businessLicense?.isVerified
    ) {
      pendingActions.push({
        action: 'business_license_verification',
        status: 'required',
        message: 'Business license verification required'
      });
    }

    // Check for expiring licenses
    if (user.verification.businessLicense?.isVerified) {
      const daysUntilExpiry = Math.floor(
        (user.verification.businessLicense.expiryDate - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysUntilExpiry < 30) {
        pendingActions.push({
          action: 'business_license_renewal',
          status: 'expiring_soon',
          message: `Business license expires in ${daysUntilExpiry} days`
        });
      }
    }

    return {
      userId: user._id,
      walletAddress: user.walletAddress,
      role: user.primaryRole,
      verification: {
        isVerified: user.verification.isVerified,
        verificationLevel: user.verification.verificationLevel,
        kycStatus: user.verification.kycStatus,
        kycSubmittedAt: user.verification.kycSubmittedAt,
        verifiedAt: user.verification.verifiedAt,
        rejectionReason: user.verification.rejectionReason,
        businessLicense: user.verification.businessLicense
      },
      pendingActions,
      requirements: role.requirements
    };
  }

  /**
   * Get all pending KYC submissions (Admin function)
   * @param {object} options - Query options
   * @returns {object} - Pending submissions
   */
  async getPendingKYCSubmissions(options = {}) {
    const { page = 1, limit = 20, role = null } = options;

    const query = { 'verification.kycStatus': 'pending' };
    
    if (role) {
      query.primaryRole = role;
    }

    const users = await User.find(query)
      .select('walletAddress roles primaryRole profile verification createdAt')
      .sort({ 'verification.kycSubmittedAt': 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    return {
      submissions: users.map(user => ({
        userId: user._id,
        walletAddress: user.walletAddress,
        role: user.primaryRole,
        name: user.profile.name,
        businessName: user.profile.businessName,
        submittedAt: user.verification.kycSubmittedAt,
        documentCount: user.verification.kycDocuments?.length || 0,
        hasBusinessLicense: !!user.verification.businessLicense
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update verification level
   * @param {object} data - Update data
   * @returns {object} - Updated user
   */
  async updateVerificationLevel(data) {
    const { userId, level, updatedBy, reason } = data;

    if (![0, 1, 2, 3].includes(level)) {
      throw new Error('Verification level must be 0, 1, 2, or 3');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updater = await User.findById(updatedBy);
    if (!updater || !updater.hasPermission('user_management:update_verification_level')) {
      throw new Error('Insufficient permissions to update verification level');
    }

    const oldLevel = user.verification.verificationLevel;
    user.verification.verificationLevel = level;
    await user.save();

    // Log level update
    await AuditLog.logAction({
      user: updatedBy,
      walletAddress: updater.walletAddress,
      action: 'verification:level_updated',
      actionCategory: 'verification',
      resource: 'User',
      resourceId: userId.toString(),
      success: true,
      metadata: {
        affectedUser: user.walletAddress,
        oldLevel,
        newLevel: level,
        reason
      },
      securityFlags: {
        isCritical: true
      }
    });

    return {
      user: user.toPublicJSON(),
      oldLevel,
      newLevel: level,
      message: 'Verification level updated successfully'
    };
  }
}

module.exports = new VerificationService();
