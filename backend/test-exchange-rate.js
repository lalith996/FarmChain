/**
 * Exchange Rate Service Test Script
 *
 * Tests all three providers:
 * 1. CoinGecko (Primary)
 * 2. CoinCap (Secondary)
 * 3. Fallback (Static rates)
 *
 * Run: node backend/test-exchange-rate.js
 */

const exchangeRateService = require('./src/services/exchangeRate.service');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(colors.bright + colors.cyan, `  ${title}`);
  console.log('='.repeat(70));
}

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '→';
  const color = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  console.log(`${color}${icon} ${name}${colors.reset}${details ? ' - ' + details : ''}`);
}

async function testConversion(fiat, crypto, amount) {
  try {
    const result = await exchangeRateService.convertFiatToCrypto(fiat, crypto, amount);

    logTest(
      `${fiat} → ${crypto}`,
      'PASS',
      `${result.fiatAmount} ${fiat} = ${result.cryptoAmount.toFixed(6)} ${crypto} @ ${result.exchangeRate.toFixed(2)} (${result.cached ? 'cached' : 'fresh'})`
    );

    return true;
  } catch (error) {
    logTest(`${fiat} → ${crypto}`, 'FAIL', error.message);
    return false;
  }
}

async function testProvider(providerName, testFn) {
  try {
    log(colors.blue, `\nTesting ${providerName}...`);
    const result = await testFn();

    if (result && result > 0) {
      logTest(providerName, 'PASS', `Rate: ${result.toFixed(2)}`);
      return true;
    } else {
      logTest(providerName, 'FAIL', 'Invalid rate returned');
      return false;
    }
  } catch (error) {
    logTest(providerName, 'FAIL', error.message);
    return false;
  }
}

async function runTests() {
  console.clear();
  log(colors.bright + colors.cyan, '\n╔═══════════════════════════════════════════════════════════════════╗');
  log(colors.bright + colors.cyan, '║         FARMCHAIN EXCHANGE RATE SERVICE TEST SUITE                ║');
  log(colors.bright + colors.cyan, '╚═══════════════════════════════════════════════════════════════════╝\n');

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Basic Conversions
  logSection('TEST 1: Basic Currency Conversions');

  const conversions = [
    ['INR', 'MATIC', 1000],
    ['USD', 'MATIC', 100],
    ['INR', 'ETH', 10000],
    ['USD', 'ETH', 1000],
  ];

  for (const [fiat, crypto, amount] of conversions) {
    const success = await testConversion(fiat, crypto, amount);
    results.total++;
    success ? results.passed++ : results.failed++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limit protection
  }

  // Test 2: Caching
  logSection('TEST 2: Cache Functionality');

  log(colors.yellow, '\nFirst call (should fetch fresh data):');
  exchangeRateService.clearCache();
  const firstCall = await exchangeRateService.convertFiatToCrypto('INR', 'MATIC', 100);
  logTest('Cache Miss', firstCall.cached ? 'FAIL' : 'PASS', `Cached: ${firstCall.cached}`);
  results.total++;
  firstCall.cached ? results.failed++ : results.passed++;

  log(colors.yellow, '\nSecond call (should use cache):');
  const secondCall = await exchangeRateService.convertFiatToCrypto('INR', 'MATIC', 100);
  logTest('Cache Hit', secondCall.cached ? 'PASS' : 'FAIL', `Cached: ${secondCall.cached}`);
  results.total++;
  secondCall.cached ? results.passed++ : results.failed++;

  // Test 3: Provider Testing
  logSection('TEST 3: Individual Provider Testing');

  log(colors.yellow, '\nTesting CoinGecko API:');
  const coinGeckoSuccess = await testProvider(
    'CoinGecko',
    () => exchangeRateService._fetchFromCoinGecko('USD', 'MATIC')
  );
  results.total++;
  coinGeckoSuccess ? results.passed++ : results.failed++;

  await new Promise(resolve => setTimeout(resolve, 2000));

  log(colors.yellow, '\nTesting CoinCap API:');
  const coinCapSuccess = await testProvider(
    'CoinCap',
    () => exchangeRateService._fetchFromCoinCap('USD', 'MATIC')
  );
  results.total++;
  coinCapSuccess ? results.passed++ : results.failed++;

  log(colors.yellow, '\nTesting Fallback Rates:');
  const fallbackSuccess = await testProvider(
    'Fallback',
    () => exchangeRateService._fetchFromFallback('USD', 'MATIC')
  );
  results.total++;
  fallbackSuccess ? results.passed++ : results.failed++;

  // Test 4: Error Handling
  logSection('TEST 4: Error Handling');

  try {
    await exchangeRateService.convertFiatToCrypto('INVALID', 'MATIC', 100);
    logTest('Invalid Currency', 'FAIL', 'Should have thrown error');
    results.failed++;
  } catch (error) {
    logTest('Invalid Currency', 'PASS', 'Correctly rejected invalid currency');
    results.passed++;
  }
  results.total++;

  try {
    await exchangeRateService.convertFiatToCrypto('USD', 'INVALID', 100);
    logTest('Invalid Crypto', 'FAIL', 'Should have thrown error');
    results.failed++;
  } catch (error) {
    logTest('Invalid Crypto', 'PASS', 'Correctly rejected invalid crypto');
    results.passed++;
  }
  results.total++;

  try {
    await exchangeRateService.convertFiatToCrypto('USD', 'MATIC', -100);
    logTest('Negative Amount', 'FAIL', 'Should have thrown error');
    results.failed++;
  } catch (error) {
    logTest('Negative Amount', 'PASS', 'Correctly rejected negative amount');
    results.passed++;
  }
  results.total++;

  // Test 5: Real Payment Scenario
  logSection('TEST 5: Real Payment Scenarios');

  const scenarios = [
    { name: 'Small Order (₹500)', fiat: 'INR', crypto: 'MATIC', amount: 500 },
    { name: 'Medium Order (₹5000)', fiat: 'INR', crypto: 'MATIC', amount: 5000 },
    { name: 'Large Order (₹50000)', fiat: 'INR', crypto: 'MATIC', amount: 50000 },
    { name: 'USD Order ($100)', fiat: 'USD', crypto: 'MATIC', amount: 100 },
  ];

  for (const scenario of scenarios) {
    try {
      const result = await exchangeRateService.convertFiatToCrypto(
        scenario.fiat,
        scenario.crypto,
        scenario.amount
      );

      log(colors.yellow, `\n${scenario.name}:`);
      console.log(`  Fiat Amount: ${scenario.fiat} ${result.fiatAmount}`);
      console.log(`  Crypto Amount: ${result.cryptoAmount.toFixed(6)} ${scenario.crypto}`);
      console.log(`  Exchange Rate: 1 ${scenario.crypto} = ${scenario.fiat} ${result.exchangeRate.toFixed(2)}`);
      console.log(`  Timestamp: ${result.timestamp}`);
      console.log(`  Data Source: ${result.cached ? 'Cache' : 'Live API'}`);

      logTest(scenario.name, 'PASS');
      results.passed++;
    } catch (error) {
      logTest(scenario.name, 'FAIL', error.message);
      results.failed++;
    }
    results.total++;
  }

  // Final Summary
  logSection('TEST SUMMARY');

  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  const color = passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red;

  console.log(`\n  Total Tests:  ${results.total}`);
  log(colors.green, `  Passed:       ${results.passed}`);
  log(colors.red, `  Failed:       ${results.failed}`);
  log(color, `  Pass Rate:    ${passRate}%`);

  console.log('\n' + '='.repeat(70) + '\n');

  if (passRate >= 90) {
    log(colors.bright + colors.green, '✓ Exchange Rate Service: PRODUCTION READY');
  } else if (passRate >= 70) {
    log(colors.bright + colors.yellow, '⚠ Exchange Rate Service: NEEDS ATTENTION');
  } else {
    log(colors.bright + colors.red, '✗ Exchange Rate Service: CRITICAL ISSUES');
  }

  console.log('');

  // Exit with appropriate code
  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  log(colors.red, `\n✗ Test suite crashed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
