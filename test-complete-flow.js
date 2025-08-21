
const puppeteer = require('puppeteer');

async function testCompleteFlow() {
    console.log('=== Testing Complete CRM Case Creation Flow ===\n');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        
        // Go to the app
        console.log('1. Navigating to application...');
        await page.goto('http://localhost:3000');
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        console.log('✓ Application loaded successfully\n');
        
        // Login with test account
        console.log('2. Logging in with test account...');
        await page.type('input[type="email"]', 'john@doe.com');
        await page.type('input[type="password"]', 'johndoe123');
        await page.click('button[type="submit"]');
        
        // Wait for dashboard
        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
        console.log('✓ Successfully logged in\n');
        
        // Navigate to cases page  
        console.log('3. Navigating to Cases page...');
        await page.goto('http://localhost:3000/cases');
        await page.waitForSelector('button:has-text("New Case")', { timeout: 10000 });
        console.log('✓ Cases page loaded\n');
        
        // Click New Case button
        console.log('4. Opening case creation modal...');
        await page.click('button:has-text("New Case")');
        await page.waitForSelector('input[id="title"]', { timeout: 5000 });
        console.log('✓ Case creation modal opened\n');
        
        // Fill in case details
        console.log('5. Filling case details...');
        await page.type('input[id="title"]', 'Test Case från Automatiserad Test');
        await page.type('textarea[id="description"]', 'Detta är ett test case skapat av det automatiserade testet för att verifiera att den förenklade case-skapande funktionen fungerar korrekt.');
        await page.type('input[id="clientName"]', 'Test Klient AB');
        await page.type('input[id="clientEmail"]', 'test@klient.se');
        
        // Select priority
        await page.click('button[role="combobox"]');
        await page.waitForSelector('[data-value="HIGH"]', { timeout: 3000 });
        await page.click('[data-value="HIGH"]');
        
        console.log('✓ Case details filled\n');
        
        // Submit the form
        console.log('6. Submitting case creation form...');
        await page.click('button[type="submit"]');
        
        // Wait for success toast or case list update
        await page.waitForTimeout(3000);
        console.log('✓ Case creation form submitted\n');
        
        // Check if case was created (look for the case in the list)
        console.log('7. Verifying case was created...');
        const caseExists = await page.evaluate(() => {
            return document.body.innerText.includes('Test Case från Automatiserad Test');
        });
        
        if (caseExists) {
            console.log('✅ SUCCESS: Case was created and appears in the list!');
        } else {
            console.log('❌ Case may not have been created or is not visible yet');
        }
        
        console.log('\n=== Test Complete ===');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Check if puppeteer is available, if not, provide manual test instructions
try {
    testCompleteFlow();
} catch (error) {
    console.log('Puppeteer not available. Manual testing instructions:');
    console.log('1. Open http://localhost:3000 in browser');
    console.log('2. Login with: john@doe.com / johndoe123');
    console.log('3. Navigate to Cases page');
    console.log('4. Click "New Case" button');
    console.log('5. Fill in the simple form with test data');
    console.log('6. Submit and verify case appears in list');
}
