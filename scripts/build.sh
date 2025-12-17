#!/bin/bash
# Build script that works around Cursor IDE environment variable issues
# This script unsets problematic environment variables before running the build

unset __NEXT_PRIVATE_STANDALONE_CONFIG
unset __NEXT_PRIVATE_ORIGIN
unset NEXT_DEPLOYMENT_ID
unset __NEXT_PRIVATE_RUNTIME_TYPE
unset NEXT_OTEL_FETCH_DISABLED

# Run the build
npm run build

