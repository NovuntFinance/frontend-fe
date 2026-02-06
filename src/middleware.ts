import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/admin', '/profile', '/settings'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/signup', '/auth/register', '/register'];

// Admin-only routes
const adminRoutes = ['/admin'];

// Admin login route (should be accessible without admin role)
const adminLoginRoute = '/admin/login';

/**
 * Decode JWT token to check expiry (basic check, no signature verification)
 * This is safe because signature verification happens on the backend
 */
function isTokenExpired(token: string): boolean {
  try {
    // Validate token format (should have 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error(
        '[Middleware] Invalid JWT format - expected 3 parts, got:',
        parts.length
      );
      return true;
    }

    // Decode payload
    const payload = JSON.parse(atob(parts[1]));

    // Check if exp field exists
    if (!payload.exp) {
      console.error('[Middleware] JWT payload missing exp field');
      return true;
    }

    const expiry = payload.exp * 1000; // Convert to milliseconds
    const isExpired = Date.now() >= expiry;

    if (isExpired) {
      console.log(
        '[Middleware] Token expired at:',
        new Date(expiry).toISOString()
      );
    }

    return isExpired;
  } catch (error) {
    console.error('[Middleware] Error decoding JWT:', error);
    return true; // If we can't decode, assume expired
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get('authToken')?.value;

  // Minimal logging (no token data)

  // Check if the route matches any category
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  // Match exact auth routes or routes that start with the auth route (e.g., /signup/verify)
  const isAuthRoute = authRoutes.some((route) => {
    if (pathname === route) return true;
    // Allow sub-routes like /signup/verify, /login/reset, etc.
    if (pathname.startsWith(route + '/')) return true;
    return false;
  });
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Allow API routes, Next.js internals, and static files to pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/workbox') ||
    pathname.startsWith('/manifest.json') ||
    (pathname.includes('.') && !pathname.endsWith('.html')) // Files with extensions (except HTML)
  ) {
    return NextResponse.next();
  }

  // Allow admin login page to be accessible without admin role check
  if (pathname === adminLoginRoute) {
    return NextResponse.next();
  }

  // If accessing a protected route
  if (isProtectedRoute || isAdminRoute) {
    // Admin routes: Let the admin layout handle authentication
    // It checks localStorage for adminToken, which middleware can't access
    if (isAdminRoute) {
      // Allow access - admin layout will handle auth check
      return NextResponse.next();
    }

    // Regular protected routes (dashboard, profile, etc.)
    // No token - redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }

    // Token expired - redirect to login
    if (isTokenExpired(token)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'session_expired');

      // Clear the expired token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('authToken');
      response.cookies.delete('refreshToken');

      return response;
    }

    // Token valid - allow access
    return NextResponse.next();
  }

  // If accessing an auth route (login/signup) with a valid token
  if (isAuthRoute && token && !isTokenExpired(token)) {
    // Allow access if explicitly requested (e.g., ?allow=true for testing or creating additional accounts)
    const allowAccess = request.nextUrl.searchParams.get('allow') === 'true';
    if (allowAccess) {
      return NextResponse.next();
    }

    // Check if there's a redirect parameter
    const redirectTo = request.nextUrl.searchParams.get('redirect');
    if (redirectTo && redirectTo.startsWith('/')) {
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    // Default redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to public routes
  return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Images and fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|otf)$).*)',
  ],
};
