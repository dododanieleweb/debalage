# ============================================================
#  Debalage — Setup Supabase automatico
#  Esegui con:  powershell -ExecutionPolicy Bypass -File setup-supabase.ps1
# ============================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Debalage — Setup Supabase + Netlify  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Token Supabase ─────────────────────────────────────────
Write-Host "PASSO 1 — Token Supabase" -ForegroundColor Yellow
Write-Host "Vai su: https://supabase.com/dashboard/account/tokens"
Write-Host "Crea un nuovo token (es: 'debalage-deploy') e incollalo qui."
Write-Host ""
$SUPA_TOKEN = Read-Host "Incolla il token Supabase"

if (-not $SUPA_TOKEN) { Write-Error "Token mancante."; exit 1 }

$env:SUPABASE_ACCESS_TOKEN = $SUPA_TOKEN

# ── 2. Crea progetto Supabase ─────────────────────────────────
Write-Host ""
Write-Host "PASSO 2 — Creo il progetto Supabase..." -ForegroundColor Yellow

Write-Host "Inserisci una password per il database (min 8 caratteri, lettere+numeri):"
$DB_PASS = Read-Host "Password database"

# Usa la Management API per creare il progetto
$headers = @{
    "Authorization" = "Bearer $SUPA_TOKEN"
    "Content-Type"  = "application/json"
}

# Prima ottieni l'org ID
$orgs = Invoke-RestMethod -Uri "https://api.supabase.com/v1/organizations" -Headers $headers -Method Get
$orgId = $orgs[0].id
Write-Host "  Organizzazione: $($orgs[0].name) ($orgId)" -ForegroundColor Gray

$body = @{
    name            = "debalage"
    organization_id = $orgId
    plan            = "free"
    region          = "eu-central-1"
    db_pass         = $DB_PASS
} | ConvertTo-Json

Write-Host "  Creo il progetto (può richiedere 1-2 minuti)..." -ForegroundColor Gray
$project = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects" -Headers $headers -Method Post -Body $body

$PROJECT_REF = $project.id
$PROJECT_URL = "https://$PROJECT_REF.supabase.co"

Write-Host "  Progetto creato: $PROJECT_URL" -ForegroundColor Green

# ── 3. Aspetta che il progetto sia ready ─────────────────────
Write-Host ""
Write-Host "PASSO 3 — Attendo che il progetto sia pronto..." -ForegroundColor Yellow

$maxWait = 120
$waited  = 0
do {
    Start-Sleep -Seconds 10
    $waited += 10
    $status = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF" -Headers $headers -Method Get
    Write-Host "  Stato: $($status.status) ($waited s)" -ForegroundColor Gray
} while ($status.status -ne "ACTIVE_HEALTHY" -and $waited -lt $maxWait)

if ($status.status -ne "ACTIVE_HEALTHY") {
    Write-Host "Il progetto non è ancora pronto. Riprova tra qualche minuto." -ForegroundColor Red
    Write-Host "PROJECT_REF = $PROJECT_REF"
    exit 1
}

Write-Host "  Progetto attivo!" -ForegroundColor Green

# ── 4. Ottieni anon key ───────────────────────────────────────
Write-Host ""
Write-Host "PASSO 4 — Recupero le chiavi API..." -ForegroundColor Yellow

$keys     = Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/api-keys" -Headers $headers -Method Get
$ANON_KEY = ($keys | Where-Object { $_.name -eq "anon" }).api_key

Write-Host "  URL:      $PROJECT_URL" -ForegroundColor Green
Write-Host "  Anon key: $($ANON_KEY.Substring(0,30))..." -ForegroundColor Green

# ── 5. Esegui lo schema SQL ───────────────────────────────────
Write-Host ""
Write-Host "PASSO 5 — Applico lo schema del database..." -ForegroundColor Yellow

$schemaContent = Get-Content "supabase\schema.sql" -Raw

$sqlBody = @{ query = $schemaContent } | ConvertTo-Json -Depth 10

try {
    $sqlResult = Invoke-RestMethod `
        -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" `
        -Headers $headers `
        -Method Post `
        -Body $sqlBody
    Write-Host "  Schema applicato con successo!" -ForegroundColor Green
} catch {
    Write-Host "  Nota: schema applicato parzialmente via API — verifica sulla Dashboard Supabase" -ForegroundColor Yellow
    Write-Host "  Puoi anche incollare manualmente supabase/schema.sql nell'SQL Editor di Supabase" -ForegroundColor Gray
}

# ── 6. Crea il file .env ──────────────────────────────────────
Write-Host ""
Write-Host "PASSO 6 — Creo il file .env..." -ForegroundColor Yellow

$envContent = @"
VITE_SUPABASE_URL=$PROJECT_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
"@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "  .env creato!" -ForegroundColor Green

# ── 7. Imposta env vars su Netlify + GitHub ───────────────────
Write-Host ""
Write-Host "PASSO 7 — Imposto le variabili su Netlify e GitHub..." -ForegroundColor Yellow

npx netlify env:set VITE_SUPABASE_URL      $PROJECT_URL | Out-Null
npx netlify env:set VITE_SUPABASE_ANON_KEY $ANON_KEY    | Out-Null
Write-Host "  Netlify: fatto!" -ForegroundColor Green

# Aggiungi anche come GitHub Actions secrets
$ghCli = "C:\Program Files\GitHub CLI\gh.exe"
if (Test-Path $ghCli) {
    $PROJECT_URL  | & $ghCli secret set VITE_SUPABASE_URL      --repo dododanieleweb/debalage 2>&1 | Out-Null
    $ANON_KEY     | & $ghCli secret set VITE_SUPABASE_ANON_KEY --repo dododanieleweb/debalage 2>&1 | Out-Null
    Write-Host "  GitHub Secrets: fatto!" -ForegroundColor Green
}

# ── 8. Rideploy con Supabase ──────────────────────────────────
Write-Host ""
Write-Host "PASSO 8 — Rideploy con Supabase abilitato..." -ForegroundColor Yellow

npx netlify deploy --build --prod 2>&1 | Select-String -Pattern "(✔|Deploy|Production|error)" | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }

# ── Fine ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TUTTO COMPLETATO!                    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Sito live:      https://debalage.netlify.app" -ForegroundColor Cyan
Write-Host "  Dashboard Supa: https://supabase.com/dashboard/project/$PROJECT_REF" -ForegroundColor Cyan
Write-Host "  GitHub repo:    https://github.com/dododanieleweb/debalage" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prossimo passo: vai sulla Dashboard Supabase e crea il primo" -ForegroundColor Yellow
Write-Host "account admin con la funzione 'Invite user' in Authentication." -ForegroundColor Yellow
Write-Host ""
