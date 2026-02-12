// @ts-nocheck
import { test, expect } from '@playwright/test'
import { loginWithEmail, requireEnv } from './utils'

test('follow and unfollow a profile', async ({ page }) => {
  if (!process.env.E2E_BASE_URL || !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD || !process.env.E2E_PROFILE_ID) {
    test.skip(true, 'Missing E2E config for follow test')
  }

  const profileId = requireEnv('E2E_PROFILE_ID')

  await loginWithEmail(page)
  await page.goto(`/profiles/${profileId}`)

  const followButton = page.getByRole('button', { name: /Follow|Following/ })
  await expect(followButton).toBeVisible()

  const isFollowing = await followButton.textContent()
  if (isFollowing?.includes('Following')) {
    await followButton.click()
    await expect(followButton).toHaveText(/Follow/)
  }

  await followButton.click()
  await expect(followButton).toHaveText(/Following/)
})
