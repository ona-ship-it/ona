param(
  [switch]$All
)

$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Warning $msg }
function Write-Fail($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$migrationsDir = Join-Path -Path $root -ChildPath 'supabase\migrations'

if (-not (Test-Path $migrationsDir)) {
  Write-Fail "Migrations directory not found: $migrationsDir"
  exit 1
}

# Default: apply the two new migration/validation files we added
$targetFiles = @()
$targetFiles += (Join-Path -Path $migrationsDir -ChildPath '2025-11-09_handle_new_user_trigger_username.sql')
$targetFiles += (Join-Path -Path $migrationsDir -ChildPath '2025-11-09_validate_handle_new_user_setup.sql')

if ($All) {
  Write-Info "Applying all SQL files in $migrationsDir (sorted by name)"
  $targetFiles = Get-ChildItem -Path $migrationsDir -Filter '*.sql' | Sort-Object Name | ForEach-Object { $_.FullName }
}

foreach ($file in $targetFiles) {
  if (-not (Test-Path $file)) {
    Write-Fail "Missing SQL file: $file"
    exit 1
  }
}

function Invoke-SupabaseQuery([string]$sqlFile) {
  Write-Info "Applying via Supabase CLI: $sqlFile"
  # Use npx to ensure the local devDependency 'supabase' is leveraged
  & npx supabase db query -f $sqlFile
  if ($LASTEXITCODE -ne 0) {
    throw "Supabase CLI exited with code $LASTEXITCODE"
  }
}

function Invoke-PsqlFallback([string]$sqlFile) {
  if (-not $env:SUPABASE_DB_URL) {
    throw "SUPABASE_DB_URL is not set; cannot fallback to psql."
  }
  $psql = Get-Command psql -ErrorAction SilentlyContinue
  if (-not $psql) {
    throw "psql not found on PATH; please install psql or link with Supabase CLI."
  }
  Write-Info "Falling back to psql against SUPABASE_DB_URL"
  & psql "$env:SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f $sqlFile
  if ($LASTEXITCODE -ne 0) {
    throw "psql exited with code $LASTEXITCODE"
  }
}

try {
  foreach ($sql in $targetFiles) {
    try {
      Invoke-SupabaseQuery $sql
    } catch {
      Write-Warn "Supabase CLI query failed: $($_.Exception.Message)"
      Write-Warn "Attempting psql fallback if SUPABASE_DB_URL is configured..."
      Invoke-PsqlFallback $sql
    }
  }
  Write-Host "All SQL applied successfully." -ForegroundColor Green
  Write-Host "Tip: If Supabase CLI failed, run: npx supabase login; then npx supabase link --project-ref YOUR_PROJECT_REF" -ForegroundColor DarkGray
} catch {
  Write-Fail $_
  Write-Host "Troubleshooting: ensure you are logged in (npx supabase login) and linked (npx supabase link --project-ref YOUR_PROJECT_REF)." -ForegroundColor Yellow
  exit 1
}