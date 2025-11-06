#!/usr/bin/env node

// Enable detailed error stack traces
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  console.error(reason.stack);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  console.error(error.stack);
  process.exit(1);
});

require('dotenv').config({ path: '/Users/lalithmachavarapu/Downloads/FARM_CHAIN/backend/.env' });
process.chdir('/Users/lalithmachavarapu/Downloads/FARM_CHAIN/backend');

console.log('🚀 Starting FarmChain Backend...');
console.log('Working directory:', process.cwd());
console.log('PORT:', process.env.PORT);
console.log('');

try {
  require('./src/server.js');
} catch (error) {
  console.error('❌ Failed to load server:', error);
  console.error(error.stack);
  process.exit(1);
}
