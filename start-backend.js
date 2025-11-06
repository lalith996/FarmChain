const { spawn } = require('child_process');
const path = require('path');

const backendDir = '/Users/lalithmachavarapu/Downloads/FARM_CHAIN/backend';
const serverPath = path.join(backendDir, 'src/server.js');

console.log('🚀 Starting FarmChain Backend Server...');
console.log(`📂 Directory: ${backendDir}`);
console.log(`📄 Server: ${serverPath}`);
console.log(`🔌 Port: 5001\n`);

const server = spawn('node', [serverPath], {
  cwd: backendDir,
  env: { ...process.env, PORT: '5001' },
  stdio: 'inherit'
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});
