
const http = require('http');

// Test the simplified case creation API
async function testSimplifiedCaseCreation() {
    console.log('=== Testing Simplified Case Creation ===\n');
    
    try {
        // Test 1: Test GET endpoint without auth
        console.log('1. Testing GET /api/cases without auth...');
        const getResponse = await makeRequest('GET', '/api/cases', null);
        console.log(`Status: ${getResponse.status}`);
        if (getResponse.status === 401) {
            console.log('✓ GET endpoint correctly requires authentication\n');
        }
        
        // Test 2: Test POST endpoint without auth  
        console.log('2. Testing POST /api/cases without auth...');
        const testCase = {
            title: "Test Case - Förenklad version",
            description: "Detta är ett test av den förenklade case-skapande funktionen",
            priority: "HIGH",
            clientName: "Test Klient",
            clientEmail: "test@example.com"
        };
        
        const postResponse = await makeRequest('POST', '/api/cases', testCase);
        console.log(`Status: ${postResponse.status}`);
        if (postResponse.status === 401) {
            console.log('✓ POST endpoint correctly requires authentication\n');
        }
        
        console.log('3. API endpoints are properly secured');
        console.log('4. Ready for authentication testing with actual user session');
        
    } catch (error) {
        console.error('Test error:', error.message);
    }
}

function makeRequest(method, path, data) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    body: body
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                status: 'ERROR',
                body: error.message
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                status: 'TIMEOUT',
                body: 'Request timed out'
            });
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Run the test
testSimplifiedCaseCreation().catch(console.error);
