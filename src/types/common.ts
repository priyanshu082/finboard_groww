// Generic utility types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type Theme = 'light' | 'dark' | 'system';

// Form states
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Pagination
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Sort configuration
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Filter configuration
export interface FilterConfig {
  field: string;
  value: string | number;
  operator: 'equals' | 'contains' | 'greater' | 'less';
}

// Table state
export interface TableState {
  pagination: PaginationState;
  sort: SortConfig | null;
  filters: FilterConfig[];
  search: string;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Select options
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

// Time intervals
export type TimeInterval = '1m' | '5m' | '15m' | '1h' | '1d' | '1w' | '1M';

// Chart configuration
export interface ChartConfig {
  type: 'line' | 'candle' | 'bar';
  interval: TimeInterval;
  showVolume: boolean;
  showGrid: boolean;
  height: number;
}

// Notification
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}
