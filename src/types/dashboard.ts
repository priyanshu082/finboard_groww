import { Widget } from './widget';
import { CreateWidgetInput } from './widget';

// Dashboard configuration
export interface DashboardConfig {
  title: string;
  theme: 'light' | 'dark' | 'system';
  refreshInterval: number;
  autoRefresh: boolean;
}

// Widget layout for positioning
export interface WidgetLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

// Complete dashboard state
export interface DashboardState {
  widgets: Widget[];
  layouts: WidgetLayout[];
  order: string[]; // For drag & drop ordering
  config: DashboardConfig;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addWidget: (widget: CreateWidgetInput) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  updateLayout: (layouts: WidgetLayout[]) => void;
  reorderWidgets: (newOrder: string[]) => void; // For drag & drop
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Widget data cache
export interface WidgetCache {
  widgetId: string;
  data: any;
  lastUpdated: Date;
  expiresAt: Date;
}

// Dashboard export/import
export interface DashboardExport {
  version: string;
  exportedAt: Date;
  config: DashboardConfig;
  widgets: Widget[];
  layouts: WidgetLayout[];
  order: string[];
}
