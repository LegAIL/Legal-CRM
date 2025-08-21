
const { execSync } = require('child_process');

console.log('🚀 Deploying to Cloud Run...\n');

try {
  // Check if gcloud is authenticated
  console.log('🔐 Checking authentication...');
  try {
    execSync('gcloud auth list --filter=status:ACTIVE --format="value(account)"', { stdio: 'pipe' });
  } catch (error) {
    console.log('⚠️ Please authenticate with: gcloud auth login');
    process.exit(1);
  }
  
  // Build and deploy using Cloud Build
  console.log('🔨 Building and deploying with Cloud Build...');
  execSync('gcloud builds submit --config cloudbuild.yaml', { stdio: 'inherit' });
  
  console.log('\n✅ Deployment complete!');
  console.log('🌍 Your app should be available at the Cloud Run URL shown above.');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n💡 Alternative deployment method:');
  console.log('gcloud run deploy laware-crm --source . --region europe-west1 --allow-unauthenticated');
  process.exit(1);
}
