# Platform Overview (Beginner Friendly)

This platform lets people create and join giveaways safely. Every user can have a wallet for deposits and withdrawals. Admins manage giveaway visibility (publish/unpublish). Security is enforced by authentication and database rules that say “who can see or change what”.

## Who Uses It

- Users: sign up, browse giveaways, join.
- Admins: trusted users who can publish/unpublish and review giveaways.
- System: background services that keep wallets healthy.

## How It Works (Simple Flow)

1. You log in. The site gets a secure token (proof of who you are).
2. You browse active giveaways and join one (creates your ticket in the database).
3. Your wallet keeps track of your balance, deposits, and withdrawals.
4. Admins can change a giveaway’s status (publish/unpublish). The system validates the request, verifies admin rights, updates the giveaway, and logs an audit entry.

See the diagram: `docs/architecture-overview.svg`.

## Key Building Blocks

- Authentication (Supabase): signs users in and provides tokens.
- Authorization (RLS): database rules that enforce access per user/admin.
- Admin API: secure endpoints to publish/unpublish giveaways.
- Auditing: records “who changed what and when”.
- Validation: checks inputs (like giveaway status) to avoid bad data.

## Important Data Tables (Plain English)

- `giveaways`: a list of giveaways with status (`draft`, `active`, `paused`), creator, and timestamps.
- `tickets`: records of users joining giveaways (each ticket belongs to one user and one giveaway).
- `giveaway_contributions`: donations to a giveaway (user → giveaway → amount).
- `user_wallets`: a user’s wallet (balance, currency, created_at).
- `deposit_transactions`: deposit history (amount, status, created_at).
- `withdrawal_requests`: withdrawal requests (amount, status, created_at).
- `roles` and `user_roles`: who is an admin.
- `onagui_profiles`: profile info (may include `is_admin`).
- `giveaway_audit`: every publish/unpublish change with actor and notes.

## What Users Can Do (Thanks to RLS)

- Users: can only see and change their own tickets, wallets, deposits, and withdrawals.
- Admins: can update giveaway status and review more data.
- Public: can read only active giveaways.

## Main Endpoints (Examples)

- Public/User:
  - `GET /api/giveaways` → browse giveaways
  - Wallet routes like `GET /api/wallet/balance`, `POST /api/wallet/withdraw`
- Admin:
  - `POST /api/admin/giveaways/status` → publish/unpublish or set status

## Why It’s Safe

- RLS blocks unauthorized access at the database level (strong protection).
- Zod validation prevents malformed requests (e.g., invalid status values).
- Audit trails track important admin actions.

## Glossary

- RLS (Row Level Security): rules inside the database that decide which rows each user can read or change.
- Admin: a special role with extra permissions to manage giveaways.
- Token (JWT): proof of identity, used by the server and database rules.