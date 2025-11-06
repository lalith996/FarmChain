const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User.model');
const Product = require('../src/models/Product.model');
const Order = require('../src/models/Order.model');

/**
 * Generate analytics data from existing database records
 * This creates realistic time-series data for the admin analytics dashboard
 */
async function generateAnalytics() {
  try {
    console.log('📊 Generating analytics from database...\n');

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/farmchain');
    console.log('✅ Connected to MongoDB\n');

    // Fetch all data
    console.log('📥 Fetching data...');
    const users = await User.find({});
    const products = await Product.find({});
    const orders = await Order.find({}).populate('product').populate('buyer').populate('seller');

    console.log(`   Users: ${users.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Orders: ${orders.length}\n`);

    // Calculate analytics
    const analytics = {
      // Revenue Analytics
      revenue: calculateRevenue(orders),
      
      // User Analytics
      users: calculateUserAnalytics(users),
      
      // Order Analytics
      orders: calculateOrderAnalytics(orders),
      
      // Product Analytics
      products: calculateProductAnalytics(products, orders),
      
      // Top Performers
      topProducts: getTopProducts(products, orders),
      topFarmers: getTopFarmers(users, orders),
    };

    // Display summary
    console.log('📊 Analytics Summary:');
    console.log('==================\n');
    
    console.log('💰 Revenue:');
    console.log(`   Total: ₹${analytics.revenue.total.toLocaleString()}`);
    console.log(`   This Month: ₹${analytics.revenue.thisMonth.toLocaleString()}`);
    console.log(`   Growth: ${analytics.revenue.growth.toFixed(1)}%\n`);
    
    console.log('👥 Users:');
    console.log(`   Total: ${analytics.users.total}`);
    console.log(`   By Role:`, analytics.users.byRole);
    console.log(`   Growth: ${analytics.users.growth.toFixed(1)}%\n`);
    
    console.log('📦 Orders:');
    console.log(`   Total: ${analytics.orders.total}`);
    console.log(`   By Status:`, analytics.orders.byStatus);
    console.log(`   Growth: ${analytics.orders.growth.toFixed(1)}%\n`);
    
    console.log('🏆 Top Products:');
    analytics.topProducts.slice(0, 5).forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - ${p.totalSold} sold, ₹${p.revenue.toLocaleString()}`);
    });
    
    console.log('\n🌟 Top Farmers:');
    analytics.topFarmers.slice(0, 5).forEach((f, i) => {
      console.log(`   ${i + 1}. ${f.name} - ${f.totalOrders} orders, ₹${f.revenue.toLocaleString()}`);
    });

    console.log('\n✅ Analytics generated successfully!');
    console.log('\n💡 This data is calculated from your seeded database.');
    console.log('   The admin analytics page will display this information.\n');

    return analytics;

  } catch (error) {
    console.error('❌ Error generating analytics:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

function calculateRevenue(orders) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  // Calculate total revenue
  const total = orders.reduce((sum, order) => {
    return sum + (order.orderDetails?.totalAmount || 0);
  }, 0);

  // This month revenue
  const thisMonth = orders
    .filter(o => new Date(o.createdAt) >= thisMonthStart)
    .reduce((sum, order) => sum + (order.orderDetails?.totalAmount || 0), 0);

  // Last month revenue
  const lastMonth = orders
    .filter(o => {
      const date = new Date(o.createdAt);
      return date >= lastMonthStart && date <= lastMonthEnd;
    })
    .reduce((sum, order) => sum + (order.orderDetails?.totalAmount || 0), 0);

  // Calculate growth
  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  // Revenue by month (last 12 months)
  const byMonth = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthRevenue = orders
      .filter(o => {
        const date = new Date(o.createdAt);
        return date >= monthDate && date <= monthEnd;
      })
      .reduce((sum, order) => sum + (order.orderDetails?.totalAmount || 0), 0);

    byMonth.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue: monthRevenue
    });
  }

  return { total, thisMonth, lastMonth, growth, byMonth };
}

function calculateUserAnalytics(users) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const total = users.length;

  // This month users
  const thisMonth = users.filter(u => new Date(u.createdAt) >= thisMonthStart).length;

  // Last month users
  const lastMonth = users.filter(u => {
    const date = new Date(u.createdAt);
    return date >= lastMonthStart && date <= lastMonthEnd;
  }).length;

  // Calculate growth
  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  // Users by role
  const byRole = {};
  users.forEach(user => {
    const role = user.primaryRole.toLowerCase();
    byRole[role] = (byRole[role] || 0) + 1;
  });

  // Users by month (last 12 months)
  const byMonth = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthUsers = users.filter(u => {
      const date = new Date(u.createdAt);
      return date <= monthEnd;
    }).length;

    byMonth.push({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      users: monthUsers
    });
  }

  return { total, thisMonth, lastMonth, growth, byRole, byMonth };
}

function calculateOrderAnalytics(orders) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const total = orders.length;

  // This month orders
  const thisMonth = orders.filter(o => new Date(o.createdAt) >= thisMonthStart).length;

  // Last month orders
  const lastMonth = orders.filter(o => {
    const date = new Date(o.createdAt);
    return date >= lastMonthStart && date <= lastMonthEnd;
  }).length;

  // Calculate growth
  const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  // Orders by status
  const byStatus = {};
  orders.forEach(order => {
    const status = order.status;
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return { total, thisMonth, lastMonth, growth, byStatus };
}

function calculateProductAnalytics(products, orders) {
  const activeProducts = products.filter(p => p.isActive).length;
  
  return {
    total: products.length,
    active: activeProducts,
    inactive: products.length - activeProducts
  };
}

function getTopProducts(products, orders) {
  const productStats = {};

  // Calculate stats for each product
  orders.forEach(order => {
    const productId = order.product?._id?.toString() || order.product?.toString();
    if (!productId) return;

    if (!productStats[productId]) {
      productStats[productId] = {
        totalSold: 0,
        revenue: 0,
        product: order.product
      };
    }

    productStats[productId].totalSold += order.orderDetails?.quantity || 0;
    productStats[productId].revenue += order.orderDetails?.totalAmount || 0;
  });

  // Convert to array and sort
  const topProducts = Object.values(productStats)
    .map(stat => {
      const product = products.find(p => p._id.toString() === Object.keys(productStats).find(k => productStats[k] === stat));
      return {
        _id: stat.product?._id || 'unknown',
        name: stat.product?.basicInfo?.name || stat.product?.name || 'Unknown Product',
        category: stat.product?.basicInfo?.category || stat.product?.category || 'Unknown',
        totalSold: stat.totalSold,
        revenue: stat.revenue
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return topProducts;
}

function getTopFarmers(users, orders) {
  const farmerStats = {};

  // Calculate stats for each farmer
  orders.forEach(order => {
    const farmerId = order.seller?._id?.toString() || order.seller?.toString();
    if (!farmerId) return;

    if (!farmerStats[farmerId]) {
      farmerStats[farmerId] = {
        totalOrders: 0,
        revenue: 0,
        seller: order.seller
      };
    }

    farmerStats[farmerId].totalOrders += 1;
    farmerStats[farmerId].revenue += order.orderDetails?.totalAmount || 0;
  });

  // Convert to array and sort
  const topFarmers = Object.values(farmerStats)
    .map(stat => {
      const farmer = users.find(u => u._id.toString() === Object.keys(farmerStats).find(k => farmerStats[k] === stat));
      return {
        _id: stat.seller?._id || 'unknown',
        name: stat.seller?.profile?.name || farmer?.profile?.name || 'Unknown Farmer',
        totalOrders: stat.totalOrders,
        revenue: stat.revenue,
        rating: stat.seller?.stats?.averageRating || farmer?.stats?.averageRating || 4.5
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return topFarmers;
}

// Run if called directly
if (require.main === module) {
  generateAnalytics()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { generateAnalytics };
