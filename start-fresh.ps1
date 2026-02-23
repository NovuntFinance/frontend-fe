# Novunt Frontend - Clean Start Script
Write-Host "🧹 Cleaning up old processes and files..." -ForegroundColor Cyan

# Kill all Node.js processes
Write-Host "Killing Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Remove lock files and dev cache
Write-Host "Removing lock files..." -ForegroundColor Yellow
Remove-Item ".next\dev\lock" -Force -ErrorAction SilentlyContinue
Remove-Item ".next\dev" -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path ".next\dev" -Force | Out-Null

Write-Host "✅ Cleanup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
Write-Host ""

# Start dev server
pnpm run dev
