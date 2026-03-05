if (-not $env:DATABASE_URL) {
  Write-Host "Please set the DATABASE_URL environment variable first."
  Write-Host "Example (PowerShell): $env:DATABASE_URL = 'postgres://USER:PASS@HOST:PORT/DB'"
  exit 1
}

Write-Host "Running production migrations against: $env:DATABASE_URL"
pnpm run migrate:prod
Write-Host "Migrations finished."
