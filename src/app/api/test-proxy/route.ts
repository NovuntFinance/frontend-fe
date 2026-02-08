/**
 * Test endpoint to verify proxy is working
 * Access at: /api/test-proxy
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Get API base URL from environment (same as main API client)
  const apiBaseURL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:5000/api/v1'
      : 'https://api.novunt.com/api/v1');

  try {
    // Test direct connection to backend
    const response = await fetch(`${apiBaseURL}/better-auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${Date.now()}@example.com`,
        password: 'Test@123456',
        confirmPassword: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
        username: `testuser${Date.now()}`,
      }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Backend connection test',
      backendUrl: apiBaseURL,
      status: response.status,
      response: data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Backend connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
