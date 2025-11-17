import { ReactNode } from 'react';

interface AdminMetricCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  change?: number;
  icon: 'users' | 'chart' | 'money' | 'wallet' | 'dollar' | 'shield';
  trend: 'up' | 'down' | 'neutral';
  showChart?: boolean;
  alert?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
}

const AdminMetricCard = ({
  title,
  value,
  secondaryValue,
  change,
  icon,
  trend,
  showChart = false,
  alert = false,
  sparklineData,
  sparklineColor,
}: AdminMetricCardProps) => {
  const getIcon = (): ReactNode => {
    switch (icon) {
      case 'users':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'chart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'money':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'wallet':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        );
      case 'dollar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'shield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderTrendIndicator = () => {
    if (trend === 'up') {
      return (
        <span className="inline-flex items-center text-green-600 dark:text-green-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          {change ? `${change}%` : ''}
        </span>
      );
    } else if (trend === 'down') {
      return (
        <span className="inline-flex items-center text-red-600 dark:text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          {change ? `${change}%` : ''}
        </span>
      );
    }
    return null;
  };

  const effectiveSparkline = sparklineData && sparklineData.length > 0 ? sparklineData : null;
  const maxSparklineValue = effectiveSparkline ? Math.max(...effectiveSparkline) || 0 : 0;
  const barColorClass = sparklineColor ?? 'bg-indigo-500';

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${alert ? 'border-amber-300 dark:border-amber-700' : 'border-gray-200 dark:border-gray-700'} p-5`}>
      <div className="flex justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <div className="flex items-baseline mt-1">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            <div className="ml-2">{renderTrendIndicator()}</div>
          </div>
          {secondaryValue && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{secondaryValue}</p>
          )}
        </div>
        <div className={`flex items-center justify-center h-12 w-12 rounded-md ${alert ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
          {getIcon()}
        </div>
      </div>
      
      {showChart && (
        <div className="mt-4 h-12 w-full">
          <div className="flex h-full items-end space-x-1">
            {effectiveSparkline
              ? effectiveSparkline.map((point, index) => {
                  const height = maxSparklineValue > 0 ? (point / maxSparklineValue) * 100 : 0;
                  return (
                    <div
                      key={index}
                      className={`${barColorClass} rounded-sm transition-all duration-500 ease-in-out`}
                      style={{ height: `${height}%`, width: '8.333%' }}
                    />
                  );
                })
              : Array.from({ length: 12 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-indigo-100 dark:bg-indigo-700/30 rounded-sm"
                    style={{ height: `${30 + (index % 5) * 12}%`, width: '8.333%' }}
                  />
                ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMetricCard;