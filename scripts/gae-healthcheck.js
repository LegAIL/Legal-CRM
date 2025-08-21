
/**
 * Health check script for Google App Engine deployment
 * Tests the deployed application's health and functionality
 */

const https = require('https');
const http = require('http');

const GAE_URL = process.env.GAE_URL || 'https://your-project-id.ey.r.appspot.com';

console.log('🔍 Testing GAE deployment health...\n');

// Health check endpoints to test
const endpoints = [
  { path: '/api/health', name: 'Health Check' },
  { path: '/', name: 'Homepage' },
  { path: '/auth/login', name: 'Login Page' },
  { path: '/dashboard', name: 'Dashboard (requires auth)' },
  { path: '/cases', name: 'Cases Page (requires auth)' }
];

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    request.on('error', (err) => {
      reject(err);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(endpoint) {
  const url = GAE_URL + endpoint.path;
  
  try {
    console.log(`Testing ${endpoint.name}: ${url}`);
    const response = await makeRequest(url);
    
    if (response.statusCode >= 200 && response.statusCode < 400) {
      console.log(`✅ ${endpoint.name}: ${response.statusCode}`);
      return true;
    } else if (response.statusCode === 401 && endpoint.path.includes('dashboard')) {
      console.log(`✅ ${endpoint.name}: ${response.statusCode} (Expected - requires auth)`);
      return true;
    } else {
      console.log(`⚠️  ${endpoint.name}: ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: ${error.message}`);
    return false;
  }
}

async function runHealthCheck() {
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(''); // Add spacing
  }
  
  const successCount = results.filter(r => r).length;
  const totalCount = results.length;
  
  console.log('='.repeat(50));
  console.log(`Health Check Results: ${successCount}/${totalCount} endpoints OK`);
  
  if (successCount === totalCount) {
    console.log('🎉 All endpoints are healthy!');
    process.exit(0);
  } else {
    console.log('⚠️  Some endpoints have issues. Check the logs above.');
    process.exit(1);
  }
}

// Run the health check
runHealthCheck().catch(error => {
  console.error('Fatal error during health check:', error);
  process.exit(1);
});
