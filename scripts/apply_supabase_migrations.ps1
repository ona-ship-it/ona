Param(
  [string]$ProjectRef = 'obgjsswksaotyyzydkkn'
)

Write-Host "== Supabase CLI Migration Push ==" -ForegroundColor Cyan

if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
  Write-Error "npx is not available. Ensure Node.js and npm are installed."; exit 1
}

if (-not (Test-Path '.env.local')) {
  Write-Warning ".env.local not found; continuing with ProjectRef param"
} else {
  Write-Host "Reading .env.local for context..."
  $envLines = Get-Content '.env.local'
  $urlLine = ($envLines | Where-Object { $_ -match '^NEXT_PUBLIC_SUPABASE_URL=' })
  if ($urlLine) {
    $url = $urlLine.Split('=')[1]
    $host = ($url -replace '^https?://','' -replace '/$','')
    $ref = $host.Split('.')[0]
    if ($ref) { $ProjectRef = $ref }
    Write-Host "Detected project ref: $ProjectRef"
  }
}

if (-not $env:SUPABASE_ACCESS_TOKEN) {
  Write-Warning "SUPABASE_ACCESS_TOKEN is not set."
  Write-Host "Create a personal access token in Supabase Dashboard (Account Settings > Access Tokens)." -ForegroundColor Yellow
  Write-Host "Then run: `$env:SUPABASE_ACCESS_TOKEN = 'YOUR_TOKEN'` and re-run this script." -ForegroundColor Yellow
  exit 1
}

Write-Host "Ensuring @supabase/cli is available via npx..."
try {
  npx supabase --version
} catch {
  Write-Host "Installing @supabase/cli locally..." -ForegroundColor Cyan
  npm install -D @supabase/cli
}

Write-Host "Linking to project $ProjectRef..." -ForegroundColor Cyan
npx supabase link --project-ref $ProjectRef
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to link project."; exit 1 }

Write-Host "Pushing migrations from supabase/migrations..." -ForegroundColor Cyan
npx supabase db push
if ($LASTEXITCODE -ne 0) { Write-Error "Migration push failed."; exit 1 }

Write-Host "✅ Migrations pushed successfully." -ForegroundColor Green