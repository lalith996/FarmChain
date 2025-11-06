// Script to convert permissions from dot notation to colon notation
const fs = require('fs');

const permissions = [
  // Product Management
  { name: 'product:create', displayName: 'Create Product', description: 'Create new products', category: 'product_management' },
  { name: 'product:read', displayName: 'View Product', description: 'View product details', category: 'product_management' },
  { name: 'product:update', displayName: 'Update Product', description: 'Update product information', category: 'product_management' },
  { name: 'product:delete', displayName: 'Delete Product', description: 'Delete products', category: 'product_management' },
  { name: 'product:approve', displayName: 'Approve Product', description: 'Approve products for sale', category: 'product_management' },
  { name: 'product:reject', displayName: 'Reject Product', description: 'Reject product listings', category: 'product_management' },
  { name: 'product:transfer', displayName: 'Transfer Product', description: 'Transfer product ownership', category: 'product_management' },
  { name: 'product:batch', displayName: 'Batch Products', description: 'Create product batches', category: 'product_management' },

  // Order Management
  { name: 'order:create', displayName: 'Create Order', description: 'Create new orders', category: 'order_management' },
  { name: 'order:read', displayName: 'View Order', description: 'View order details', category: 'order_management' },
  { name: 'order:update', displayName: 'Update Order', description: 'Update order status', category: 'order_management' },
  { name: 'order:cancel', displayName: 'Cancel Order', description: 'Cancel orders', category: 'order_management' },
  { name: 'order:fulfill', displayName: 'Fulfill Order', description: 'Fulfill orders', category: 'order_management' },
  { name: 'order:track', displayName: 'Track Order', description: 'Track order shipments', category: 'order_management' },
  { name: 'order:refund', displayName: 'Refund Order', description: 'Process order refunds', category: 'order_management' },

  // Payment Management
  { name: 'payment:create', displayName: 'Create Payment', description: 'Create payment escrows', category: 'payment_management' },
  { name: 'payment:release', displayName: 'Release Payment', description: 'Release escrowed payments', category: 'payment_management' },
  { name: 'payment:refund', displayName: 'Refund Payment', description: 'Process payment refunds', category: 'payment_management' },
  { name: 'payment:dispute', displayName: 'Dispute Payment', description: 'Raise payment disputes', category: 'payment_management' },
  { name: 'payment:resolve', displayName: 'Resolve Payment', description: 'Resolve payment disputes', category: 'payment_management' },
  { name: 'payment:view', displayName: 'View Payments', description: 'View payment history', category: 'payment_management' },

  // User Management
  { name: 'user:create', displayName: 'Create User', description: 'Create new users', category: 'user_management' },
  { name: 'user:read', displayName: 'View User', description: 'View user profiles', category: 'user_management' },
  { name: 'user:update', displayName: 'Update User', description: 'Update user information', category: 'user_management' },
  { name: 'user:delete', displayName: 'Delete User', description: 'Delete user accounts', category: 'user_management' },
  { name: 'user:suspend', displayName: 'Suspend User', description: 'Suspend user accounts', category: 'user_management' },
  { name: 'user:activate', displayName: 'Activate User', description: 'Activate user accounts', category: 'user_management' },
  { name: 'user:verify', displayName: 'Verify User', description: 'Verify user identity (KYC)', category: 'user_management' },
  { name: 'user:roles', displayName: 'Manage User Roles', description: 'Manage user roles', category: 'user_management' },

  // Analytics
  { name: 'analytics:view', displayName: 'View Analytics', description: 'View analytics dashboard', category: 'analytics' },
  { name: 'analytics:export', displayName: 'Export Analytics', description: 'Export analytics data', category: 'analytics' },
  { name: 'analytics:reports', displayName: 'Generate Reports', description: 'Generate reports', category: 'analytics' },
  { name: 'analytics:metrics', displayName: 'View Metrics', description: 'View system metrics', category: 'analytics' },
  { name: 'analytics:logs', displayName: 'View Logs', description: 'View audit logs', category: 'analytics' },

  // Admin Functions
  { name: 'admin:config', displayName: 'System Config', description: 'Manage system configuration', category: 'admin_functions' },
  { name: 'admin:backup', displayName: 'System Backup', description: 'Perform system backups', category: 'admin_functions' },
  { name: 'admin:restore', displayName: 'System Restore', description: 'Restore from backups', category: 'admin_functions' },
  { name: 'admin:maintenance', displayName: 'Maintenance Mode', description: 'Enable maintenance mode', category: 'admin_functions' },
  { name: 'admin:monitor', displayName: 'System Monitor', description: 'Monitor system health', category: 'admin_functions' },

  // Notifications
  { name: 'notification:send', displayName: 'Send Notification', description: 'Send notifications', category: 'notification' },
  { name: 'notification:read', displayName: 'Read Notification', description: 'Read notifications', category: 'notification' },
  { name: 'notification:manage', displayName: 'Manage Notifications', description: 'Manage notification settings', category: 'notification' }
];

console.log(JSON.stringify(permissions, null, 2));
console.log(`\nTotal permissions: ${permissions.length}`);
