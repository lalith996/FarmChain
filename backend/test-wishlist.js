/**
 * Quick test script for Wishlist API
 * Run with: node test-wishlist.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
let authToken = '';
let wishlistId = '';
let productId = '';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test() {
  try {
    log('\n🧪 Testing Wishlist API\n', 'blue');

    // Step 1: Login (you'll need to replace with actual credentials)
    log('1. Logging in...', 'yellow');
    try {
      const loginRes = await axios.post(`${API_URL}/auth/login`, {
        walletAddress: '0x1234567890123456789012345678901234567890', // Replace with actual
        // or email/password if you have that auth method
      });
      authToken = loginRes.data.token;
      log('✓ Login successful', 'green');
    } catch (error) {
      log('⚠ Login failed - using mock token for testing', 'yellow');
      log('Please update test-wishlist.js with valid credentials', 'yellow');
      return;
    }

    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };

    // Step 2: Get all wishlists
    log('\n2. Getting all wishlists...', 'yellow');
    const wishlistsRes = await axios.get(`${API_URL}/wishlists`, config);
    log(`✓ Found ${wishlistsRes.data.count} wishlists`, 'green');
    console.log(JSON.stringify(wishlistsRes.data, null, 2));

    // Step 3: Create a new wishlist
    log('\n3. Creating new wishlist...', 'yellow');
    const createRes = await axios.post(
      `${API_URL}/wishlists`,
      { name: 'Test Wishlist', isPublic: false },
      config
    );
    wishlistId = createRes.data.data._id;
    log(`✓ Wishlist created with ID: ${wishlistId}`, 'green');

    // Step 4: Get a product ID (you'll need an actual product)
    log('\n4. Getting a product...', 'yellow');
    try {
      const productsRes = await axios.get(`${API_URL}/products?limit=1`);
      if (productsRes.data.data.products && productsRes.data.data.products.length > 0) {
        productId = productsRes.data.data.products[0]._id;
        log(`✓ Found product: ${productId}`, 'green');
      } else {
        log('⚠ No products found - skipping add to wishlist test', 'yellow');
        return;
      }
    } catch (error) {
      log('⚠ Could not fetch products', 'yellow');
      return;
    }

    // Step 5: Add product to wishlist
    log('\n5. Adding product to wishlist...', 'yellow');
    const addRes = await axios.post(
      `${API_URL}/wishlists/items`,
      {
        productId,
        wishlistId,
        notes: 'Test product',
        notifyOnPriceDrop: true
      },
      config
    );
    log('✓ Product added to wishlist', 'green');

    // Step 6: Get wishlist with items
    log('\n6. Getting wishlist with items...', 'yellow');
    const wishlistRes = await axios.get(`${API_URL}/wishlists/${wishlistId}`, config);
    log(`✓ Wishlist has ${wishlistRes.data.data.items.length} items`, 'green');
    console.log(JSON.stringify(wishlistRes.data.data, null, 2));

    // Step 7: Remove product from wishlist
    log('\n7. Removing product from wishlist...', 'yellow');
    await axios.delete(
      `${API_URL}/wishlists/${wishlistId}/items/${productId}`,
      config
    );
    log('✓ Product removed from wishlist', 'green');

    // Step 8: Delete wishlist
    log('\n8. Deleting wishlist...', 'yellow');
    await axios.delete(`${API_URL}/wishlists/${wishlistId}`, config);
    log('✓ Wishlist deleted', 'green');

    log('\n✅ All tests passed!', 'green');

  } catch (error) {
    log('\n❌ Test failed:', 'red');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Run tests
test();
