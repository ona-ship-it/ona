import type { Page } from '@playwright/test'

export const requireEnv = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export const loginWithEmail = async (page: Page) => {
  const email = requireEnv('E2E_EMAIL')
  const password = requireEnv('E2E_PASSWORD')

  await page.goto('/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL(/\/profile/) 
}
