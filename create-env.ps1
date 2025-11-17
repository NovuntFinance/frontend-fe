# PowerShell script to create .env.local file for Novunt Frontend
# Run this script: .\create-env.ps1

Write-Host "Creating .env.local file..." -ForegroundColor Cyan

$envContent = @"
# Novunt Frontend Environment Configuration
# Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Backend API URL (Production - Custom Domain)
NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1

# Disable proxy (BetterAuth handles CORS)
NEXT_PUBLIC_USE_PROXY=false

# Optional: Enable debug mode (development only)
# NEXT_PUBLIC_DEBUG=true
"@

# Create the file in the current directory
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline

if (Test-Path ".env.local") {
    Write-Host "✅ SUCCESS! .env.local file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "File contents:" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
    Get-Content ".env.local"
    Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Next step: Restart your dev server" -ForegroundColor Cyan
    Write-Host "  pnpm dev" -ForegroundColor White
} else {
    Write-Host "❌ ERROR: Failed to create .env.local file" -ForegroundColor Red
    Write-Host "Please create it manually" -ForegroundColor Yellow
}

