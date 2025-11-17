'use client';

import { useState, useEffect } from 'react';
import { AnalyticsData, ChartDataPoint } from '@/types/admin';

// Disable static generation
export const dynamic = 'force-dynamic';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'financial' | 'staking' | 'referral'>('users');
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  
  // Mock analytics data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const mockData: AnalyticsData = {
          userAnalytics: {
            registrations: generateChartData(timeframe, 10, 100),
            activeUsers: generateChartData(timeframe, 100, 500),
            retentionRate: 68.5,
          },
          stakingAnalytics: {
            stakesCreated: generateChartData(timeframe, 5, 30),
            stakesCompleted: generateChartData(timeframe, 1, 20),
            averageStakeSize: 3500,
            completionRate: 85.7,
          },
          financialAnalytics: {
            revenue: generateChartData(timeframe, 10000, 50000),
            expenses: generateChartData(timeframe, 5000, 30000),
            profit: generateChartData(timeframe, 3000, 25000),
            profitMargin: 32.6,
          },
          referralAnalytics: {
            referralsByLevel: {
              'Level 1': 245,
              'Level 2': 120,
              'Level 3': 35,
            },
            topReferrers: [
              { userId: 'u001', name: 'John Doe', count: 27, earned: 2350 },
              { userId: 'u002', name: 'Jane Smith', count: 18, earned: 1520 },
              { userId: 'u003', name: 'Robert Johnson', count: 15, earned: 1275 },
              { userId: 'u004', name: 'Emily Davis', count: 12, earned: 980 },
              { userId: 'u005', name: 'Michael Wilson', count: 9, earned: 845 },
            ],
            conversionRate: 42.3,
          },
        };
        
        setAnalyticsData(mockData);
        setIsLoading(false);
      }, 800);
    };
    
    loadData();
  }, [timeframe]);
  
  // Generate mock chart data based on timeframe
  const generateChartData = (timeframe: string, min: number, max: number): ChartDataPoint[] => {
    const dataPoints: ChartDataPoint[] = [];
    let dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    let dataPointCount = 30;
    
    switch (timeframe) {
      case 'week':
        dataPointCount = 7;
        dateFormat = { weekday: 'short' };
        break;
      case 'month':
        dataPointCount = 30;
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case 'quarter':
        dataPointCount = 12;
        dateFormat = { month: 'short', day: 'numeric' };
        break;
      case 'year':
        dataPointCount = 12;
        dateFormat = { month: 'short' };
        break;
    }
    
    const today = new Date();
    
    for (let i = dataPointCount - 1; i >= 0; i--) {
      const date = new Date();
      
      if (timeframe === 'week') {
        date.setDate(today.getDate() - i);
      } else if (timeframe === 'month') {
        date.setDate(today.getDate() - i);
      } else if (timeframe === 'quarter') {
        date.setDate(today.getDate() - i * 7);
      } else if (timeframe === 'year') {
        date.setMonth(today.getMonth() - (11 - i));
      }
      
      const label = date.toLocaleDateString(undefined, dateFormat);
      
      // Generate a somewhat realistic trend with some randomness
      const baseValue = min + (Math.sin(i / (dataPointCount / 2)) + 1) * (max - min) / 2;
      const randomFactor = 0.8 + Math.random() * 0.4; // 80% to 120% of base value
      const value = Math.round(baseValue * randomFactor);
      
      dataPoints.push({
        date: date.toISOString(),
        value,
        label,
      });
    }
    
    return dataPoints;
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Format percentage
  const formatPercentage = (num: number) => {
    return num.toFixed(1) + '%';
  };
  
  // Format currency
  const formatCurrency = (num: number) => {
    return '$' + num.toLocaleString();
  };
  
  // Find the highest value in chart data for scaling
  const getMaxValue = (data: ChartDataPoint[]) => {
    return Math.max(...data.map(point => point.value));
  };
  
  // Calculate percentage change (mock data assumes growth)
  const calculateChange = (data: ChartDataPoint[], isPercentage: boolean = false) => {
    if (!data || data.length < 2) return { value: 0, isPositive: true };
    
    const current = data[data.length - 1].value;
    const previous = data[data.length - 5].value; // Take a point earlier in the dataset
    
    if (previous === 0) return { value: 0, isPositive: true };
    
    const change = ((current - previous) / previous) * 100;
    
    return {
      value: isPercentage ? change : Math.round((change / 100) * previous),
      isPositive: change >= 0
    };
  };

  // Simplified chart component
  const SimpleChart = ({ data, height = 80, color = 'indigo' }: { data: ChartDataPoint[], height?: number, color?: string }) => {
    if (!data || data.length === 0) return <div className="h-20 flex items-center justify-center text-gray-400">No data available</div>;
    
    const maxValue = getMaxValue(data);
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = ((maxValue - point.value) / maxValue) * height;
      
      return `${x},${y}`;
    }).join(' ');
    
    const areaPoints = `0,${height} ${points} ${100},${height}`;
    
    return (
      <div style={{ height: `${height}px` }} className="relative w-full">
        <svg className="w-full h-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
          {/* Area */}
          <polygon
            points={areaPoints}
            className={`fill-${color}-100 dark:fill-${color}-900/20`}
          />
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            className={`stroke-${color}-500 dark:stroke-${color}-400 stroke-2`}
          />
          {/* Data points */}
          {data.map((point, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((maxValue - point.value) / maxValue) * height;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                className={`fill-${color}-600 dark:fill-${color}-400`}
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          {data.length > 10 ? (
            // Show fewer labels when we have many data points
            <>
              <div>{data[0].label}</div>
              <div>{data[Math.floor(data.length / 2)].label}</div>
              <div>{data[data.length - 1].label}</div>
            </>
          ) : (
            data.map((point, index) => (
              <div key={index}>{point.label}</div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Analytics card component
  const AnalyticsCard = ({ 
    title, 
    value, 
    change,
    chartData,
    color = 'indigo',
    format = 'number'
  }: { 
    title: string, 
    value: number | string, 
    change: { value: number, isPositive: boolean },
    chartData?: ChartDataPoint[],
    color?: string,
    format?: 'number' | 'percentage' | 'currency'
  }) => {
    let formattedValue = value;
    if (typeof value === 'number') {
      if (format === 'percentage') {
        formattedValue = formatPercentage(value);
      } else if (format === 'currency') {
        formattedValue = formatCurrency(value);
      } else {
        formattedValue = formatNumber(value);
      }
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{title}</h3>
        <div className="flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{formattedValue}</p>
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${
            change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <span>
              {change.isPositive ? (
                <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="self-center flex-shrink-0 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
            <span className="ml-1">
              {format === 'percentage' ? formatPercentage(Math.abs(change.value)) : (
                format === 'currency' ? formatCurrency(Math.abs(change.value)) : formatNumber(Math.abs(change.value))
              )}
            </span>
          </p>
        </div>
        
        {chartData && (
          <div className="mt-4">
            <SimpleChart data={chartData} color={color} />
          </div>
        )}
      </div>
    );
  };

  // Stats grid component for different sections
  const UserStatsGrid = () => {
    if (!analyticsData) return null;
    
    const { userAnalytics } = analyticsData;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="New User Registrations"
          value={userAnalytics.registrations.reduce((sum, dp) => sum + dp.value, 0)}
          change={calculateChange(userAnalytics.registrations)}
          chartData={userAnalytics.registrations}
          color="blue"
        />
        <AnalyticsCard
          title="Active Users"
          value={userAnalytics.activeUsers[userAnalytics.activeUsers.length - 1].value}
          change={calculateChange(userAnalytics.activeUsers)}
          chartData={userAnalytics.activeUsers}
          color="green"
        />
        <AnalyticsCard
          title="User Retention Rate"
          value={userAnalytics.retentionRate}
          change={{ value: 2.3, isPositive: true }}
          format="percentage"
          color="indigo"
        />
      </div>
    );
  };
  
  const FinancialStatsGrid = () => {
    if (!analyticsData) return null;
    
    const { financialAnalytics } = analyticsData;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Revenue"
          value={financialAnalytics.revenue.reduce((sum, dp) => sum + dp.value, 0)}
          change={calculateChange(financialAnalytics.revenue)}
          chartData={financialAnalytics.revenue}
          format="currency"
          color="emerald"
        />
        <AnalyticsCard
          title="Total Expenses"
          value={financialAnalytics.expenses.reduce((sum, dp) => sum + dp.value, 0)}
          change={calculateChange(financialAnalytics.expenses, true)}
          chartData={financialAnalytics.expenses}
          format="currency"
          color="amber"
        />
        <AnalyticsCard
          title="Profit Margin"
          value={financialAnalytics.profitMargin}
          change={{ value: 1.8, isPositive: true }}
          format="percentage"
          color="indigo"
        />
      </div>
    );
  };
  
  const StakingStatsGrid = () => {
    if (!analyticsData) return null;
    
    const { stakingAnalytics } = analyticsData;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Stakes Created"
          value={stakingAnalytics.stakesCreated.reduce((sum, dp) => sum + dp.value, 0)}
          change={calculateChange(stakingAnalytics.stakesCreated)}
          chartData={stakingAnalytics.stakesCreated}
          color="indigo"
        />
        <AnalyticsCard
          title="Average Stake Size"
          value={stakingAnalytics.averageStakeSize}
          change={{ value: 500, isPositive: true }}
          format="currency"
          color="purple"
        />
        <AnalyticsCard
          title="Completion Rate"
          value={stakingAnalytics.completionRate}
          change={{ value: 3.2, isPositive: true }}
          format="percentage"
          color="green"
        />
      </div>
    );
  };
  
  const ReferralStatsGrid = () => {
    if (!analyticsData) return null;
    
    const { referralAnalytics } = analyticsData;
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnalyticsCard
            title="Total Referrals"
            value={Object.values(referralAnalytics.referralsByLevel).reduce((a, b) => a + b, 0)}
            change={{ value: 45, isPositive: true }}
            color="blue"
          />
          <AnalyticsCard
            title="Conversion Rate"
            value={referralAnalytics.conversionRate}
            change={{ value: 5.7, isPositive: true }}
            format="percentage"
            color="green"
          />
        </div>
        
        {/* Referral levels breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Referrals by Level</h3>
          <div className="space-y-4">
            {Object.entries(referralAnalytics.referralsByLevel).map(([level, count], index) => (
              <div key={level} className="relative">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{level}</span>
                  <span className="text-gray-900 dark:text-gray-100 font-medium">{count}</span>
                </div>
                <div className="mt-1 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-2 ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-indigo-500' : 'bg-purple-500'}`}
                    style={{ width: `${(count / 300) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top referrers table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">Top Referrers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Referrals
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Earnings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {referralAnalytics.topReferrers.map((referrer) => (
                  <tr key={referrer.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{referrer.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {referrer.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-100">{referrer.count}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">${referrer.earned.toLocaleString()}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Analytics Dashboard
        </h2>
        <div className="flex items-center gap-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
          >
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
            <option value="quarter">Last quarter</option>
            <option value="year">Last year</option>
          </select>
        </div>
      </div>
      
      {/* Analytics Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab('financial')}
            className={`${
              activeTab === 'financial'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Financial Analytics
          </button>
          <button
            onClick={() => setActiveTab('staking')}
            className={`${
              activeTab === 'staking'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Staking Analytics
          </button>
          <button
            onClick={() => setActiveTab('referral')}
            className={`${
              activeTab === 'referral'
                ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-500'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Referral Analytics
          </button>
        </nav>
      </div>
      
      {/* Loading state */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-64">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="mt-6 h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {activeTab === 'users' && <UserStatsGrid />}
          {activeTab === 'financial' && <FinancialStatsGrid />}
          {activeTab === 'staking' && <StakingStatsGrid />}
          {activeTab === 'referral' && <ReferralStatsGrid />}
        </div>
      )}
    </div>
  );
}