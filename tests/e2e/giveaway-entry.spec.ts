// @ts-nocheck
import { test, expect } from '@playwright/test'

test('giveaway cards render', async ({ page }) => {
  if (!process.env.E2E_BASE_URL) {
    test.skip(true, 'Missing E2E base URL')
  }

  await page.goto('/giveaways')
  await expect(page.getByText('Active Giveaways')).toBeVisible()
  await expect(page.locator('.bc-game-card').first()).toBeVisible()
})
