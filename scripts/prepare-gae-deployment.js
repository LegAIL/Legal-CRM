
/**
 * Script to prepare the CRM application for Google App Engine deployment
 * Run this script before deploying to GAE
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing CRM application for Google App Engine deployment...\n');

// 1. Create next.config.gae.js for GAE-specific configuration
const gaeNextConfig = `const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '.next',
  
  // Use standalone output for Google App Engine deployment
  output: 'standalone',
  
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../'),
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Image optimization settings for GAE
  images: { 
    unoptimized: true,
    domains: [],
  },
  
  // Headers configuration for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;`;

fs.writeFileSync(path.join(__dirname, '../next.config.gae.js'), gaeNextConfig);
console.log('✅ Created next.config.gae.js for GAE deployment');

// 2. Update package.json scripts for GAE
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add GAE-specific scripts
packageJson.scripts = {
  ...packageJson.scripts,
  'build:gae': 'cp next.config.gae.js next.config.js && next build && rm next.config.js && mv next.config.gae.js next.config.js',
  'deploy:gae': 'npm run build:gae && gcloud app deploy --quiet',
  'preview:gae': 'npm run build:gae && npm start',
  'postbuild': 'prisma generate'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with GAE deployment scripts');

// 3. Create production environment check
console.log('✅ Verifying environment variables...');

const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
const envFile = path.join(__dirname, '../.env.production');

if (fs.existsSync(envFile)) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  const missingVars = requiredEnvVars.filter(varName => 
    !envContent.includes(`${varName}=`) || envContent.includes(`${varName}=""`)
  );
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing or empty environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('   Please update .env.production with correct values');
  } else {
    console.log('✅ All required environment variables are set');
  }
} else {
  console.log('⚠️  .env.production file not found');
}

// 4. Verify Prisma configuration
console.log('✅ Checking Prisma configuration...');
const prismaSchemaPath = path.join(__dirname, '../prisma/schema.prisma');
if (fs.existsSync(prismaSchemaPath)) {
  const prismaSchema = fs.readFileSync(prismaSchemaPath, 'utf8');
  if (prismaSchema.includes('binaryTargets') && prismaSchema.includes('linux')) {
    console.log('✅ Prisma is configured for Linux deployment');
  } else {
    console.log('⚠️  Consider adding "linux-musl-arm64-openssl-3.0.x" to Prisma binaryTargets');
  }
}

console.log('\n🎉 GAE deployment preparation completed!');
console.log('\nNext steps:');
console.log('1. Update .env.production with your production values');
console.log('2. Set up Cloud SQL database (if not already done)');
console.log('3. Run: npm run deploy:gae');
