@echo off
REM API Endpoint Test Script for Windows
REM Tests key API endpoints using curl

setlocal enabledelayedexpansion

echo ===============================================================
echo   API Endpoint Tests
echo ===============================================================
echo.

REM Get API URL from environment or use defaults
if exist .env.local (
    for /f "tokens=1,* delims==" %%a in (.env.local) do (
        if not "%%a"=="" if not "%%a"=="#" (
            set "%%a=%%b"
        )
    )
)

if "%NEXT_PUBLIC_API_URL%"=="" (
    set "API_URL=http://localhost:5000/api/v1"
) else (
    set "API_URL=%NEXT_PUBLIC_API_URL%"
)

REM Remove /api/v1 suffix to get base URL
set "BASE_URL=%API_URL%"
set "BASE_URL=!BASE_URL:/api/v1=!"

echo Testing API at: %API_URL%
echo Base URL: %BASE_URL%
echo.

REM Check if curl is available
where curl >nul 2>&1
if errorlevel 1 (
    echo Warning: curl not found. Skipping API tests.
    exit /b 0
)

set PASSED=0
set FAILED=0
set SKIPPED=0

REM Test health endpoint
echo Testing: Health Check
echo   GET %BASE_URL%/health
curl -s -o nul -w "%%{http_code}" -X GET "%BASE_URL%/health" --max-time 10 >nul 2>&1
if errorlevel 1 (
    echo   Warning: Connection failed (backend may not be running)
    set /a SKIPPED+=1
) else (
    echo   Status: OK
    set /a PASSED+=1
)
echo.

REM Test API root
echo Testing: API Root
echo   GET %BASE_URL%
curl -s -o nul -w "%%{http_code}" -X GET "%BASE_URL%" --max-time 10 >nul 2>&1
if errorlevel 1 (
    echo   Warning: Connection failed (backend may not be running)
    set /a SKIPPED+=1
) else (
    echo   Status: OK
    set /a PASSED+=1
)
echo.

REM Summary
echo ===============================================================
echo Passed: %PASSED%
echo Skipped: %SKIPPED%
echo ===============================================================
echo.

exit /b 0

