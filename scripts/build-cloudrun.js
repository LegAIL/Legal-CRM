
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Building for Cloud Run...\n');

try {
  // Setup configuration
  console.log('⚙️ Setting up configuration...');
  execSync('node scripts/setup-cloudrun.js', { stdio: 'inherit' });
  
  // Generate Prisma client
  console.log('🗄️ Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  // Build the application
  console.log('📦 Building Next.js application...');
  execSync('yarn build', { stdio: 'inherit' });
  
  console.log('\n✅ Build successful! Ready for containerization.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
