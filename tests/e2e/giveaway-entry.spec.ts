import { test, expect } from '@playwright/test'

test('giveaway cards render', async ({ page }) => {
  if (!process.env.E2E_BASE_URL) {
    test.skip(true, 'Missing E2E base URL')
  }

  await page.goto('/giveaways')
  await expect(page.getByText('Active Giveaways')).toBeVisible()

  const cards = page.locator('.bc-game-card')
  const cardCount = await cards.count()

  if (cardCount > 0) {
    await expect(cards.first()).toBeVisible()
    return
  }

  await expect(page.getByText('No Active Giveaways')).toBeVisible()
})
