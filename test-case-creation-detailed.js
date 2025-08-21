
const https = require('https');
const fs = require('fs');

// Test script to authenticate and create a case
async function testCaseCreation() {
    console.log('=== CRM Case Creation Test ===\n');
    
    try {
        // Test 1: Check API endpoint accessibility
        console.log('1. Testing API endpoint accessibility...');
        
        const apiTestResponse = await makeRequest('GET', '/api/cases', null);
        console.log(`API Status: ${apiTestResponse.status}`);
        
        if (apiTestResponse.status === 401) {
            console.log('✓ API correctly returns 401 (needs authentication)\n');
        } else {
            console.log('❌ Unexpected API response status\n');
        }
        
        // Test 2: Try to create a case without authentication
        console.log('2. Testing case creation without authentication...');
        
        const testPayload = {
            title: "Test Case",
            description: "Testing case creation functionality",
            priority: "MEDIUM"
        };
        
        const unauthorizedResponse = await makeRequest('POST', '/api/cases', testPayload);
        console.log(`Unauthorized POST Status: ${unauthorizedResponse.status}`);
        
        if (unauthorizedResponse.status === 401) {
            console.log('✓ Case creation correctly requires authentication\n');
        } else {
            console.log('❌ Case creation should require authentication\n');
        }
        
        // Test 3: Check database connection
        console.log('3. Testing database connection...');
        
        const { execSync } = require('child_process');
        try {
            const dbCheck = execSync('cd /home/ubuntu/laware_crm && yarn prisma db status 2>&1', { encoding: 'utf8' });
            console.log('Database check output:');
            console.log(dbCheck);
            console.log('');
        } catch (error) {
            console.log('Database connection error:');
            console.log(error.stdout || error.message);
            console.log('');
        }
        
        // Test 4: Check if test user exists
        console.log('4. Checking test user existence...');
        
        try {
            const userCheck = execSync('cd /home/ubuntu/laware_crm && node -e "const { PrismaClient } = require(\'@prisma/client\'); const prisma = new PrismaClient(); prisma.user.findUnique({where:{email:\'john@doe.com\'}}).then(u => console.log(u ? \'User exists\' : \'User not found\')).finally(() => prisma.$disconnect())"', { encoding: 'utf8' });
            console.log('User check:', userCheck.trim());
            console.log('');
        } catch (error) {
            console.log('User check error:', error.message);
            console.log('');
        }
        
        // Test 5: Check create-case-modal complexity
        console.log('5. Analyzing create-case-modal complexity...');
        
        const modalPath = '/home/ubuntu/laware_crm/components/cases/create-case-modal.tsx';
        if (fs.existsSync(modalPath)) {
            const modalContent = fs.readFileSync(modalPath, 'utf8');
            const lines = modalContent.split('\n').length;
            const milestoneMatches = (modalContent.match(/milestone/gi) || []).length;
            const legalStatuteMatches = (modalContent.match(/legal/gi) || []).length;
            const driveLinkMatches = (modalContent.match(/drive/gi) || []).length;
            
            console.log(`Modal file: ${lines} lines`);
            console.log(`Milestone references: ${milestoneMatches}`);
            console.log(`Legal statute references: ${legalStatuteMatches}`);
            console.log(`Drive link references: ${driveLinkMatches}`);
            
            if (lines > 800) {
                console.log('❌ Modal is very complex (>800 lines) - needs simplification');
            } else {
                console.log('✓ Modal complexity is manageable');
            }
            console.log('');
        }
        
        // Test 6: Check server logs for errors
        console.log('6. Checking for server errors...');
        
        try {
            const serverLog = execSync('cd /home/ubuntu/laware_crm && tail -10 server.log 2>/dev/null || echo "No server.log found"', { encoding: 'utf8' });
            console.log('Recent server logs:');
            console.log(serverLog);
        } catch (error) {
            console.log('No server log errors found');
        }
        
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

        const req = https.request(options, (res) => {
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
testCaseCreation().catch(console.error);
