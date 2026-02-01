/**
 * Standalone Playwright Test
 * Tests basic browser automation functionality
 */

const { chromium } = require('playwright-chromium');

async function testPlaywright() {
  console.log('🎭 Testing Playwright Installation\n');
  console.log('Starting Chromium browser...');
  
  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({
      headless: true,
    });
    
    console.log('✅ Browser launched successfully!');
    
    // Create a new page
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    console.log('✅ New page created');
    
    // Navigate to a test website
    console.log('\nNavigating to example.com...');
    await page.goto('https://example.com', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ Page loaded');
    
    // Extract page title
    const title = await page.title();
    console.log(`\n📄 Page Title: "${title}"`);
    
    // Extract some content
    const h1Text = await page.$eval('h1', el => el.textContent);
    console.log(`📝 H1 Content: "${h1Text}"`);
    
    // Close browser
    await browser.close();
    console.log('\n✅ Browser closed');
    
    console.log('\n' + '='.repeat(50));
    console.log('✨ Playwright is working perfectly!');
    console.log('='.repeat(50));
    console.log('\n💡 You can now use it for social media verification');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (browser) await browser.close();
  }
}

// Run test
testPlaywright();
