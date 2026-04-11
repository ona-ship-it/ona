/** @jest-environment node */

import { describe, expect, it } from '@jest/globals'
import { getIdempotencyKey, persistIdempotencyResult, reserveIdempotencyKey } from '@/lib/idempotency'

type StoredRecord = {
  status_code: number | null
  response_body: unknown
}

function makeCompositeKey(userId: string, endpoint: string, key: string) {
  return `${userId}::${endpoint}::${key}`
}

function createMockAdminClient() {
  const store = new Map<string, StoredRecord>()

  return {
    from: () => ({
      insert: async (values: Record<string, unknown>) => {
        const composite = makeCompositeKey(
          String(values.user_id),
          String(values.endpoint),
          String(values.idempotency_key)
        )

        if (store.has(composite)) {
          return { error: { code: '23505', message: 'duplicate key value violates unique constraint' } }
        }

        store.set(composite, { status_code: null, response_body: null })
        return { error: null }
      },
      select: () => {
        const filters: Record<string, unknown> = {}

        const level4 = {
          maybeSingle: async () => {
            const composite = makeCompositeKey(
              String(filters.user_id),
              String(filters.endpoint),
              String(filters.idempotency_key)
            )
            const data = store.get(composite)
            return { data: data || null, error: null }
          },
          update: async (_values: Record<string, unknown>) => ({ error: null }),
        }

        const level3 = {
          eq: (column: string, value: unknown) => {
            filters[column] = value
            return level4
          },
          update: async (_values: Record<string, unknown>) => ({ error: null }),
        }

        const level2 = {
          eq: (column: string, value: unknown) => {
            filters[column] = value
            return level3
          },
          update: async (_values: Record<string, unknown>) => ({ error: null }),
        }

        const level1 = {
          eq: (column: string, value: unknown) => {
            filters[column] = value
            return level2
          },
        }

        return level1
      },
      update: (values: Record<string, unknown>) => {
        const filters: Record<string, unknown> = {}

        const level3 = async (column: string, value: unknown) => {
          filters[column] = value
          const composite = makeCompositeKey(
            String(filters.user_id),
            String(filters.endpoint),
            String(filters.idempotency_key)
          )
          const existing = store.get(composite)
          if (existing) {
            store.set(composite, {
              status_code: typeof values.status_code === 'number' ? values.status_code : existing.status_code,
              response_body: values.response_body ?? existing.response_body,
            })
          }
          return { error: null }
        }

        const level2 = {
          eq: (column: string, value: unknown) => {
            filters[column] = value
            return { eq: level3 }
          },
        }

        const level1 = {
          eq: (column: string, value: unknown) => {
            filters[column] = value
            return level2
          },
        }

        return level1
      },
    }),
  }
}

describe('idempotency helper', () => {
  it('extracts valid idempotency keys from request headers', () => {
    const req = new Request('http://localhost/api/test', {
      headers: {
        'x-idempotency-key': '12345678-valid-key',
      },
    })

    expect(getIdempotencyKey(req)).toBe('12345678-valid-key')
  })

  it('ignores missing or invalid idempotency keys', () => {
    const missing = new Request('http://localhost/api/test')
    const tooShort = new Request('http://localhost/api/test', {
      headers: { 'x-idempotency-key': 'short' },
    })

    expect(getIdempotencyKey(missing)).toBeNull()
    expect(getIdempotencyKey(tooShort)).toBeNull()
  })

  it('returns in_progress before result is persisted and replay after persistence', async () => {
    const adminClient = createMockAdminClient()
    const userId = 'user-1'
    const endpoint = 'entries:test:create'
    const key = '12345678-retry'

    const firstReserve = await reserveIdempotencyKey({
      adminClient,
      userId,
      endpoint,
      key,
    })
    expect(firstReserve.type).toBe('new')

    const secondReserve = await reserveIdempotencyKey({
      adminClient,
      userId,
      endpoint,
      key,
    })
    expect(secondReserve.type).toBe('in_progress')

    await persistIdempotencyResult({
      adminClient,
      userId,
      endpoint,
      key,
      statusCode: 200,
      body: { success: true, ticketId: 't-1' },
    })

    const thirdReserve = await reserveIdempotencyKey({
      adminClient,
      userId,
      endpoint,
      key,
    })

    expect(thirdReserve.type).toBe('replay')
    if (thirdReserve.type === 'replay') {
      expect(thirdReserve.statusCode).toBe(200)
      expect(thirdReserve.body).toEqual({ success: true, ticketId: 't-1' })
    }
  })
})
