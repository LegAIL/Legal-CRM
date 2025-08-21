
const http = require('http');

async function testCaseCreation() {
  console.log('🧪 Testing case creation functionality...');
  
  // Test 1: Check if API endpoint responds correctly (without auth should be 401)
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cases',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const testData = JSON.stringify({
    title: 'Test Case from Script',
    description: 'This is a test case to verify the POST endpoint works',
    priority: 'HIGH',
    clientName: 'Test Client'
  });

  const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('Response Body:', data);
      
      if (res.statusCode === 401) {
        console.log('✅ POST endpoint is working correctly (returns 401 for unauthenticated requests)');
      } else if (res.statusCode === 405) {
        console.log('❌ POST endpoint is NOT working (Method not allowed)');
      } else {
        console.log(`📝 Unexpected status code: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error);
  });

  req.write(testData);
  req.end();
}

testCaseCreation();
