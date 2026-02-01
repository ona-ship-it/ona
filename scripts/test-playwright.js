#!/usr/bin/env node

/**
 * Test Playwright Social Media Scrapers
 * This script tests the bio scraping functionality for each platform
 */

const { scrapeTwitterBio, scrapeInstagramBio, scrapeTikTokBio, scrapeYouTubeDescription } = require('../dist/utils/socialMediaScrapers.js');

async function testScrapers() {
  console.log('🎭 Testing Playwright Social Media Scrapers\n');
  console.log('='.repeat(50));

  // Test Twitter
  console.log('\n📱 Testing Twitter Scraper...');
  try {
    const twitterBio = await scrapeTwitterBio('elonmusk');
    console.log('✅ Twitter scrape successful!');
    console.log(`Bio preview: ${twitterBio.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ Twitter scrape failed:', error.message);
  }

  // Test Instagram
  console.log('\n📷 Testing Instagram Scraper...');
  try {
    const instagramBio = await scrapeInstagramBio('instagram');
    console.log('✅ Instagram scrape successful!');
    console.log(`Bio preview: ${instagramBio.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ Instagram scrape failed:', error.message);
  }

  // Test TikTok
  console.log('\n🎵 Testing TikTok Scraper...');
  try {
    const tiktokBio = await scrapeTikTokBio('tiktok');
    console.log('✅ TikTok scrape successful!');
    console.log(`Bio preview: ${tiktokBio.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ TikTok scrape failed:', error.message);
  }

  // Test YouTube
  console.log('\n🎥 Testing YouTube Scraper...');
  try {
    const youtubeDesc = await scrapeYouTubeDescription('YouTube');
    console.log('✅ YouTube scrape successful!');
    console.log(`Description preview: ${youtubeDesc.substring(0, 100)}...`);
  } catch (error) {
    console.error('❌ YouTube scrape failed:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Testing complete!\n');
}

// Run tests
testScrapers().catch(console.error);
