-- Idempotency keys for retry-safe write endpoints

CREATE TABLE IF NOT EXISTS public.api_idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  status_code INTEGER,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  UNIQUE (user_id, endpoint, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_keys_expires_at
  ON public.api_idempotency_keys (expires_at);

CREATE INDEX IF NOT EXISTS idx_api_idempotency_keys_lookup
  ON public.api_idempotency_keys (user_id, endpoint, idempotency_key);

ALTER TABLE public.api_idempotency_keys ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'api_idempotency_keys'
      AND policyname = 'Users can read own idempotency keys'
  ) THEN
    CREATE POLICY "Users can read own idempotency keys"
      ON public.api_idempotency_keys
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'api_idempotency_keys'
      AND policyname = 'Users can insert own idempotency keys'
  ) THEN
    CREATE POLICY "Users can insert own idempotency keys"
      ON public.api_idempotency_keys
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'api_idempotency_keys'
      AND policyname = 'Users can update own idempotency keys'
  ) THEN
    CREATE POLICY "Users can update own idempotency keys"
      ON public.api_idempotency_keys
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'api_idempotency_keys'
      AND policyname = 'Users can delete own idempotency keys'
  ) THEN
    CREATE POLICY "Users can delete own idempotency keys"
      ON public.api_idempotency_keys
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;
