@echo off
REM Batch script to create .env.local file for Novunt Frontend
REM Run this script: create-env.bat

echo Creating .env.local file...

(
echo # Novunt Frontend Environment Configuration
echo.
echo # Backend API URL (Production - Custom Domain^)
echo NEXT_PUBLIC_API_URL=https://api.novunt.com/api/v1
echo.
echo # Disable proxy (BetterAuth handles CORS^)
echo NEXT_PUBLIC_USE_PROXY=false
) > .env.local

if exist .env.local (
    echo.
    echo [32mSUCCESS! .env.local file created successfully![0m
    echo.
    echo File contents:
    echo ------------------------------------------------------------
    type .env.local
    echo ------------------------------------------------------------
    echo.
    echo [36mNext step: Restart your dev server[0m
    echo   pnpm dev
) else (
    echo.
    echo [31mERROR: Failed to create .env.local file[0m
    echo Please create it manually
)

pause

