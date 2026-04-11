/** @jest-environment node */

import { GET as drawWinnersGet, POST as drawWinnersPost } from '@/app/api/cron/draw-winners/route'
import { GET as sendEmailsGet, POST as sendEmailsPost } from '@/app/api/cron/send-emails/route'
import { GET as fundraiseEmailsGet, POST as fundraiseEmailsPost } from '@/app/api/fundraise/send-emails/route'

describe('cron route authorization guards', () => {
  const originalCronSecret = process.env.CRON_SECRET

  beforeEach(() => {
    process.env.CRON_SECRET = 'test-cron-secret'
  })

  afterEach(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = originalCronSecret
    }
  })

  it('draw winners GET returns 401 without auth', async () => {
    const request = new Request('http://localhost/api/cron/draw-winners', { method: 'GET' })
    const response = await drawWinnersGet(request as never)

    expect(response.status).toBe(401)
  })

  it('draw winners POST returns 401 without auth', async () => {
    const request = new Request('http://localhost/api/cron/draw-winners', { method: 'POST' })
    const response = await drawWinnersPost(request as never)

    expect(response.status).toBe(401)
  })

  it('send emails GET returns 401 without auth', async () => {
    const request = new Request('http://localhost/api/cron/send-emails', { method: 'GET' })
    const response = await sendEmailsGet(request)

    expect(response.status).toBe(401)
  })

  it('send emails POST returns 401 without auth', async () => {
    const request = new Request('http://localhost/api/cron/send-emails', { method: 'POST' })
    const response = await sendEmailsPost(request)

    expect(response.status).toBe(401)
  })

  it('fundraise emails GET returns 401 without auth', async () => {
    const request = new Request('http://localhost/api/fundraise/send-emails', { method: 'GET' })
    const response = await fundraiseEmailsGet(request as never)

    expect(response.status).toBe(401)
  })

  it('fundraise emails POST returns 401 without auth', async () => {
    const request = new Request('http://localhost/api/fundraise/send-emails', { method: 'POST' })
    const response = await fundraiseEmailsPost(request as never)

    expect(response.status).toBe(401)
  })
})
