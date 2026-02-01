import { chromium } from 'playwright-chromium'

// Twitter/X Bio Scraper
export async function scrapeTwitterBio(username: string): Promise<string> {
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
    })
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    const page = await context.newPage()
    
    // Go to Twitter profile
    const url = `https://twitter.com/${username}`
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Wait for bio to load
    await page.waitForSelector('[data-testid="UserDescription"]', { timeout: 10000 })
    
    // Extract bio text
    const bioElement = await page.$('[data-testid="UserDescription"]')
    const bioText = bioElement ? await bioElement.textContent() : ''
    
    await browser.close()
    return bioText || ''
    
  } catch (error) {
    console.error('Twitter scrape error:', error)
    if (browser) await browser.close()
    throw new Error('Failed to verify Twitter account. Make sure your profile is public.')
  }
}

// Instagram Bio Scraper
export async function scrapeInstagramBio(username: string): Promise<string> {
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
    })
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    const page = await context.newPage()
    
    // Go to Instagram profile
    const url = `https://www.instagram.com/${username}/`
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Instagram might have different selectors, update as needed
    await page.waitForTimeout(3000) // Wait for content to load
    
    // Try to find bio in page content
    const content = await page.content()
    
    // Extract bio from meta tags (Instagram includes bio in meta description)
    const bioMeta = await page.$('meta[property="og:description"]')
    const bioText = bioMeta ? await bioMeta.getAttribute('content') : ''
    
    await browser.close()
    return bioText || ''
    
  } catch (error) {
    console.error('Instagram scrape error:', error)
    if (browser) await browser.close()
    throw new Error('Failed to verify Instagram account. Make sure your profile is public.')
  }
}

// TikTok Bio Scraper
export async function scrapeTikTokBio(username: string): Promise<string> {
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
    })
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    const page = await context.newPage()
    
    // Clean username (remove @ if present)
    const cleanUsername = username.replace('@', '')
    
    // Go to TikTok profile
    const url = `https://www.tiktok.com/@${cleanUsername}`
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    
    await page.waitForTimeout(3000)
    
    // Try to get bio from meta tags
    const bioMeta = await page.$('meta[name="description"]')
    const bioText = bioMeta ? await bioMeta.getAttribute('content') : ''
    
    await browser.close()
    return bioText || ''
    
  } catch (error) {
    console.error('TikTok scrape error:', error)
    if (browser) await browser.close()
    throw new Error('Failed to verify TikTok account. Make sure your profile is public.')
  }
}

// YouTube Description Scraper
export async function scrapeYouTubeDescription(username: string): Promise<string> {
  let browser
  try {
    browser = await chromium.launch({
      headless: true,
    })
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
    
    const page = await context.newPage()
    
    // Go to YouTube channel
    const url = username.startsWith('http') 
      ? username 
      : `https://www.youtube.com/@${username}`
    
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Click "About" tab
    try {
      await page.click('tp-yt-paper-tab:has-text("About")', { timeout: 5000 })
      await page.waitForTimeout(2000)
    } catch {
      // About tab might not be visible, continue
    }
    
    // Try to get description
    const descMeta = await page.$('meta[name="description"]')
    const descText = descMeta ? await descMeta.getAttribute('content') : ''
    
    await browser.close()
    return descText || ''
    
  } catch (error) {
    console.error('YouTube scrape error:', error)
    if (browser) await browser.close()
    throw new Error('Failed to verify YouTube channel. Make sure it\'s public.')
  }
}
