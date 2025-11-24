# Project Archive

This document consolidates the key architecture, workflows, commands, endpoints, and troubleshooting notes for the Ona/Onagui project running on `localhost:3000`. It captures decisions and milestones so we don’t repeat work.

## Core Principles
- Always run the development server on `port 3000`.
- Use SSR Supabase client to read user sessions via cookies; use Service Role client for admin DB writes (bypass RLS).
- Admin-created giveaways default to `status: 'active'`.

## Architecture Overview
- Framework: Next.js App Router (`src/app/**`).
- Auth: Supabase (SSR cookie-based sessions) + Admin Service Role API for privileged operations.
- DB: Supabase Postgres with RLS; admin operations use Service Role to bypass RLS.
- Storage: Supabase Storage for giveaway images.

## Key Paths and Files
- Admin create giveaway page: `src/app/admin/giveaway/new/page.tsx`.
- Admin create giveaway server action: `src/app/admin/giveaway/new/actions.ts`.
- SSR Supabase client: `src/utils/supabase/server.ts` (reads Next cookies).
- Admin Supabase client: `src/utils/supabase/server-admin.ts`.
- Service Role helper (server-side operations): `src/utils/supabase/server-side-service.ts`.

## Giveaways Schema & Status
- Table definition (migration): `supabase/migrations/20241007_giveaways_tickets.sql`.
  - `status TEXT NOT NULL CHECK (status IN ('draft','active','completed','cancelled'))`.
- Types: `src/types/giveaways.ts` defines `status: 'draft' | 'active' | 'completed' | 'cancelled'`.
- Some admin APIs reference `paused` or `review_pending` in certain migrations; primary app flows use the 4 statuses above.

## Admin Giveaway Creation Flow
1. User visits `http://localhost:3000/admin/giveaway/new`.
2. Client submits form → server action `createGiveaway(formData)` in `src/app/admin/giveaway/new/actions.ts`.
3. Server action authentication:
   - Uses SSR client to read session via cookies: `createClient` from `server.ts` and `auth.getSession()`.
   - Fallback: calls `/api/verify-session` if cookies haven’t propagated.
   - Throws `User not authenticated.` if no user.
4. Admin check:
   - Uses Admin Service Role client: `auth.admin.getUserById(user.id)`.
   - Requires `user_metadata.is_admin`.
5. Insert giveaway (Service Role client to bypass RLS):
   - Fields: `title, description, ticket_price, prize_amount, prize_pool_usdt = prize_amount, ends_at, photo_url, creator_id = user.id, status = 'active', escrow_amount = 0`.
6. On success: `revalidatePath('/giveaways')` and `redirect('/giveaways/<id>')`.

## Image Upload Handling
- Client function hardened to handle non-JSON and HTML responses (auth redirects): `src/app/admin/giveaway/new/page.tsx`.
- Endpoint: `/api/admin/giveaways/upload-image` expects a successful JSON with `publicUrl`.
- Error messages are clearer when content-type is not JSON or indicates auth issues.

## Commands
- Start dev server on port 3000:
  - `npm run dev -- -p 3000`
- Seed/check scripts (examples in root and `ona-production/`):
  - `test-simple-giveaway.mjs`, `test_supabase_connection.mjs`, `check-admin-policies.mjs`.

## Verification Checklist (Port 3000)
- Browser: `http://localhost:3000/admin/giveaway/new` loads without errors.
- Session: `http://localhost:3000/api/verify-session` returns a `user` object.
- Admin status: `http://localhost:3000/api/auth/is-admin` returns `is_admin: true`.
- Image upload: submit an image; network response should be JSON and contain `publicUrl`.
- Create giveaway: submitting the form redirects to `/giveaways/<id>` with `status: 'active'`.

## Troubleshooting
- "User not authenticated." on form submit:
  - Ensure you are signed in on `localhost:3000` (not any other port).
  - Hard refresh the page and retry.
  - Check `Network` tab for redirects to login; make sure cookies are set.
  - Confirm `api/verify-session` returns a user.
- "Failed to post giveaway. Check logs." from server action:
  - Inspect server logs for database errors (constraint violations, missing fields).
  - Validate required fields: `title`, `description`, `ends_at`, `photo_url`.
  - Confirm `status` is one of `draft | active | completed | cancelled`.
  - Ensure admin check passes (`user_metadata.is_admin === true`).
- Image upload errors:
  - If response is HTML, likely an auth redirect; sign in and retry.
  - Confirm the upload endpoint returns JSON with `publicUrl`.

## Milestones Captured
- Server action patched to read SSR cookies and fallback to `/api/verify-session`.
- Image upload handler hardened for non-JSON/redirect responses.
- Consolidated to a single dev instance on `port 3000` as standard.

## Notes
- Supabase policies and migrations are extensive; primary flows operate on active giveaways.
- If you need more endpoints documented, list them and we’ll add them here.