/**
 * API Proxy Route - Bypasses CORS by proxying requests server-side
 * All requests to /api/proxy/* are forwarded to the backend
 */

import { NextRequest, NextResponse } from 'next/server';

// Get the backend URL from environment (same as main API client)
const getBackendURL = (): string => {
  const envURL = process.env.NEXT_PUBLIC_API_URL;
  if (envURL) {
    return envURL.trim();
  }
  // Fallback based on environment
  return process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000/api/v1'
    : 'https://api.novunt.com/api/v1';
};

const BACKEND_URL = getBackendURL();

// Add OPTIONS method for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.VERCEL_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type RouteSegment = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(request: NextRequest, segment: RouteSegment) {
  const params = await segment.params;
  return proxyRequest(request, params);
}

export async function POST(request: NextRequest, segment: RouteSegment) {
  const params = await segment.params;
  return proxyRequest(request, params);
}

export async function PUT(request: NextRequest, segment: RouteSegment) {
  const params = await segment.params;
  return proxyRequest(request, params);
}

export async function DELETE(request: NextRequest, segment: RouteSegment) {
  const params = await segment.params;
  return proxyRequest(request, params);
}

export async function PATCH(request: NextRequest, segment: RouteSegment) {
  const params = await segment.params;
  return proxyRequest(request, params);
}

async function proxyRequest(
  request: NextRequest,
  params: { path: string[] }
): Promise<NextResponse> {
  const pathStr = params.path.join('/');
  const targetUrl = `${BACKEND_URL}/${pathStr}`;
  const timeoutMs = Number(process.env.NEXT_PUBLIC_PROXY_TIMEOUT_MS) || 120000;

  try {
    console.log(`[API Proxy] ${request.method} ${pathStr} → ${targetUrl}`);
    console.log(
      '[API Proxy] Headers:',
      Object.fromEntries(request.headers.entries())
    );

    // Get and validate request body
    let body: string | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
        // Validate JSON before sending
        JSON.parse(body);
        console.log('[API Proxy] Request body:', body);
      } catch (error: unknown) {
        const err = error as Error;
        console.error('[API Proxy] Error parsing request body:', err);
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid JSON in request body',
            error: {
              code: 'INVALID_JSON',
              details: err.message,
            },
          },
          {
            status: 400,
            headers: {
              'Access-Control-Allow-Origin': process.env.VERCEL_URL || '*',
              'Access-Control-Allow-Methods':
                'GET, POST, PUT, DELETE, PATCH, OPTIONS',
              'Access-Control-Allow-Headers':
                'Content-Type, Authorization, Accept',
              'Access-Control-Allow-Credentials': 'true',
            },
          }
        );
      }
    }

    // Forward headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    // Copy original headers, ensuring Authorization is preserved
    request.headers.forEach((value, key) => {
      // Preserve case for Authorization header
      if (key.toLowerCase() === 'authorization') {
        headers['Authorization'] = value;
      } else if (['content-type', 'accept'].includes(key.toLowerCase())) {
        headers[key] = value;
      }
    });

    // Make request to backend with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(
        `[API Proxy] Aborting request after ${timeoutMs}ms: ${request.method} ${pathStr}`
      );
      controller.abort();
    }, timeoutMs);

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
      credentials: 'include',
    });

    clearTimeout(timeoutId);

    // Read response body
    const responseBody = await response.text();
    console.log(
      `[API Proxy] Response ${response.status}:`,
      responseBody.substring(0, 200)
    );

    // Parse response body
    let parsedBody;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = responseBody;
    }

    // Format error responses according to API spec
    if (response.status >= 400) {
      const errorResponse = {
        success: false,
        message: parsedBody.message || 'An error occurred',
        error: {
          code: response.status.toString(),
          details: parsedBody.error || parsedBody,
        },
      };

      return NextResponse.json(errorResponse, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'Access-Control-Allow-Origin': process.env.VERCEL_URL || '*',
          'Access-Control-Allow-Methods':
            'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    // Format successful responses
    const successResponse = {
      success: true,
      data: parsedBody.data || parsedBody,
      message: parsedBody.message,
    };

    // Return response with CORS headers
    return NextResponse.json(successResponse, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Access-Control-Allow-Origin': process.env.VERCEL_URL || '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  } catch (err) {
    const error = err as Error;
    const isAbort = error.name === 'AbortError';

    console.error('[API Proxy] Error:', {
      url: targetUrl,
      method: request.method,
      isAbort,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    const errorResponse = {
      success: false,
      message: isAbort
        ? `Request timed out after ${timeoutMs}ms`
        : 'Internal Server Error',
      error: {
        code: isAbort ? 'TIMEOUT' : 'INTERNAL_ERROR',
        details: error.message,
      },
    };

    return NextResponse.json(errorResponse, {
      status: isAbort ? 504 : 500,
      headers: {
        'Access-Control-Allow-Origin': process.env.VERCEL_URL || '*',
        'Access-Control-Allow-Methods':
          'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Credentials': 'true',
      },
    });
  }
}
