param()

$ErrorActionPreference = "Stop"

Write-Host "Starting Aquasations in development mode"
Write-Host "========================================"

if (-not (Test-Path -Path ".env.development" -PathType Leaf)) {
    Write-Error "Error: .env.development file not found. Copy it from the template and update your Neon credentials."
    exit 1
}

try {
    docker info *> $null
} catch {
    Write-Error "Error: Docker is not running. Start Docker Desktop and try again."
    exit 1
}

if (-not (Test-Path -Path ".neon_local" -PathType Container)) {
    New-Item -ItemType Directory -Path ".neon_local" | Out-Null
}

$gitignorePath = ".gitignore"
$gitignoreEntry = ".neon_local/"
if (-not (Test-Path -Path $gitignorePath -PathType Leaf)) {
    New-Item -ItemType File -Path $gitignorePath | Out-Null
}

$gitignore = Get-Content -Path $gitignorePath -Raw
$gitignorePattern = "(?m)^$([regex]::Escape($gitignoreEntry))$"
if ($gitignore -notmatch $gitignorePattern) {
    Add-Content -Path $gitignorePath -Value $gitignoreEntry
    Write-Host "Added .neon_local/ to .gitignore"
}

Write-Host "Building and starting development services..."
docker compose -f docker-compose.dev.yml up --build -d neon-local

Write-Host "Waiting for the database to be ready..."
$dbReady = $false
for ($attempt = 1; $attempt -le 30; $attempt++) {
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    docker compose -f docker-compose.dev.yml exec -T neon-local pg_isready -h localhost -p 5432 -U neon *> $null
    $probeExitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousErrorActionPreference

    if ($probeExitCode -eq 0) {
        $dbReady = $true
        break
    }

    Start-Sleep -Seconds 2
}

if (-not $dbReady) {
    Write-Error "Error: Database did not become ready in time."
    exit 1
}

Write-Host "Applying latest schema with Drizzle..."
docker compose -f docker-compose.dev.yml run --rm app npm run db:migrate

Write-Host "Starting application container..."
docker compose -f docker-compose.dev.yml up --build app

Write-Host ""
Write-Host "Development environment stopped."
Write-Host "Application: http://localhost:3000"
Write-Host "Database: postgres://neon:npg@localhost:5432/neondb"
Write-Host "To stop all services, run: docker compose -f docker-compose.dev.yml down"
