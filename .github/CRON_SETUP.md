# Cron Deployment Model (Source of Truth)

## Scheduler of Record
Cron scheduling is run by GitHub Actions workflows:

- `.github/workflows/draw-winners-cron.yml` (hourly)
- `.github/workflows/send-emails-cron.yml` (every 15 minutes)

Vercel hosts the API routes. It is not the scheduler.

## Auth Contract (All Cron Callers)
Use one canonical auth format:

- Header: `Authorization: Bearer <CRON_SECRET>`

The routes still accept legacy formats for compatibility:

- `x-cron-secret: <CRON_SECRET>`
- `?secret=<CRON_SECRET>`

Do not use legacy formats in new callers.

## Endpoints Called by Schedulers

- `POST /api/cron/draw-winners`
- `POST /api/cron/send-emails`

Both return non-2xx on auth or processing failures.

## Required Secrets

Set `CRON_SECRET` in both places with the same value:

1. GitHub repository secret: `CRON_SECRET`
2. Vercel environment variable: `CRON_SECRET`

## Verification Checklist

- `draw-winners-cron.yml` uses `Authorization: Bearer ${{ secrets.CRON_SECRET }}`
- `send-emails-cron.yml` uses `Authorization: Bearer ${{ secrets.CRON_SECRET }}`
- API routes reject invalid/empty secret with `401`
- API routes return `500` if `CRON_SECRET` is missing in runtime
- Workflows use `--fail-with-body` and fail the job on endpoint errors
