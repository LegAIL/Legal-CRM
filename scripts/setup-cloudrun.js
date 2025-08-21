
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Cloud Run deployment...\n');

// Backup current next.config.js
const currentConfig = path.join(__dirname, '../next.config.js');
const backupConfig = path.join(__dirname, '../next.config.backup.js');

if (fs.existsSync(currentConfig)) {
  fs.copyFileSync(currentConfig, backupConfig);
  console.log('✅ Backed up current next.config.js');
}

// Copy Cloud Run config
const cloudRunConfig = path.join(__dirname, '../next.config.cloudrun.js');
if (fs.existsSync(cloudRunConfig)) {
  fs.copyFileSync(cloudRunConfig, currentConfig);
  console.log('✅ Applied Cloud Run configuration');
}

// Create .env.production.local if it doesn't exist
const envProdLocal = path.join(__dirname, '../.env.production.local');
const envCloudRun = path.join(__dirname, '../.env.cloudrun');

if (!fs.existsSync(envProdLocal) && fs.existsSync(envCloudRun)) {
  fs.copyFileSync(envCloudRun, envProdLocal);
  console.log('✅ Created .env.production.local from template');
}

console.log('\n✨ Cloud Run setup complete!');
console.log('\nNext steps:');
console.log('1. Update environment variables in .env.production.local');
console.log('2. Test Docker build: npm run docker:build');
console.log('3. Deploy: npm run deploy:cloudrun');
