import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Widget, 
  DashboardState, 
  DashboardConfig, 
  WidgetLayout,
  CreateWidgetInput 
} from '@/types';

// Default dashboard configuration
const defaultConfig: DashboardConfig = {
  title: 'My Finance Dashboard',
  theme: 'system',
  refreshInterval: 30, // 30 seconds
  autoRefresh: true,
};

// Generate unique widget ID
const generateWidgetId = (): string => {
  return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Default widget layout
const createDefaultLayout = (id: string, index: number): WidgetLayout => ({
  id,
  x: (index % 3) * 400, // 3 columns
  y: Math.floor(index / 3) * 300, // Stacked rows
  width: 380,
  height: 280,
  minWidth: 300,
  minHeight: 200,
});

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      // Initial state
      widgets: [],
      layouts: [],
      order: [], // For drag & drop ordering
      config: defaultConfig,
      isLoading: false,
      error: null,

      // Add new widget
      addWidget: (widgetInput: CreateWidgetInput) => {
        const id = generateWidgetId();
        const currentWidgets = get().widgets;
        const now = new Date();
        
        const newWidget: Widget = {
          ...widgetInput,
          id,
          createdAt: now,
          updatedAt: now,
        };

        const newLayout = createDefaultLayout(id, currentWidgets.length);

        set((state) => ({
          widgets: [...state.widgets, newWidget],
          layouts: [...state.layouts, newLayout],
          order: [...state.order, id], // Add to order array
        }));
      },

      // Remove widget and its layout
      removeWidget: (id: string) => {
        set((state) => ({
          widgets: state.widgets.filter(widget => widget.id !== id),
          layouts: state.layouts.filter(layout => layout.id !== id),
          order: state.order.filter(widgetId => widgetId !== id), // Remove from order
        }));
      },

      // Update widget configuration
      updateWidget: (id: string, updates: Partial<Widget>) => {
        set((state) => ({
          widgets: state.widgets.map(widget =>
            widget.id === id 
              ? { ...widget, ...updates, updatedAt: new Date() }
              : widget
          ),
        }));
      },

      // Update widget layouts (for drag & drop positioning)
      updateLayout: (layouts: WidgetLayout[]) => {
        set({ layouts });
      },

      // Reorder widgets (for drag & drop)
      reorderWidgets: (newOrder: string[]) => {
        set({ order: newOrder });
      },

      // Loading state management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Error handling
      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'finboard-storage', // localStorage key
      partialize: (state) => ({
        widgets: state.widgets,
        layouts: state.layouts,
        order: state.order, // Persist order for drag & drop
        config: state.config,
        // Don't persist loading states and errors
      }),
    }
  )
);

// Custom hooks for specific use cases
export const useWidgets = () => {
  const widgets = useDashboardStore((state) => state.widgets);
  return widgets;
};

export const useWidgetOrder = () => {
  const order = useDashboardStore((state) => state.order);
  return order;
};

export const useWidgetById = (id: string) => {
  const widget = useDashboardStore((state) => 
    state.widgets.find(w => w.id === id)
  );
  return widget;
};

export const useDashboardActions = () => {
  const { 
    addWidget, 
    removeWidget, 
    updateWidget, 
    updateLayout,
    reorderWidgets,
    setError, 
    clearError 
  } = useDashboardStore();
  
  return { 
    addWidget, 
    removeWidget, 
    updateWidget, 
    updateLayout,
    reorderWidgets,
    setError, 
    clearError 
  };
};

export const useDashboardConfig = () => {
  const config = useDashboardStore((state) => state.config);
  return config;
};
