// Generic API response for any JSON API
export interface ApiResponse<T = any> {
    data: T | null;
    error?: string;
    success: boolean;
    message?: string;
  }
  
  // Basic financial data structure
  export interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    timestamp: string;
  }
  
  // For charts - time series data
  export interface PricePoint {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
  }
  
  // For watchlist cards
  export interface WatchlistItem {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }
  
  // Market gainers/losers
  export interface MarketMover {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }
  
  // API testing result
  export interface ApiTestResult {
    success: boolean;
    message: string;
    fields: FieldInfo[];
  }
  
  // Field information for dynamic mapping
  export interface FieldInfo {
    path: string;
    type: string;
    value: any;
    selected?: boolean;
  }
  
  // Error handling
  export interface ApiError {
    code: 'RATE_LIMIT' | 'INVALID_KEY' | 'NETWORK_ERROR' | 'NOT_FOUND' | 'SERVER_ERROR';
    message: string;
    retryAfter?: number;
  }
  
  // API configuration
  export interface ApiConfig {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
  }
  