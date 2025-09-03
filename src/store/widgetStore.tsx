import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/apiClient';

export interface Widget {
  id: string;
  name: string;
  type: 'card' | 'table' | 'chart';
  apiUrl: string;
  apiKey?: string;
  selectedFields: string[];
  refreshInterval: number;
  data?: any;
  error?: string;
  isLoading?: boolean;
  lastUpdated: number;
  position: number;
}

interface WidgetStore {
  widgets: Widget[];
  isAddModalOpen: boolean;
  
  // Actions
  addWidget: (widget: Omit<Widget, 'id' | 'lastUpdated' | 'position'>) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  refreshWidget: (id: string) => Promise<void>;
  reorderWidgets: (startIndex: number, endIndex: number) => void;
  setAddModalOpen: (open: boolean) => void;
  testApiUrl: (url: string, apiKey?: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      widgets: [],
      isAddModalOpen: false,

      addWidget: (widgetData) => {
        const widget: Widget = {
          ...widgetData,
          id: `widget_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          lastUpdated: Date.now(),
          position: get().widgets.length,
        };
        
        set(state => ({ widgets: [...state.widgets, widget] }));
        
        // Auto-refresh
        setTimeout(() => get().refreshWidget(widget.id), 100);
      },

      removeWidget: (id) => {
        set(state => ({
          widgets: state.widgets.filter(w => w.id !== id)
        }));
      },

      updateWidget: (id, updates) => {
        set(state => ({
          widgets: state.widgets.map(w => 
            w.id === id ? { ...w, ...updates, lastUpdated: Date.now() } : w
          )
        }));
      },

      refreshWidget: async (id) => {
        const widget = get().widgets.find(w => w.id === id);
        if (!widget) return;

        // Check if last fetch was within 30 seconds (use cache)
        const now = Date.now();
        if (now - widget.lastUpdated < 30 * 1000 && widget.data && !widget.error) {
          return;
        }

        get().updateWidget(id, { isLoading: true, error: undefined });

        try {
          const result = await apiClient.fetch({
            url: widget.apiUrl,
            apiKey: widget.apiKey
          });

          get().updateWidget(id, {
            data: result.data,
            isLoading: false,
            lastUpdated: now
          });

        } catch (error) {
          get().updateWidget(id, {
            error: error instanceof Error ? error.message : 'Failed to fetch data',
            isLoading: false
          });
        }
      },

      reorderWidgets: (startIndex, endIndex) => {
        set(state => {
          const widgets = [...state.widgets];
          const [removed] = widgets.splice(startIndex, 1);
          widgets.splice(endIndex, 0, removed);
          
          return {
            widgets: widgets.map((w, index) => ({ ...w, position: index }))
          };
        });
      },

      setAddModalOpen: (open) => set({ isAddModalOpen: open }),

      testApiUrl: async (url, apiKey) => {
        try {
          const result = await apiClient.fetch({ url, apiKey });
          return { success: true, data: result.data };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to test API'
          };
        }
      }
    }),
    {
      name: 'finboard-widgets',
      partialize: (state) => ({
        widgets: state.widgets.map(w => ({
          ...w,
          isLoading: false, // Don't persist loading state
          data: Array.isArray(w.data) ? w.data.slice(0, 50) : w.data // Limit data size
        }))
      })
    }
  )
);
