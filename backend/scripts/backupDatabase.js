/**
 * Database Backup Script
 * Creates a JSON backup of all collections
 * Run: node backend/scripts/backupDatabase.js
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
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

async function backupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`${colors.green}✓${colors.reset} Connected to MongoDB\n`);

    // Create backup directory
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Generate timestamp for backup filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup_${timestamp}.json`);

    console.log('Backing up collections...\n');

    // Fetch all data
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        database: mongoose.connection.name
      },
      collections: {
        permissions: await Permission.find().lean(),
        roles: await Role.find().lean(),
        users: await User.find().lean(),
        auditLogs: await AuditLog.find().lean(),
        rateLimitTrackers: await RateLimitTracker.find().lean()
      },
      stats: {
        permissions: await Permission.countDocuments(),
        roles: await Role.countDocuments(),
        users: await User.countDocuments(),
        auditLogs: await AuditLog.countDocuments(),
        rateLimitTrackers: await RateLimitTracker.countDocuments()
      }
    };

    console.log(`${colors.blue}📊 Backup Statistics:${colors.reset}`);
    console.log(`  ├─ Permissions: ${backup.stats.permissions}`);
    console.log(`  ├─ Roles: ${backup.stats.roles}`);
    console.log(`  ├─ Users: ${backup.stats.users}`);
    console.log(`  ├─ Audit Logs: ${backup.stats.auditLogs}`);
    console.log(`  └─ Rate Limit Trackers: ${backup.stats.rateLimitTrackers}\n`);

    // Write backup to file
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    const fileSize = (fs.statSync(backupFile).size / 1024).toFixed(2);
    console.log(`${colors.green}✨ Backup created successfully!${colors.reset}`);
    console.log(`${colors.blue}📁 Location:${colors.reset} ${backupFile}`);
    console.log(`${colors.blue}📦 Size:${colors.reset} ${fileSize} KB\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}❌ Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

backupDatabase();
