/**
 * Sensitive Data Rendering Rules
 * Never display internal IDs, DB identifiers, or raw system data in the UI.
 * Use these helpers for masking. Backend remains source of truth; this is defense in depth.
 */

/** Mask a string so only last N chars show (e.g. ...abc4) */
export function maskTail(
  value: string | null | undefined,
  visibleChars = 4
): string {
  if (value == null || value === '') return '—';
  const s = String(value).trim();
  if (s.length <= visibleChars) return '••••';
  return '…' + s.slice(-visibleChars);
}

/** Mask middle of string (e.g. 123***789) */
export function maskMiddle(
  value: string | null | undefined,
  visibleEnds = 3
): string {
  if (value == null || value === '') return '—';
  const s = String(value).trim();
  if (s.length <= visibleEnds * 2) return '••••';
  return s.slice(0, visibleEnds) + '•••' + s.slice(-visibleEnds);
}

/** Format for display: never show raw internal ID. Prefer short display IDs from API. */
export function formatIdForDisplay(
  internalId: string | null | undefined,
  options?: { prefix?: string; tailChars?: number }
): string {
  if (internalId == null || internalId === '') return '—';
  const tail = options?.tailChars ?? 6;
  const prefix = options?.prefix ?? '';
  return prefix + maskTail(internalId, tail);
}

/** Mask wallet/account numbers for UI (e.g. last 4 only) */
export function maskAccountNumber(value: string | null | undefined): string {
  return maskTail(value, 4);
}

/** Redact token-like strings in logs (never log full tokens). */
export function redactToken(token: string | null | undefined): string {
  if (token == null || token === '') return '[none]';
  if (token.length <= 8) return '***';
  return token.slice(0, 4) + '…' + token.slice(-4);
}
