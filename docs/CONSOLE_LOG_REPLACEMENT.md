# Console.log Replacement Guide

This document tracks console.log statements that need to be replaced with the centralized logger.

## Status
- **Total Found**: ~300+ console statements
- **Priority**: Medium (can be done gradually)
- **Recommendation**: Replace during feature work or use ESLint autofix

## Quick Reference

### Import Logger
```typescript
import { apiLogger, authLogger, walletLogger, stakingLogger } from '@/lib/logger';
```

### Replacements
```typescript
// Before
console.log('[API] Request sent');
console.error('[API] Request failed', error);
console.warn('[API] Deprecated endpoint');

// After
apiLogger.info('Request sent');
apiLogger.error('Request failed', error);
apiLogger.warn('Deprecated endpoint');
```

## Files with Most Console Statements
1. `src/store/authStore.ts` - 50+ statements
2. `src/lib/mutations.ts` - 40+ statements
3. `src/lib/queries.ts` - 30+ statements
4. `src/lib/api.ts` - 20+ statements
5. `src/services/*` - 100+ statements

## ESLint Rule
The `.eslintrc.json` already has:
```json
"no-console": ["warn", { "allow": ["warn", "error"] }]
```

This warns about console.log but allows console.warn/error for critical issues.

## Automated Replacement Script (Future)
Could create a codemod to automatically replace:
```bash
# Example using jscodeshift (not implemented yet)
npx jscodeshift -t scripts/replace-console-logs.js src/
```

## Note
Console statements in logger.ts itself are intentional (final output).
Console statements in tests are acceptable.
