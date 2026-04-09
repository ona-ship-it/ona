/** @jest-environment node */

import { authorizeCronRequest } from '@/lib/cronAuth'

describe('authorizeCronRequest', () => {
  const originalCronSecret = process.env.CRON_SECRET

  afterEach(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = originalCronSecret
    }
  })

  it('returns 500 when CRON_SECRET is not configured', async () => {
    delete process.env.CRON_SECRET

    const request = new Request('http://localhost/api/cron/test', {
      method: 'POST',
    })

    const response = authorizeCronRequest(request)

    expect(response).not.toBeNull()
    expect(response?.status).toBe(500)
  })

  it('accepts Authorization bearer secret', () => {
    process.env.CRON_SECRET = 'secret-123'

    const request = new Request('http://localhost/api/cron/test', {
      method: 'POST',
      headers: {
        authorization: 'Bearer secret-123',
      },
    })

    const response = authorizeCronRequest(request)

    expect(response).toBeNull()
  })

  it('accepts legacy x-cron-secret header by default', () => {
    process.env.CRON_SECRET = 'secret-123'

    const request = new Request('http://localhost/api/cron/test', {
      method: 'GET',
      headers: {
        'x-cron-secret': 'secret-123',
      },
    })

    const response = authorizeCronRequest(request)

    expect(response).toBeNull()
  })

  it('accepts legacy secret query parameter by default', () => {
    process.env.CRON_SECRET = 'secret-123'

    const request = new Request('http://localhost/api/cron/test?secret=secret-123', {
      method: 'GET',
    })

    const response = authorizeCronRequest(request)

    expect(response).toBeNull()
  })

  it('rejects legacy formats when disabled', () => {
    process.env.CRON_SECRET = 'secret-123'

    const request = new Request('http://localhost/api/cron/test?secret=secret-123', {
      method: 'GET',
      headers: {
        'x-cron-secret': 'secret-123',
      },
    })

    const response = authorizeCronRequest(request, { allowLegacySecretParam: false })

    expect(response).not.toBeNull()
    expect(response?.status).toBe(401)
  })

  it('rejects invalid authorization token', () => {
    process.env.CRON_SECRET = 'secret-123'

    const request = new Request('http://localhost/api/cron/test', {
      method: 'POST',
      headers: {
        authorization: 'Bearer wrong-secret',
      },
    })

    const response = authorizeCronRequest(request)

    expect(response).not.toBeNull()
    expect(response?.status).toBe(401)
  })
})
