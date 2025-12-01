import axios from 'axios';
import { adminAuthService } from './adminAuthService';

// TEMPORARY FIX: Backend routes don't include /v1 prefix
// TODO: Remove this when backend updates routes to /api/v1/analytics and /api/v1/admin
const ROS_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://novunt-backend-uw3z.onrender.com');

// For user endpoints (daily earnings, weekly summary)
const getUserAuthHeader = () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// For admin endpoints (calendar management)
const getAdminAuthHeader = (): Record<string, string> => {
  const token = adminAuthService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Types
export type TimeRange = '7D' | '30D' | 'ALL';

export interface DailyEarning {
  date: string;
  amount: number;
  ros: number;
}

export interface DailyEarningsData {
  dailyData: DailyEarning[];
  summary: {
    totalEarnings: number;
    averageRos: number;
    bestDay: {
      date: string;
      amount: number;
    };
  };
}

export interface WeeklySummaryData {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  totalEarnings: number;
  averageRos: number;
  status: 'pending' | 'completed';
  dailyBreakdown: {
    date: string;
    dayOfWeek: string;
    ros: number;
    earnings: number;
  }[];
}

export interface CalendarEntry {
  _id: string;
  weekStartDate: string;
  weekEndDate: string;
  weekNumber: number;
  year: number;
  status: 'active' | 'completed' | 'upcoming';
  totalWeeklyPercentage: number;
  targetWeeklyPercentage?: number;
  dailyPercentages: {
    sunday: number;
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
  };
  isActive: boolean;
  isRandomized: boolean;
  createdAt: string;
}

export interface CreateCalendarRequest {
  weekStartDate: string;
  targetWeeklyPercentage?: number;
  dailyPercentages?: Record<string, number>;
  description?: string;
}

export const rosApi = {
  // User Endpoints - TEMPORARY: Using /api/analytics instead of /api/v1/analytics
  getDailyEarnings: async (
    timeRange: TimeRange
  ): Promise<DailyEarningsData> => {
    try {
      const response = await axios.get(
        `${ROS_BASE_URL}/api/analytics/daily-earnings`,
        {
          params: { timeRange },
          headers: getUserAuthHeader(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      // Handle 404 gracefully - endpoint may not be implemented yet
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Return empty data structure instead of throwing
        return {
          dailyData: [],
          summary: {
            totalEarnings: 0,
            averageRos: 0,
            bestDay: {
              date: new Date().toISOString(),
              amount: 0,
            },
          },
        };
      }
      throw error;
    }
  },

  getWeeklySummary: async (): Promise<WeeklySummaryData> => {
    try {
      const response = await axios.get(
        `${ROS_BASE_URL}/api/analytics/weekly-summary`,
        {
          headers: getUserAuthHeader(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      // Handle 404 gracefully - endpoint may not be implemented yet
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Return empty data structure instead of throwing
        // Note: Backend uses Monday-Sunday weeks (not Sunday-Saturday)
        const now = new Date();
        const weekStart = new Date(now);
        // Calculate days since Monday (Monday = 0, Sunday = 6)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based (0-6)
        weekStart.setDate(now.getDate() - daysSinceMonday);
        weekStart.setHours(0, 0, 0, 0); // Start of Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6); // End of Sunday
        weekEnd.setHours(23, 59, 59, 999); // End of Sunday

        // Calculate week number
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(
          (now.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
        );

        return {
          weekNumber,
          year: now.getFullYear(),
          startDate: weekStart.toISOString(),
          endDate: weekEnd.toISOString(),
          totalEarnings: 0,
          averageRos: 0,
          status: 'pending' as const,
          dailyBreakdown: [],
        };
      }
      throw error;
    }
  },

  // Admin Endpoints - Try both /api/v1 and /api paths
  getAllCalendars: async (): Promise<CalendarEntry[]> => {
    const endpoints = [
      `${ROS_BASE_URL}/api/v1/admin/ros-calendar`,
      `${ROS_BASE_URL}/api/admin/ros-calendar`,
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(endpoint, {
          headers: getAdminAuthHeader(),
          withCredentials: true,
        });
        return response.data.data || [];
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // If it's not a 404, throw immediately
          if (error.response?.status !== 404) {
            throw error;
          }
          // If it's a 404 and this is the last endpoint, handle gracefully
          if (endpoint === endpoints[endpoints.length - 1]) {
            console.warn(
              '[rosApi] getAllCalendars endpoint not found (404) - returning empty array'
            );
            return [];
          }
          // Otherwise try next endpoint
          continue;
        }
        throw error;
      }
    }
    return [];
  },

  getCurrentCalendar: async (
    twoFACode?: string
  ): Promise<CalendarEntry | null> => {
    const endpoints = [
      `${ROS_BASE_URL}/api/v1/admin/ros-calendar/current`,
      `${ROS_BASE_URL}/api/admin/ros-calendar/current`,
    ];

    for (const endpoint of endpoints) {
      try {
        // For GET requests, we can't use body, so try query parameter if 2FA code is provided
        // Note: Backend might need to support this, or we may need to handle 2FA at a higher level
        const config: any = {
          headers: getAdminAuthHeader(),
          withCredentials: true,
        };

        // Try query parameter approach (GET requests can't have body)
        // If backend doesn't support this, it will return 2FA required error which we'll handle gracefully
        if (twoFACode) {
          config.params = { twoFACode };
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[rosApi] getCurrentCalendar with 2FA code (query param):',
              {
                endpoint,
                hasTwoFACode: true,
              }
            );
          }
        }

        const response = await axios.get(endpoint, config);
        return response.data.data || null;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          // Enhanced logging for errors
          if (process.env.NODE_ENV === 'development') {
            console.error('[rosApi] getCurrentCalendar error:');
            console.error('  - Endpoint:', endpoint);
            console.error('  - Status:', error.response?.status);
            console.error('  - Message:', error.message);
            if (error.response?.data) {
              console.error(
                '  - Response Data:',
                JSON.stringify(error.response.data, null, 2)
              );
            }
          }

          // Check if it's a 2FA error
          const errorData = error.response?.data;
          const errorCode = errorData?.error?.code;
          const is2FAError =
            errorCode === '2FA_CODE_REQUIRED' ||
            errorCode === '2FA_CODE_INVALID' ||
            errorCode === '2FA_MANDATORY' ||
            (error.response?.status === 400 &&
              errorData?.message?.toLowerCase().includes('2fa'));

          // For 2FA errors, we'll throw to let the component handle it
          // This allows the component to prompt for 2FA and retry
          if (is2FAError) {
            // Preserve the error structure so component can check it
            throw error;
          }

          // Handle other 400 errors (validation errors)
          if (error.response?.status === 400) {
            console.warn(
              '[rosApi] getCurrentCalendar returned 400 (validation error) - returning null'
            );
            return null;
          }

          // If it's not a 404, return null gracefully (don't throw)
          if (error.response?.status !== 404) {
            console.warn(
              '[rosApi] getCurrentCalendar error (status:',
              error.response?.status,
              ') - returning null'
            );
            return null;
          }

          // If it's a 404 and this is the last endpoint, handle gracefully
          if (endpoint === endpoints[endpoints.length - 1]) {
            console.warn(
              '[rosApi] getCurrentCalendar endpoint not found (404) or no current calendar - returning null'
            );
            return null;
          }
          // Otherwise try next endpoint
          continue;
        }
        // For non-axios errors, return null gracefully
        console.warn(
          '[rosApi] getCurrentCalendar unknown error - returning null'
        );
        return null;
      }
    }
    return null;
  },

  getTodayRos: async (): Promise<{ ros: number; date: string } | null> => {
    try {
      const response = await axios.get(
        `${ROS_BASE_URL}/api/admin/ros-calendar/today`,
        {
          headers: getAdminAuthHeader(),
          withCredentials: true,
        }
      );
      return response.data.data;
    } catch (error) {
      // Handle 404 gracefully - endpoint may not be implemented yet
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          '[rosApi] getTodayRos endpoint not found (404) - returning null'
        );
        return null;
      }
      throw error;
    }
  },

  createCalendar: async (
    data: CreateCalendarRequest,
    twoFACode?: string
  ): Promise<CalendarEntry> => {
    // Try both endpoint paths in case backend uses /api/v1 prefix
    const endpoints = [
      `${ROS_BASE_URL}/api/v1/admin/ros-calendar`, // Try /api/v1 path first
      `${ROS_BASE_URL}/api/admin/ros-calendar`, // Fallback to /api path
    ];

    let lastError: any = null;

    for (const endpoint of endpoints) {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[rosApi] Attempting to create calendar at:', endpoint);
          console.log('[rosApi] Payload:', data);
        }

        const headers = getAdminAuthHeader();
        // NOTE: We're NOT adding X-2FA-Code header because CORS doesn't allow it
        // The backend accepts twoFACode in the request body, which bypasses CORS restrictions
        const requestData = twoFACode ? { ...data, twoFACode } : data;

        if (twoFACode && process.env.NODE_ENV === 'development') {
          console.log(
            '[rosApi] Adding 2FA code to request body (header skipped due to CORS):',
            {
              endpoint,
              hasBody: true,
              twoFACodeValue: twoFACode,
            }
          );
        }

        // Verify the data is correct before sending
        if (twoFACode && process.env.NODE_ENV === 'development') {
          console.log('[rosApi] Verifying request data includes 2FA code:', {
            originalData: data,
            requestData,
            hasTwoFACode: !!(requestData as any).twoFACode,
            twoFACodeValue: (requestData as any).twoFACode,
          });
        }

        if (process.env.NODE_ENV === 'development' && twoFACode) {
          console.log('[rosApi] Request with 2FA code:', {
            endpoint,
            headers: {
              ...headers,
              Authorization: headers.Authorization ? 'Bearer ***' : undefined,
            },
            payload: requestData,
          });
        }

        // Ensure 2FA code is in the body if provided
        // We use body instead of header to avoid CORS preflight issues
        const finalRequestData: any = { ...requestData };
        if (twoFACode && !finalRequestData.twoFACode) {
          finalRequestData.twoFACode = twoFACode;
          if (process.env.NODE_ENV === 'development') {
            console.log('[rosApi] Added 2FA code to request body:', {
              twoFACode,
              requestDataKeys: Object.keys(finalRequestData),
            });
          }
        }

        console.log('[rosApi] About to make POST request to:', endpoint);
        console.log('[rosApi] Request config:', {
          hasAuthHeader: !!headers.Authorization,
          has2FABody: !!finalRequestData.twoFACode,
          timeout: 30000,
          note: 'Using body for 2FA code (CORS-safe)',
        });
        console.log(
          '[rosApi] Full headers object:',
          JSON.stringify(headers, null, 2)
        );
        console.log(
          '[rosApi] Full request body:',
          JSON.stringify(finalRequestData, null, 2)
        );

        // Log final request data before sending
        if (process.env.NODE_ENV === 'development') {
          console.log('[rosApi] Final request being sent:', {
            endpoint,
            headers: Object.keys(headers),
            bodyKeys: Object.keys(finalRequestData),
            hasTwoFACode: !!finalRequestData.twoFACode,
            twoFACodeInBody: finalRequestData.twoFACode || 'NOT INCLUDED',
          });
        }

        let response;
        try {
          response = await axios.post(endpoint, finalRequestData, {
            headers,
            withCredentials: true,
            timeout: 30000, // 30 second timeout
          });
        } catch (requestError: any) {
          // Immediately log the error before any processing
          console.error('[rosApi] 🚨 IMMEDIATE ERROR in axios.post');
          console.error('[rosApi] Error details:', {
            isAxiosError: axios.isAxiosError(requestError),
            hasResponse: !!requestError?.response,
            status: requestError?.response?.status,
            statusText: requestError?.response?.statusText,
            data: requestError?.response?.data,
            message: requestError?.message,
            code: requestError?.code,
          });
          // Re-throw to be caught by outer catch
          throw requestError;
        }

        console.log('[rosApi] ✅ Request completed successfully!');
        console.log('[rosApi] Response received:', {
          status: response.status,
          statusText: response.statusText,
          hasData: !!response.data,
        });

        if (process.env.NODE_ENV === 'development') {
          console.log('[rosApi] Calendar created successfully at:', endpoint);
          console.log('[rosApi] Response status:', response.status);
          console.log('[rosApi] Response data:', response.data);
        }

        // Handle both response formats:
        // 1. { success: true, data: { ... } }
        // 2. { ... } (direct calendar object)
        if (response.data?.data) {
          return response.data.data;
        }
        return response.data;
      } catch (error) {
        console.error('[rosApi] ⚠️ ERROR CAUGHT in createCalendar catch block');
        console.error('[rosApi] Error type:', typeof error);
        console.error('[rosApi] Error constructor:', error?.constructor?.name);

        lastError = error;

        // Enhanced error logging - ALWAYS log errors
        if (process.env.NODE_ENV === 'development' || true) {
          if (axios.isAxiosError(error)) {
            // Extract error details in a way that can be logged
            const errorDetails: any = {
              endpoint,
              message: error.message,
              code: error.code,
              hasResponse: !!error.response,
              requestUrl: error.config?.url,
              requestMethod: error.config?.method,
            };

            if (error.response) {
              errorDetails.status = error.response.status;
              errorDetails.statusText = error.response.statusText;

              // Try to extract response data safely
              try {
                if (error.response.data) {
                  if (typeof error.response.data === 'string') {
                    errorDetails.responseData = error.response.data;
                  } else {
                    errorDetails.responseData = JSON.stringify(
                      error.response.data,
                      null,
                      2
                    );
                    // Also log the raw data for inspection
                    errorDetails.responseDataRaw = error.response.data;
                  }
                }
              } catch {
                errorDetails.responseDataError =
                  'Could not serialize response data';
              }
            }

            // Log each property separately to avoid serialization issues
            console.error('[rosApi] Error creating calendar:');
            console.error('  - Endpoint:', errorDetails.endpoint);
            console.error('  - Message:', errorDetails.message);
            console.error('  - Code:', errorDetails.code);
            console.error('  - Has Response:', errorDetails.hasResponse);
            if (errorDetails.status) {
              console.error('  - Status:', errorDetails.status);
              console.error('  - Status Text:', errorDetails.statusText);
            }

            // ALWAYS try to log response data - this is critical!
            if (error.response?.data) {
              console.error('  - 🚨 BACKEND RESPONSE DATA (direct access):');
              try {
                const respData = error.response.data;
                console.error('    Type:', typeof respData);
                console.error('    Raw:', respData);
                if (typeof respData === 'string') {
                  console.error('    String content:', respData);
                } else if (typeof respData === 'object') {
                  console.error('    JSON:', JSON.stringify(respData, null, 2));
                  console.error('    Keys:', Object.keys(respData));
                  if (respData.message)
                    console.error('    Message:', respData.message);
                  if (respData.error) {
                    console.error('    Error object:', respData.error);
                    if (respData.error.code)
                      console.error('    Error Code:', respData.error.code);
                    if (respData.error.message)
                      console.error(
                        '    Error Message:',
                        respData.error.message
                      );
                  }
                }
              } catch {
                console.error('    Could not parse response data');
              }
            }

            if (errorDetails.responseData) {
              console.error(
                '  - Response Data (stringified):',
                errorDetails.responseData
              );
            }
            if (errorDetails.responseDataRaw) {
              console.error(
                '  - Response Data (Raw):',
                errorDetails.responseDataRaw
              );
            }

            // Also log the actual headers sent
            console.error('  - Request Headers Sent:', error.config?.headers);
            console.error('  - Request Body Sent:', error.config?.data);
          } else {
            console.error(
              '[rosApi] Error creating calendar (non-axios):',
              String(error)
            );
          }
        }

        if (axios.isAxiosError(error)) {
          // Network error (no response) - don't try other endpoints
          if (!error.response) {
            console.error('[rosApi] Network error (no response):');
            console.error('  - Message:', error.message);
            console.error('  - Code:', error.code);
            console.error('  - Endpoint:', endpoint);
            console.error('  - Request URL:', error.config?.url);
            // Don't try other endpoints on network errors
            break;
          }

          // Log response errors for debugging
          if (process.env.NODE_ENV === 'development') {
            const responseDetails: any = {
              status: error.response.status,
              statusText: error.response.statusText,
            };

            try {
              if (error.response.data) {
                if (typeof error.response.data === 'string') {
                  responseDetails.data = error.response.data;
                } else {
                  responseDetails.data = JSON.stringify(
                    error.response.data,
                    null,
                    2
                  );
                  responseDetails.dataRaw = error.response.data;
                }
              } else {
                responseDetails.data = 'No data';
              }
            } catch {
              responseDetails.dataError = 'Could not serialize response data';
            }

            // Log each property separately to avoid serialization issues
            console.error('[rosApi] Response error:');
            console.error('  - Status:', responseDetails.status);
            console.error('  - Status Text:', responseDetails.statusText);
            if (responseDetails.data) {
              console.error('  - Data:', responseDetails.data);
            }
            if (responseDetails.dataRaw) {
              console.error('  - Data (Raw):', responseDetails.dataRaw);
            }
          }

          // If it's not a 404, don't try the other endpoint
          if (error.response?.status !== 404) {
            break;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[rosApi] Endpoint ${endpoint} returned 404, trying next endpoint...`
            );
          }
        }
      }
    }

    // If we get here, all endpoints failed
    if (axios.isAxiosError(lastError)) {
      // Check for 2FA errors FIRST - before checking for network errors
      // This is because the response might contain 2FA error messages even if it looks like a network error
      const responseMessage =
        lastError.response?.data?.message ||
        lastError.response?.data?.error?.message ||
        '';
      const errorCode = lastError.response?.data?.error?.code;
      const is2FAError =
        errorCode === '2FA_CODE_REQUIRED' ||
        errorCode === '2FA_CODE_INVALID' ||
        errorCode === '2FA_MANDATORY' ||
        (responseMessage &&
          (responseMessage.toLowerCase().includes('2fa') ||
            responseMessage.toLowerCase().includes('two-factor') ||
            responseMessage.toLowerCase().includes('two factor')));

      // If it's a 2FA error or 400/403/401, preserve the full error structure
      // 400 can also indicate 2FA required (Bad Request with 2FA error code)
      const statusCode = lastError.response?.status;
      if (
        is2FAError ||
        statusCode === 400 ||
        statusCode === 403 ||
        statusCode === 401
      ) {
        // Don't wrap the error - preserve it so components can check error codes and messages
        throw lastError;
      }

      // Network error (no response) - could be CORS, connectivity, or endpoint doesn't exist
      if (!lastError.response) {
        const errorMessage =
          lastError.code === 'ERR_NETWORK' ||
          lastError.message.includes('Network Error')
            ? `Network error: Unable to reach the backend server. Please check your internet connection or if the backend is running. Endpoint: ${lastError.config?.url || 'unknown'}`
            : `Network error: ${lastError.message || 'Unknown network error'}`;

        const error = new Error(errorMessage) as any;
        error.code = lastError.code;
        error.isNetworkError = true;
        throw error;
      }

      // Preserve the original error structure so components can check error codes
      if (lastError.response?.status === 404) {
        const error = new Error(
          'Calendar creation endpoint not found. ' +
            'Tried both /api/v1/admin/ros-calendar and /api/admin/ros-calendar. ' +
            'The backend endpoint may not be implemented yet.'
        ) as any;
        error.response = lastError.response;
        throw error;
      }

      // If there's a response with a message, preserve it
      if (lastError.response?.data?.message) {
        const error = new Error(lastError.response.data.message) as any;
        error.response = lastError.response;
        throw error;
      }
    }

    throw (
      lastError || new Error('Failed to create calendar. Please try again.')
    );
  },
};
