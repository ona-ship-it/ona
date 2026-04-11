import { NextResponse } from 'next/server'

type CronAuthOptions = {
  allowLegacySecretParam?: boolean
}

export function authorizeCronRequest(
  request: Request,
  options: CronAuthOptions = { allowLegacySecretParam: true }
): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET is not configured')
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${cronSecret}`) {
    return null
  }

  if (options.allowLegacySecretParam) {
    const legacyHeader = request.headers.get('x-cron-secret')
    const legacyQuery = new URL(request.url).searchParams.get('secret')

    if (legacyHeader === cronSecret || legacyQuery === cronSecret) {
      return null
    }
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
