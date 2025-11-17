/**
 * Backend Health Check Utility
 * Tests if the backend server is reachable and responding
 */

import { api } from './api';

export interface HealthCheckResult {
  isHealthy: boolean;
  message: string;
  responseTime?: number;
  statusCode?: number;
  error?: string;
}

/**
 * Check if backend is healthy by making a simple GET request
 */
export async function checkBackendHealth(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  
  try {
    // Get API base URL from environment (same as main API client)
    const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/v1' 
        : 'https://novunt-backend-uw3z.onrender.com/api/v1');
    
    // Try to hit a simple endpoint (health check or root)
    // If backend has a health endpoint, use that, otherwise try root
    const response = await fetch(`${apiBaseURL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: response.ok,
      message: response.ok 
        ? `Backend is healthy (${responseTime}ms)` 
        : `Backend returned ${response.status}`,
      responseTime,
      statusCode: response.status,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    // Check error type
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return {
        isHealthy: false,
        message: 'Backend request timed out (server might be sleeping or slow)',
        responseTime,
        error: 'TIMEOUT',
      };
    }
    
    if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      return {
        isHealthy: false,
        message: 'Cannot reach backend server (might be down or CORS issue)',
        responseTime,
        error: 'NETWORK_ERROR',
      };
    }
    
    return {
      isHealthy: false,
      message: `Backend health check failed: ${error.message || 'Unknown error'}`,
      responseTime,
      error: error.message || 'UNKNOWN',
    };
  }
}

/**
 * Check backend health and log results
 */
export async function diagnoseBackendConnection(): Promise<void> {
  console.log('[Backend Health] Checking backend connection...');
  console.log('[Backend Health] API URL:', process.env.NEXT_PUBLIC_API_URL || 'NOT SET');
  
  const health = await checkBackendHealth();
  
  if (health.isHealthy) {
    console.log(`[Backend Health] ✅ ${health.message}`);
  } else {
    console.error(`[Backend Health] ❌ ${health.message}`);
    if (health.error) {
      console.error('[Backend Health] Error type:', health.error);
    }
    
    // Provide helpful suggestions
    if (health.error === 'NETWORK_ERROR') {
      console.warn('[Backend Health] 💡 Suggestions:');
      console.warn('  1. Check if backend server is running');
      console.warn('  2. If using Render free tier, wait 30-60 seconds (server might be sleeping)');
      console.warn('  3. Check CORS configuration on backend');
      console.warn('  4. Verify NEXT_PUBLIC_API_URL in .env.local');
    }
  }
}

