require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');
const Role = require('../src/models/Role.model');

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Farmchain');
    console.log('✅ Connected to MongoDB\n');

    // Get wallet address from command line or use default
    const walletAddress = process.argv[2] || '0x04e98450e3051a2acfd1d96113481252f0013f77';
    const normalizedAddress = walletAddress.toLowerCase();

    console.log(`🔍 Checking wallet: ${normalizedAddress}\n`);

    // Check if user exists
    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      console.log('❌ User not found!');
      console.log('👉 Please register this wallet address first at http://localhost:3000/auth/register');
      process.exit(1);
    }

    // Check if SUPER_ADMIN role exists
    let superAdminRole = await Role.findOne({ name: 'SUPER_ADMIN' });
    
    if (!superAdminRole) {
      console.log('⚠️  SUPER_ADMIN role not found. Creating it...');
      superAdminRole = await Role.create({
        name: 'SUPER_ADMIN',
        description: 'Super Administrator with full system access',
        permissions: [
          'all:read',
          'all:write',
          'all:delete',
          'system:manage',
          'users:manage',
          'roles:manage',
          'admin:access'
        ],
        level: 1000,
        hierarchy: 0,
        isSystem: true
      });
      console.log('✅ SUPER_ADMIN role created\n');
    }

    // Update user to SUPER_ADMIN
    if (user.roles.includes('SUPER_ADMIN')) {
      console.log('ℹ️  User is already a SUPER_ADMIN');
    } else {
      user.roles = ['SUPER_ADMIN'];
      user.primaryRole = 'SUPER_ADMIN';
      user.verification.isVerified = true;
      user.verification.kycStatus = 'approved';
      user.verification.verifiedAt = new Date();
      await user.save();
      console.log('✅ User upgraded to SUPER_ADMIN\n');
    }

    console.log('📊 User Details:');
    console.log(`  Wallet: ${user.walletAddress}`);
    console.log(`  Name: ${user.profile?.name || 'N/A'}`);
    console.log(`  Email: ${user.profile?.email || 'N/A'}`);
    console.log(`  Role: ${user.primaryRole}`);
    console.log(`  Verified: ${user.verification.isVerified ? '✅' : '❌'}`);
    console.log(`  KYC Status: ${user.verification.kycStatus}`);
    console.log('\n🎉 Success! You can now login as SUPER_ADMIN at http://localhost:3000/auth/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  createSuperAdmin();
}

module.exports = createSuperAdmin;
