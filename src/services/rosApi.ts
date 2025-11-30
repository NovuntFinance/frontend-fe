import axios from 'axios';

// TEMPORARY FIX: Backend routes don't include /v1 prefix
// TODO: Remove this when backend updates routes to /api/v1/analytics and /api/v1/admin
const ROS_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ||
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:5000'
    : 'https://novunt-backend-uw3z.onrender.com');

const getAuthHeader = () => {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
          headers: getAuthHeader(),
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
          headers: getAuthHeader(),
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

  // Admin Endpoints - TEMPORARY: Using /api/admin instead of /api/v1/admin
  getAllCalendars: async (): Promise<CalendarEntry[]> => {
    const response = await axios.get(`${ROS_BASE_URL}/api/admin/ros-calendar`, {
      headers: getAuthHeader(),
      withCredentials: true,
    });
    return response.data.data;
  },

  getCurrentCalendar: async (): Promise<CalendarEntry> => {
    const response = await axios.get(
      `${ROS_BASE_URL}/api/admin/ros-calendar/current`,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      }
    );
    return response.data.data;
  },

  getTodayRos: async (): Promise<{ ros: number; date: string }> => {
    const response = await axios.get(
      `${ROS_BASE_URL}/api/admin/ros-calendar/today`,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      }
    );
    return response.data.data;
  },

  createCalendar: async (
    data: CreateCalendarRequest
  ): Promise<CalendarEntry> => {
    const response = await axios.post(
      `${ROS_BASE_URL}/api/admin/ros-calendar`,
      data,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      }
    );
    return response.data.data;
  },
};
