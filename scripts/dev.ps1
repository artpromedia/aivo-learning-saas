# Load env vars from root .env for all services
$envFile = Join-Path $PSScriptRoot ".env"
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $Matches[1].Trim()
        $value = $Matches[2].Trim()
        # Strip surrounding quotes
        if ($value -match '^"(.*)"$') { $value = $Matches[1] }
        [Environment]::SetEnvironmentVariable($name, $value, 'Process')
    }
}

Write-Host "Loaded environment variables from .env"
Write-Host "DATABASE_URL: $env:DATABASE_URL"
Write-Host "Starting all services with turbo dev..."

pnpm dev
