type SupabaseLikeClient = {
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => Promise<{ error: { code?: string; message?: string } | null }>
    select: (columns: string) => {
      eq: (column: string, value: unknown) => {
        eq: (column: string, value: unknown) => {
          eq: (column: string, value: unknown) => {
            maybeSingle: () => Promise<{
              data: { status_code: number | null; response_body: unknown } | null
              error: { message?: string } | null
            }>
            update: (values: Record<string, unknown>) => Promise<{ error: { message?: string } | null }>
          }
          update: (values: Record<string, unknown>) => Promise<{ error: { message?: string } | null }>
        }
      }
    }
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: unknown) => {
        eq: (column: string, value: unknown) => {
          eq: (column: string, value: unknown) => Promise<{ error: { message?: string } | null }>
        }
      }
    }
  }
}

type IdempotencyReplay = {
  type: 'replay'
  statusCode: number
  body: unknown
}

type IdempotencyReservation =
  | { type: 'new' }
  | IdempotencyReplay
  | { type: 'in_progress' }

const IDEMPOTENCY_HEADER = 'x-idempotency-key'

export function getIdempotencyKey(request: Request): string | null {
  const key = request.headers.get(IDEMPOTENCY_HEADER)?.trim()
  if (!key) return null
  if (key.length < 8 || key.length > 128) return null
  return key
}

export async function reserveIdempotencyKey(params: {
  adminClient: SupabaseLikeClient
  userId: string
  endpoint: string
  key: string
}): Promise<IdempotencyReservation> {
  const { adminClient, userId, endpoint, key } = params

  const { error: insertError } = await adminClient
    .from('api_idempotency_keys')
    .insert({
      user_id: userId,
      endpoint,
      idempotency_key: key,
    })

  if (!insertError) {
    return { type: 'new' }
  }

  if (insertError.code !== '23505') {
    throw new Error(insertError.message || 'Failed to reserve idempotency key')
  }

  const { data: existing, error: lookupError } = await adminClient
    .from('api_idempotency_keys')
    .select('status_code, response_body')
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .eq('idempotency_key', key)
    .maybeSingle()

  if (lookupError) {
    throw new Error(lookupError.message || 'Failed to lookup idempotency key')
  }

  if (existing && typeof existing.status_code === 'number' && existing.response_body !== null) {
    return {
      type: 'replay',
      statusCode: existing.status_code,
      body: existing.response_body,
    }
  }

  return { type: 'in_progress' }
}

export async function persistIdempotencyResult(params: {
  adminClient: SupabaseLikeClient
  userId: string
  endpoint: string
  key: string
  statusCode: number
  body: unknown
}): Promise<void> {
  const { adminClient, userId, endpoint, key, statusCode, body } = params

  const { error } = await adminClient
    .from('api_idempotency_keys')
    .update({
      status_code: statusCode,
      response_body: body,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('endpoint', endpoint)
    .eq('idempotency_key', key)

  if (error) {
    throw new Error(error.message || 'Failed to persist idempotency result')
  }
}
