-- Ensure only one free ticket per user per giveaway
CREATE UNIQUE INDEX IF NOT EXISTS tickets_unique_free
ON tickets (giveaway_id, user_id)
WHERE is_free = true;

-- Optional supporting index for regular lookups (non-unique)
CREATE INDEX IF NOT EXISTS tickets_giveaway_user_idx
ON tickets (giveaway_id, user_id);