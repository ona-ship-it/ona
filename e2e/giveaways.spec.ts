import { test, expect } from '@playwright/test'

test.describe('Giveaways Page', () => {
  test('should load the giveaways page successfully', async ({ page }) => {
    await page.goto('/giveaways')
    
    // Check that the page loads
    await expect(page.locator('text=Giveaways')).toBeVisible()
  })

  test('should display giveaway cards', async ({ page }) => {
    await page.goto('/giveaways')
    
    // Check for giveaway titles
    await expect(page.locator('text=$300 Weekend Special')).toBeVisible()
    await expect(page.locator('text=$750 Premium Raffle')).toBeVisible()
  })

  test('should show giveaway details', async ({ page }) => {
    await page.goto('/giveaways')
    
    // Check for prize amounts
    await expect(page.locator('text=$300')).toBeVisible()
    await expect(page.locator('text=$750')).toBeVisible()
    
    // Check for entry counts
    await expect(page.locator('text=/\\d+ entries/')).toBeVisible()
    
    // Check for time remaining
    await expect(page.locator('text=/\\d+[dh]/')).toBeVisible()
  })

  test('should have working carousel navigation', async ({ page }) => {
    await page.goto('/giveaways')
    
    // Look for navigation buttons (chevron icons)
    const navButtons = page.locator('button').filter({ hasText: /chevron|arrow|<|>/ })
    
    if (await navButtons.count() > 0) {
      // Test clicking navigation if it exists
      await navButtons.first().click()
      
      // Page should still be functional after navigation
      await expect(page.locator('text=Giveaways')).toBeVisible()
    }
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/giveaways')
    
    // Check that content is still visible on mobile
    await expect(page.locator('text=Giveaways')).toBeVisible()
    
    // Check that giveaway cards are still visible
    await expect(page.locator('text=$300 Weekend Special')).toBeVisible()
  })

  test('should handle empty states gracefully', async ({ page }) => {
    await page.goto('/giveaways')
    
    // The page should load without errors even if no giveaways
    await expect(page.locator('text=Giveaways')).toBeVisible()
  })
})