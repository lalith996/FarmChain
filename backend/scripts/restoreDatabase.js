/**
 * Database Restore Script
 * Restores data from a JSON backup file
 * Run: node backend/scripts/restoreDatabase.js <backup-file>
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './backend/.env' });

const Role = require('../src/models/Role.model');
const Permission = require('../src/models/Permission.model');
const User = require('../src/models/User.model');
const AuditLog = require('../src/models/AuditLog.model');
const RateLimitTracker = require('../src/models/RateLimitTracker.model');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

async function restoreDatabase(backupFilePath) {
  try {
    // Check if backup file exists
    if (!fs.existsSync(backupFilePath)) {
      console.error(`${colors.red}❌ Backup file not found: ${backupFilePath}${colors.reset}\n`);
      process.exit(1);
    }

    console.log(`${colors.yellow}⚠️  This will replace all existing data!${colors.reset}`);
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`${colors.green}✓${colors.reset} Connected to MongoDB\n`);

    // Read backup file
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    
    console.log(`${colors.green}✓${colors.reset} Loaded backup from ${backupData.metadata.timestamp}\n`);
    console.log('Restoring collections...\n');

    // Clear existing data
    await Permission.deleteMany({});
    await Role.deleteMany({});
    await User.deleteMany({});
    await AuditLog.deleteMany({});
    await RateLimitTracker.deleteMany({});

    // Restore data
    if (backupData.collections.permissions.length > 0) {
      await Permission.insertMany(backupData.collections.permissions);
      console.log(`${colors.green}✓${colors.reset} Restored ${backupData.collections.permissions.length} permissions`);
    }

    if (backupData.collections.roles.length > 0) {
      await Role.insertMany(backupData.collections.roles);
      console.log(`${colors.green}✓${colors.reset} Restored ${backupData.collections.roles.length} roles`);
    }

    if (backupData.collections.users.length > 0) {
      await User.insertMany(backupData.collections.users);
      console.log(`${colors.green}✓${colors.reset} Restored ${backupData.collections.users.length} users`);
    }

    if (backupData.collections.auditLogs.length > 0) {
      await AuditLog.insertMany(backupData.collections.auditLogs);
      console.log(`${colors.green}✓${colors.reset} Restored ${backupData.collections.auditLogs.length} audit logs`);
    }

    if (backupData.collections.rateLimitTrackers.length > 0) {
      await RateLimitTracker.insertMany(backupData.collections.rateLimitTrackers);
      console.log(`${colors.green}✓${colors.reset} Restored ${backupData.collections.rateLimitTrackers.length} rate limit trackers`);
    }

    console.log(`\n${colors.green}✨ Database restored successfully!${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

// Get backup file from command line argument
const backupFile = process.argv[2];

if (!backupFile) {
  console.error(`${colors.red}❌ Please provide a backup file path${colors.reset}`);
  console.log('Usage: node restoreDatabase.js <backup-file>\n');
  process.exit(1);
}

restoreDatabase(backupFile);
