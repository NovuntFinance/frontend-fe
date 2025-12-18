/**
 * Empty State Helper Utilities
 * Ensures empty states are used consistently across the platform
 */

import { EmptyStates } from '@/components/EmptyStates';
import { LoadingStates } from '@/components/ui/loading-states';
import { UserFriendlyError } from '@/components/errors/UserFriendlyError';

/**
 * Helper to render appropriate state based on data status
 * Provides consistent pattern for loading/error/empty/data states
 */
export function renderDataState<T>({
  data,
  isLoading,
  error,
  emptyState,
  children,
  loadingComponent,
  errorComponent,
}: {
  data: T[] | T | null | undefined;
  isLoading: boolean;
  error: unknown;
  emptyState?: React.ReactNode;
  children: (data: T[] | T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}) {
  // Loading state
  if (isLoading) {
    return loadingComponent || <LoadingStates.Card />;
  }

  // Error state
  if (error) {
    return errorComponent || <UserFriendlyError error={error} variant="inline" />;
  }

  // Empty state
  const isEmpty = Array.isArray(data) ? data.length === 0 : !data;
  if (isEmpty) {
    return emptyState || <EmptyStates.EmptyState title="No data available" />;
  }

  // Data available - render children
  return <>{children(data as T[] | T)}</>;
}

/**
 * Helper for list components
 */
export function renderListState<T>({
  items,
  isLoading,
  error,
  emptyState,
  renderItem,
  loadingComponent,
}: {
  items: T[] | null | undefined;
  isLoading: boolean;
  error: unknown;
  emptyState?: React.ReactNode;
  renderItem: (item: T, index: number) => React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  return renderDataState({
    data: items,
    isLoading,
    error,
    emptyState,
    loadingComponent: loadingComponent || <LoadingStates.List />,
    children: (data) => (
      <ul className="space-y-2">
        {(data as T[]).map((item, index) => (
          <li key={index}>{renderItem(item, index)}</li>
        ))}
      </ul>
    ),
  });
}

/**
 * Helper for table components
 */
export function renderTableState<T>({
  items,
  isLoading,
  error,
  emptyState,
  columns,
  renderRow,
  loadingComponent,
}: {
  items: T[] | null | undefined;
  isLoading: boolean;
  error: unknown;
  emptyState?: React.ReactNode;
  columns: string[];
  renderRow: (item: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
}) {
  return renderDataState({
    data: items,
    isLoading,
    error,
    emptyState,
    loadingComponent: loadingComponent || <LoadingStates.Table rows={5} columns={columns.length} />,
    children: (data) => (
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data as T[]).map((item, index) => (
            <tr key={index}>{renderRow(item)}</tr>
          ))}
        </tbody>
      </table>
    ),
  });
}

