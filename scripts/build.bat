@echo off
REM Build script that works around Cursor IDE environment variable issues
REM This script unsets problematic environment variables before running the build

set __NEXT_PRIVATE_STANDALONE_CONFIG=
set __NEXT_PRIVATE_ORIGIN=
set NEXT_DEPLOYMENT_ID=
set __NEXT_PRIVATE_RUNTIME_TYPE=
set NEXT_OTEL_FETCH_DISABLED=

REM Run the build
call npm run build

