export type WidgetType = 'table' | 'card' | 'chart';

export type ChartType = 'line' | 'bar' | 'candle' | 'area';

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetConfig {
  chartType?: ChartType;
  timeInterval?: 'daily' | 'weekly' | 'monthly';
  showLegend?: boolean;
  itemsPerPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  displayFormat?: 'currency' | 'percentage' | 'number';
  showChange?: boolean;
  compactView?: boolean;
  refreshInterval?: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  apiEndpoint: string;
  apiKey?: string;
  selectedFields: string[];
  position: WidgetPosition;
  size: WidgetSize;
  config: WidgetConfig;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type CreateWidgetInput = Omit<Widget, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateWidgetInput = Partial<Omit<Widget, 'id'>>;
