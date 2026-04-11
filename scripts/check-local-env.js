#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const root = process.cwd()

const envFiles = ['.env.local', '.env']
for (const file of envFiles) {
  const filePath = path.join(root, file)
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false })
  }
}

const requiredInProduction = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
]

const recommendedInProduction = [
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'NEXT_PUBLIC_SITE_URL',
]

function missing(keys) {
  return keys.filter((key) => !process.env[key] || String(process.env[key]).trim() === '')
}

const missingRequired = missing(requiredInProduction)
const missingRecommended = missing(recommendedInProduction)

const runningInCi = process.env.CI === 'true'
const runningOnVercel = !!process.env.VERCEL
const isStrictRuntime = runningInCi || runningOnVercel

console.log('\n[env-check] Environment check before build')
console.log('[env-check] Required in production:', requiredInProduction.join(', '))
console.log('[env-check] Recommended in production:', recommendedInProduction.join(', '))

if (missingRequired.length === 0) {
  console.log('[env-check] Required vars in current environment: OK')
} else {
  console.log(`[env-check] Missing in current environment (required in production): ${missingRequired.join(', ')}`)
}

if (missingRecommended.length === 0) {
  console.log('[env-check] Recommended vars in current environment: OK')
} else {
  console.log(`[env-check] Missing in current environment (recommended): ${missingRecommended.join(', ')}`)
}

if (!isStrictRuntime && missingRequired.length > 0) {
  console.log('[env-check] Local-only warning: missing vars can still be configured in Vercel/GitHub Secrets for production.')
}

if (isStrictRuntime && missingRequired.length > 0) {
  console.error('[env-check] Failing build because required production env vars are missing in CI/runtime.')
  process.exit(1)
}

console.log('[env-check] Done\n')
