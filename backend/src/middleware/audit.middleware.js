const AuditLog = require('../models/AuditLog.model');

/**
 * Audit logging middleware
 * Logs all API requests for security and compliance
 */
const auditLog = async (req, res, next) => {
  const startTime = Date.now();

  // Store original functions
  const originalJson = res.json;
  const originalSend = res.send;

  let responseBody;
  let statusCode;

  // Intercept response
  res.json = function(data) {
    responseBody = data;
    statusCode = res.statusCode;
    return originalJson.call(this, data);
  };

  res.send = function(data) {
    if (!responseBody) {
      responseBody = data;
      statusCode = res.statusCode;
    }
    return originalSend.call(this, data);
  };

  // Handle response finish
  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;

      // Determine action category
      const actionCategory = determineActionCategory(req.originalUrl, req.method);

      // Determine resource type
      const resource = determineResourceType(req.originalUrl);

      // Extract resource ID if present
      const resourceId = extractResourceId(req);

      // Log the action
      await AuditLog.logAction({
        user: req.user?._id,
        walletAddress: req.user?.walletAddress || req.body?.walletAddress,
        action: `${req.method.toLowerCase()}:${req.originalUrl}`,
        actionCategory,
        resource,
        resourceId,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: statusCode || res.statusCode,
        requestBody: sanitizeBody(req.body),
        responseBody: sanitizeBody(responseBody),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date(startTime),
        duration,
        success: (statusCode || res.statusCode) < 400,
        errorMessage: (statusCode || res.statusCode) >= 400 ? responseBody?.message : null,
        metadata: {
          roleAtTime: req.user?.primaryRole,
          permissionsAtTime: req.user?.permissions,
          query: req.query,
          params: req.params
        }
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't block the response if logging fails
    }
  });

  next();
};

/**
 * Enhanced audit logging for critical actions
 * Includes full request/response snapshot and real-time alerts
 */
const auditCriticalAction = async (req, res, next) => {
  const startTime = Date.now();

  // Store original functions
  const originalJson = res.json;
  const originalSend = res.send;

  let responseBody;
  let statusCode;

  res.json = function(data) {
    responseBody = data;
    statusCode = res.statusCode;
    return originalJson.call(this, data);
  };

  res.send = function(data) {
    if (!responseBody) {
      responseBody = data;
      statusCode = res.statusCode;
    }
    return originalSend.call(this, data);
  };

  res.on('finish', async () => {
    try {
      const duration = Date.now() - startTime;
      const success = (statusCode || res.statusCode) < 400;

      const actionCategory = determineActionCategory(req.originalUrl, req.method);
      const resource = determineResourceType(req.originalUrl);
      const resourceId = extractResourceId(req);

      // Determine old and new values for tracking changes
      const oldValues = req.resource ? { ...req.resource.toObject() } : null;
      const newValues = success ? req.body : null;

      // Log critical action
      await AuditLog.logAction({
        user: req.user?._id,
        walletAddress: req.user?.walletAddress,
        action: `critical:${req.method.toLowerCase()}:${req.originalUrl}`,
        actionCategory,
        resource,
        resourceId,
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: statusCode || res.statusCode,
        requestBody: req.body, // Don't sanitize for critical actions
        responseBody: responseBody,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date(startTime),
        duration,
        success,
        errorMessage: !success ? responseBody?.message : null,
        metadata: {
          roleAtTime: req.user?.primaryRole,
          permissionsAtTime: req.user?.permissions,
          blockchainTxHash: responseBody?.txHash,
          affectedUsers: req.body?.userId ? [req.body.userId] : [],
          oldValues,
          newValues,
          customData: {
            reason: req.body?.reason,
            notes: req.body?.notes
          }
        },
        securityFlags: {
          isCritical: true,
          isSuspicious: detectSuspiciousActivity(req, res, success)
        }
      });

      // Send real-time alert for critical failures
      if (!success) {
        await sendCriticalAlert({
          action: `${req.method} ${req.originalUrl}`,
          user: req.user,
          error: responseBody?.message,
          ip: req.ip
        });
      }

    } catch (error) {
      console.error('Critical audit logging failed:', error);
    }
  });

  next();
};

/**
 * Audit specific action types
 */
const auditRoleChange = async (req, res, next) => {
  // This is called as a post-middleware after the action completes
  return auditCriticalAction(req, res, next);
};

const auditUserManagement = async (req, res, next) => {
  return auditCriticalAction(req, res, next);
};

const auditBlockchainAction = async (req, res, next) => {
  return auditCriticalAction(req, res, next);
};

/**
 * Helper function to determine action category
 */
function determineActionCategory(url, method) {
  if (url.includes('/auth/')) return 'authentication';
  if (url.includes('/admin/')) return 'admin_action';
  if (url.includes('/users/')) return 'user_management';
  if (url.includes('/products/')) return 'product_management';
  if (url.includes('/orders/')) return 'order_management';
  if (url.includes('/payments/')) return 'payment';
  if (url.includes('/blockchain/')) return 'blockchain';
  return 'system';
}

/**
 * Helper function to determine resource type
 */
function determineResourceType(url) {
  if (url.includes('/users/')) return 'User';
  if (url.includes('/products/')) return 'Product';
  if (url.includes('/orders/')) return 'Order';
  if (url.includes('/payments/')) return 'Payment';
  if (url.includes('/roles/')) return 'Role';
  if (url.includes('/permissions/')) return 'Permission';
  return 'System';
}

/**
 * Helper function to extract resource ID from request
 */
function extractResourceId(req) {
  // Common ID parameter names
  const idParams = ['id', 'userId', 'productId', 'orderId', 'paymentId'];
  
  for (const param of idParams) {
    if (req.params[param]) {
      return req.params[param];
    }
  }

  return null;
}

/**
 * Sanitize request/response bodies
 */
function sanitizeBody(body) {
  if (!body) return null;

  const sensitiveFields = [
    'password',
    'passwordHash',
    'twoFactorSecret',
    'privateKey',
    'sessionToken',
    'refreshToken',
    'accessToken',
    'apiKey',
    'secret',
    'signature'
  ];

  const sanitized = JSON.parse(JSON.stringify(body));

  const sanitizeObject = (obj) => {
    if (!obj || typeof obj !== 'object') return;

    for (const key in obj) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * Detect suspicious activity patterns
 */
function detectSuspiciousActivity(req, res, success) {
  // Multiple failed attempts
  if (!success && req.originalUrl.includes('/auth/login')) {
    return true;
  }

  // Unauthorized access attempts
  if (res.statusCode === 403) {
    return true;
  }

  // Admin actions from unusual IPs (implement IP whitelist check)
  if (req.originalUrl.includes('/admin/') && success) {
    // Could check against known admin IPs
    return false;
  }

  // Rapid API calls (check rate limit violations)
  // This would require checking rate limit tracker

  return false;
}

/**
 * Send real-time alert for critical actions
 */
async function sendCriticalAlert(data) {
  // In production, integrate with:
  // - Email service (SendGrid, AWS SES)
  // - Slack webhook
  // - PagerDuty for incidents
  // - Monitoring service (Datadog, New Relic)

  console.error('🚨 CRITICAL ACTION ALERT:', {
    action: data.action,
    user: data.user?.profile?.name || data.user?.walletAddress,
    role: data.user?.primaryRole,
    error: data.error,
    ip: data.ip,
    timestamp: new Date().toISOString()
  });

  // TODO: Implement actual alerting
  // await sendSlackAlert(data);
  // await sendEmailAlert(data);
}

/**
 * Get audit logs for a user
 */
const getUserAuditLogs = async (userId, options = {}) => {
  return await AuditLog.getUserLogs(userId, options);
};

/**
 * Get suspicious activities
 */
const getSuspiciousActivities = async (options = {}) => {
  return await AuditLog.getSuspiciousActivities(options);
};

module.exports = {
  auditLog,
  auditCriticalAction,
  auditRoleChange,
  auditUserManagement,
  auditBlockchainAction,
  getUserAuditLogs,
  getSuspiciousActivities
};
