# Pre-Push Validation Scripts

This directory contains scripts to validate the codebase before pushing to GitHub.

## Quick Start

Run all validation checks:

```bash
npm run validate
```

Or use the direct script:

```bash
node scripts/pre-push-validation.js
```

## What Gets Checked

The validation script runs the following checks in order:

1. **Environment Check**
   - Verifies `.env.local` exists
   - Checks Node.js and npm versions

2. **TypeScript Type Check**
   - Runs `npm run typecheck`
   - Ensures all TypeScript types are correct
   - No type errors allowed

3. **ESLint Check**
   - Runs `npm run lint`
   - Ensures code follows linting rules
   - Use `npm run lint:fix` to auto-fix issues

4. **Production Build**
   - Runs `npm run build`
   - Ensures the application builds successfully
   - Catches build-time errors

5. **API Endpoint Tests (Optional)**
   - Tests backend API endpoints using curl
   - Skips if backend is not running (non-blocking)
   - Tests health check and root endpoints

## Scripts

### `pre-push-validation.js`

Main validation script that runs all checks sequentially. Exits with code 1 if any critical check fails.

**Usage:**

```bash
node scripts/pre-push-validation.js
```

### `test-api-endpoints.sh` / `test-api-endpoints.bat`

Tests API endpoints using curl. Works on Unix (bash) and Windows (batch).

**Usage:**

```bash
# Unix/Mac
bash scripts/test-api-endpoints.sh

# Windows
scripts\test-api-endpoints.bat
```

## npm Scripts

- `npm run validate` - Run all validation checks
- `npm run validate:pre-push` - Alias for `validate`
- `npm run test:api` - Test API endpoints only (Unix/Mac)

## Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed

## Environment Variables

The scripts use `NEXT_PUBLIC_API_URL` from `.env.local` for API testing. If not set, defaults are:

- Development: `http://localhost:5000/api/v1`
- Production: `https://novunt-backend-uw3z.onrender.com/api/v1`

## Integration with Git Hooks

You can integrate this with Git hooks (e.g., Husky) to run automatically before pushing:

```bash
# In .husky/pre-push
#!/bin/sh
npm run validate
```

## Troubleshooting

### TypeScript Errors

```bash
npm run typecheck
# Fix errors, then run validate again
```

### Linting Errors

```bash
npm run lint:fix  # Auto-fix issues
npm run lint      # Check remaining issues
```

### Build Errors

```bash
npm run build
# Fix build errors, then run validate again
```

### API Tests Skipped

API tests are optional and won't fail the validation if:

- curl is not installed
- Backend server is not running
- Network connectivity issues

This is intentional - you can still push code even if the backend is down.

## Requirements

- Node.js (version checked by script)
- npm (version checked by script)
- curl (optional, for API endpoint testing)
