import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Onagui/)
    
    // Check for main heading
    await expect(page.locator('text=Onagui')).toBeVisible()
  })

  test('should have working navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check navigation is present
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    
    // Check logo/brand link
    const brandLink = page.locator('a[href="/"]').first()
    await expect(brandLink).toBeVisible()
  })

  test('should display animated background elements', async ({ page }) => {
    await page.goto('/')
    
    // Check for animated elements
    const animatedElements = page.locator('.animate-pulse, .animate-ping')
    await expect(animatedElements.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check that content is still visible on mobile
    await expect(page.locator('text=Onagui')).toBeVisible()
    
    // Check that navigation adapts to mobile
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')
    
    // Check for viewport meta tag
    const viewportMeta = page.locator('meta[name="viewport"]')
    await expect(viewportMeta).toHaveAttribute('content', /width=device-width/)
  })
})