# GitHub Actions Cron Jobs Setup

## ✅ What We Set Up

Two GitHub Actions workflows that replace Vercel's cron jobs (free!):

1. **Draw Winners** - Runs every hour
2. **Send Emails** - Runs every 15 minutes

## 🔐 Security Setup (IMPORTANT!)

### Step 1: Create a Secret Token

1. Generate a random secret token:
```bash
# Run this in terminal to generate a secure token
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Add Secret to GitHub

1. Go to your GitHub repository: https://github.com/ona-ship-it/ona
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CRON_SECRET`
5. Value: Paste the token you generated
6. Click **Add secret**

### Step 3: Update Your API Routes

Add authentication to your cron API endpoints:

**File: `/src/app/api/cron/draw-winners/route.ts`**
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Verify the request is from GitHub Actions
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your existing cron logic here
  try {
    // Draw winners logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

**File: `/src/app/api/cron/send-emails/route.ts`**
```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Verify the request is from GitHub Actions
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your existing cron logic here
  try {
    // Send emails logic
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### Step 4: Add Environment Variable to Vercel

1. Go to Vercel Dashboard: https://vercel.com/ona-ship-it/ona
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Same token you generated
   - **Environment**: All (Production, Preview, Development)
4. Click **Save**
5. Redeploy your app

## 📅 Cron Schedule Syntax

GitHub Actions uses standard cron syntax:

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

**Examples:**
- `0 * * * *` - Every hour at minute 0
- `*/15 * * * *` - Every 15 minutes
- `0 0 * * *` - Daily at midnight
- `0 9 * * 1` - Every Monday at 9 AM
- `0 */6 * * *` - Every 6 hours

## 🧪 Testing

### Test Manually from GitHub:

1. Go to **Actions** tab in your repository
2. Click on workflow name (e.g., "Draw Winners Cron Job")
3. Click **Run workflow** → **Run workflow**
4. Check the logs to see if it worked

### Test Locally:

```bash
# Test draw-winners endpoint
curl -X POST http://localhost:3000/api/cron/draw-winners \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"

# Test send-emails endpoint
curl -X POST http://localhost:3000/api/cron/send-emails \
  -H "Authorization: Bearer YOUR_SECRET_TOKEN"
```

## 📊 Monitoring

### Check Workflow Runs:

1. Go to **Actions** tab: https://github.com/ona-ship-it/ona/actions
2. See all cron job executions
3. Click on any run to see detailed logs
4. Get email notifications if jobs fail

### Enable Email Notifications:

1. Go to GitHub Settings → Notifications
2. Enable "Actions" notifications
3. You'll get emails when workflows fail

## 🎯 Why GitHub Actions?

✅ **Free** - Unlimited for public repos, 2,000 minutes/month for private
✅ **Reliable** - Runs on GitHub's infrastructure  
✅ **Flexible** - Easy to modify schedules
✅ **Observable** - Built-in logging and monitoring
✅ **Secure** - Uses GitHub Secrets for authentication

## ⚠️ Important Notes

- GitHub Actions can be delayed by up to 10 minutes during high load
- Minimum interval is 5 minutes
- Workflows won't run if repository has no activity for 60 days
- You can always trigger manually from GitHub UI

## 🔄 Updating Schedules

To change the cron schedule, edit the workflow files in `.github/workflows/`:

```yaml
on:
  schedule:
    - cron: '0 */2 * * *'  # Change to every 2 hours
```

Then commit and push the changes.

---

## 🚀 Quick Start Checklist

- [ ] Generate secret token
- [ ] Add `CRON_SECRET` to GitHub Secrets
- [ ] Add `CRON_SECRET` to Vercel Environment Variables
- [ ] Update API routes with authentication
- [ ] Commit and push workflow files
- [ ] Test manually from GitHub Actions tab
- [ ] Monitor first few runs
- [ ] Done! ✨
