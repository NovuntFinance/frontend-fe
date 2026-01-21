export type ShouldRequire2FAInput = {
  method?: string;
  url?: string;
  is2FAVerified?: boolean;
};

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Per requirements:
// - Always require 2FA for write operations
// - Always require 2FA for sensitive GET endpoints
// - Never require (or pre-fetch) 2FA for normal GET navigation pages
const SENSITIVE_GET_EXACT_OR_PREFIX = [
  // Backend examples (frontend usually calls these as /admin/*)
  '/api/v1/admin/activity-logs',
  '/api/v1/admin/flagged-activities',
  '/api/v1/admin/security/monitoring',
  '/api/v1/admin/security/user/',
  // Frontend/axios relative paths
  '/admin/activity-logs',
  '/admin/flagged-activities',
  '/admin/security/monitoring',
  '/admin/security/user/',
  // Transactions export (sensitive GET)
  '/api/v1/admin/transactions/export',
  '/admin/transactions/export',
];

export function normalizeRequestUrl(url?: string): string {
  if (!url) return '';
  // Strip query/hash if present
  const noHash = url.split('#')[0] ?? url;
  const noQuery = noHash.split('?')[0] ?? noHash;
  return noQuery.trim();
}

export function isSensitive2FAGetUrl(url?: string): boolean {
  const u = normalizeRequestUrl(url).toLowerCase();
  if (!u) return false;

  // Explicit matches/prefixes
  for (const pattern of SENSITIVE_GET_EXACT_OR_PREFIX) {
    const p = pattern.toLowerCase();
    if (p.endsWith('/')) {
      if (u.startsWith(p)) return true;
    } else if (u === p) {
      return true;
    }
  }

  // Broad matches (per instruction: any path containing /security or /activity)
  if (u.includes('/security')) return true;
  if (u.includes('/activity')) return true;

  return false;
}

export function shouldRequire2FA(input: ShouldRequire2FAInput): boolean {
  const method = (input.method || '').toUpperCase();
  const url = normalizeRequestUrl(input.url);

  // Always require 2FA for write operations
  if (WRITE_METHODS.has(method)) return true;

  // GET requests:
  // - Require 2FA only for sensitive endpoints
  // - Otherwise never require 2FA (especially when token says is2FAVerified=true)
  if (method === 'GET') {
    if (isSensitive2FAGetUrl(url)) return true;
    return false;
  }

  // Default: do not require 2FA for unknown/other methods
  return false;
}

function safeBase64Decode(b64: string): string {
  // Browser
  if (
    typeof globalThis !== 'undefined' &&
    typeof (globalThis as any).atob === 'function'
  ) {
    return (globalThis as any).atob(b64);
  }

  // Node (SSR)
  const NodeBuffer = (globalThis as any).Buffer as
    | {
        from: (
          input: string,
          encoding: string
        ) => { toString: (enc: string) => string };
      }
    | undefined;
  if (NodeBuffer) {
    return NodeBuffer.from(b64, 'base64').toString('utf8');
  }

  throw new Error('No base64 decoder available in this runtime');
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  // JWT uses base64url encoding
  const b64Url = parts[1] ?? '';
  const b64 = b64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');

  try {
    const json = safeBase64Decode(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getIs2FAVerifiedFromToken(token?: string | null): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  return payload?.is2FAVerified === true;
}
