/**
 * Simple Playwright Test Script
 * Tests bio scraping for a single platform
 */

import { scrapeTwitterBio } from '../src/utils/socialMediaScrapers'

async function testTwitterScraper() {
  console.log('🎭 Testing Playwright Twitter Scraper\n')
  console.log('Target: @elonmusk')
  console.log('Starting browser...\n')

  try {
    const startTime = Date.now()
    const bio = await scrapeTwitterBio('elonmusk')
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('✅ Success!')
    console.log(`⏱️  Duration: ${duration}s`)
    console.log('\n📝 Bio Content:')
    console.log('─'.repeat(50))
    console.log(bio || '(empty bio)')
    console.log('─'.repeat(50))
    console.log('\n💡 Playwright is working correctly!')
    
  } catch (error: any) {
    console.error('❌ Failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Make sure you have internet connection')
    console.log('2. The profile might be private or suspended')
    console.log('3. Twitter might be blocking automated requests')
  }
}

// Run test
testTwitterScraper()
