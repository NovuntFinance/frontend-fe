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
    const response = await axios.get(
      `${ROS_BASE_URL}/api/analytics/daily-earnings`,
      {
        params: { timeRange },
        headers: getAuthHeader(),
        withCredentials: true,
      }
    );
    return response.data.data;
  },

  getWeeklySummary: async (): Promise<WeeklySummaryData> => {
    const response = await axios.get(
      `${ROS_BASE_URL}/api/analytics/weekly-summary`,
      {
        headers: getAuthHeader(),
        withCredentials: true,
      }
    );
    return response.data.data;
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
