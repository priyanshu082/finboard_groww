
export interface AlphaVantageGlobalQuote {
    "Global Quote": {
      "01. symbol": string;
      "02. open": string;
      "03. high": string;
      "04. low": string;
      "05. price": string;
      "06. volume": string;
      "07. latest trading day": string;
      "08. previous close": string;
      "09. change": string;
      "10. change percent": string;
    };
  }
  
 
  export interface StockData {
    symbol: string;
    price: number;
    change: number;
    changePercent: string;
    volume: number;
    lastUpdated: string;
  }
  
  
  export interface Widget {
    id: number;
    type: 'stock' | 'chart' | 'table' | 'card';
    title?: string;
    symbol?: string;
    config?: WidgetConfig;
  }
  
  export interface WidgetConfig {
    refreshInterval?: number;
    displayFields?: string[];
    chartType?: 'line' | 'candle';
  }
  
 
  export interface ApiProvider {
    name: string;
    key: string;
    rateLimit: {
      perMinute: number;
      perDay?: number;
    };
  }
  
  
  export interface DashboardState {
    widgets: Widget[];
    apiKeys: Record<string, string>;
    addWidget: (widget: Omit<Widget, 'id'>) => void;
    removeWidget: (id: number) => void;
    updateWidget: (id: number, updates: Partial<Widget>) => void;
    setApiKey: (provider: string, key: string) => void;
  }