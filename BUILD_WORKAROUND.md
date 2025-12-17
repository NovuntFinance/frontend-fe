# Build Workaround Documentation

## Issue

When running `npm run build` in Cursor IDE, you may encounter the following error:

```
TypeError: generate is not a function
```

## Root Cause

Cursor IDE injects certain Next.js private environment variables that interfere with the build process:

- `__NEXT_PRIVATE_STANDALONE_CONFIG`
- `__NEXT_PRIVATE_ORIGIN`
- `NEXT_DEPLOYMENT_ID`
- `__NEXT_PRIVATE_RUNTIME_TYPE`
- `NEXT_OTEL_FETCH_DISABLED`

## Solution

### Option 1: Use the Build Scripts (Recommended)

**Windows:**

```bash
scripts/build.bat
```

**Linux/Mac:**

```bash
bash scripts/build.sh
```

### Option 2: Manual Workaround

**Git Bash / Linux / Mac:**

```bash
unset __NEXT_PRIVATE_STANDALONE_CONFIG __NEXT_PRIVATE_ORIGIN NEXT_DEPLOYMENT_ID __NEXT_PRIVATE_RUNTIME_TYPE NEXT_OTEL_FETCH_DISABLED
npm run build
```

**Windows CMD:**

```cmd
set __NEXT_PRIVATE_STANDALONE_CONFIG=
set __NEXT_PRIVATE_ORIGIN=
set NEXT_DEPLOYMENT_ID=
set __NEXT_PRIVATE_RUNTIME_TYPE=
set NEXT_OTEL_FETCH_DISABLED=
npm run build
```

## Note

This issue only affects local builds in Cursor IDE. Production builds on CI/CD platforms (Vercel, GitHub Actions, etc.) are not affected.
