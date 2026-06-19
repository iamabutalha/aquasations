param()

$ErrorActionPreference = "Stop"

Write-Host "Starting Aquasations in production mode"
Write-Host "======================================="

if (-not (Test-Path -Path ".env.production" -PathType Leaf)) {
    Write-Error "Error: .env.production file not found. Create it with your production environment variables."
    exit 1
}

try {
    docker info *> $null
} catch {
    Write-Error "Error: Docker is not running. Start Docker and try again."
    exit 1
}

Write-Host "Building and starting production container..."
Write-Host "Using Neon Cloud Database from .env.production"
Write-Host ""

docker compose -f docker-compose.prod.yml up --build -d

Write-Host "Applying latest schema with Drizzle..."
docker compose -f docker-compose.prod.yml run --rm app npm run db:migrate

Write-Host ""
Write-Host "Production environment started."
Write-Host "Application: http://localhost:3000"
Write-Host "Logs: docker logs -f acquisition-app-prod"
Write-Host ""
Write-Host "Useful commands:"
Write-Host "View logs: docker logs -f acquisition-app-prod"
Write-Host "Stop app: docker compose -f docker-compose.prod.yml down"
