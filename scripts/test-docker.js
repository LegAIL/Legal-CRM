
const { execSync, spawn } = require('child_process');
const fs = require('fs');

console.log('🐳 Testing Docker build and run...\n');

try {
  // Setup configuration first
  console.log('⚙️ Setting up configuration...');
  execSync('node scripts/setup-cloudrun.js', { stdio: 'inherit' });
  
  // Build Docker image
  console.log('🔨 Building Docker image...');
  execSync('docker build -t laware-crm .', { stdio: 'inherit' });
  
  console.log('\n✅ Docker build successful!');
  
  // Check if .env.production.local exists
  if (!fs.existsSync('.env.production.local')) {
    console.log('⚠️ Creating .env.production.local from template...');
    if (fs.existsSync('.env.cloudrun')) {
      fs.copyFileSync('.env.cloudrun', '.env.production.local');
    }
  }
  
  console.log('\n🏃 Starting container (press Ctrl+C to stop)...');
  
  // Run container
  const containerProcess = spawn('docker', [
    'run', '-p', '3000:3000', 
    '--env-file', '.env.production.local',
    'laware-crm'
  ], { stdio: 'inherit' });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Stopping container...');
    containerProcess.kill('SIGTERM');
    process.exit(0);
  });
  
} catch (error) {
  console.error('❌ Docker test failed:', error.message);
  process.exit(1);
}
