/**
 * Normalize the backend API base URL.
 *
 * Backend contract expects routes under `/api/v1/...`.
 * Frontend env (`NEXT_PUBLIC_API_URL`) may be:
 * - `http://localhost:5000`
 * - `http://localhost:5000/api/v1`
 * - `https://example.com`
 * - `https://example.com/api/v1/`
 *
 * We normalize to a base that ends with `/api/v1`.
 */
export function getApiV1BaseUrl(): string {
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  const fallback =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000'
      : 'https://novunt-backend-uw3z.onrender.com';

  const raw = (envURL || fallback).trim();

  // Remove trailing slashes
  const withoutTrailing = raw.replace(/\/+$/, '');

  // If it already ends with /api/v1, use it
  if (withoutTrailing.toLowerCase().endsWith('/api/v1')) {
    return withoutTrailing;
  }

  // If envURL already contains /api/v1 somewhere else, do NOT try to be clever;
  // just assume caller provided a root and append /api/v1.
  return `${withoutTrailing}/api/v1`;
}
