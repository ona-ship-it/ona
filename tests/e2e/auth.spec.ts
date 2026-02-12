// @ts-nocheck
import { test, expect } from '@playwright/test'
import { loginWithEmail } from './utils'

test('login with email', async ({ page }) => {
  if (!process.env.E2E_EMAIL || !process.env.E2E_PASSWORD || !process.env.E2E_BASE_URL) {
    test.skip(true, 'Missing E2E credentials or base URL')
  }

  await loginWithEmail(page)
  await expect(page).toHaveURL(/\/profile/)
})
