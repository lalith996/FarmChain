/**
 * Database Cleanup Script
 * Removes all data from MongoDB collections
 * Run: node backend/scripts/cleanDatabase.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const Role = require('../src/models/Role.model');
const Permission = require('../src/models/Permission.model');
const User = require('../src/models/User.model');
const AuditLog = require('../src/models/AuditLog.model');
const RateLimitTracker = require('../src/models/RateLimitTracker.model');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m'
};

async function cleanDatabase() {
  try {
    console.log(`\n${colors.yellow}⚠️  WARNING: This will delete ALL data from the database!${colors.reset}`);
    console.log('Press Ctrl+C to cancel or wait 5 seconds to continue...\n');

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`${colors.green}✓${colors.reset} Connected to MongoDB\n`);

    // Delete all data
    console.log('Cleaning collections...');
    
    await Permission.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared permissions`);
    
    await Role.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared roles`);
    
    await User.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared users`);
    
    await AuditLog.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared audit logs`);
    
    await RateLimitTracker.deleteMany({});
    console.log(`${colors.green}✓${colors.reset} Cleared rate limit trackers`);

    console.log(`\n${colors.green}✨ Database cleaned successfully!${colors.reset}\n`);
    
    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

cleanDatabase();
