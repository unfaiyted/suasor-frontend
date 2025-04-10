import { writable, get } from 'svelte/store';

// Define dashboard widget types
// Widget sizing now uses explicit grid dimensions
export interface WidgetSize {
  width: 1 | 2 | 3;  // Number of columns the widget spans
  height: 1 | 2 | 3; // Number of rows the widget spans
}

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: WidgetSize;
  order: number;
  visible: boolean;
  config?: Record<string, any>;
}

export interface DashboardLayout {
  widgets: DashboardWidget[];
  editMode: boolean;
}

// Default dashboard configuration
const defaultWidgets: DashboardWidget[] = [
  {
    id: 'movies-stats',
    type: 'movies-stats',
    title: 'Movies',
    size: { width: 1, height: 1 },
    order: 0,
    visible: true
  },
  {
    id: 'tv-stats',
    type: 'tv-stats',
    title: 'TV Shows',
    size: { width: 1, height: 1 },
    order: 1,
    visible: true
  },
  {
    id: 'music-stats',
    type: 'music-stats',
    title: 'Music',
    size: { width: 1, height: 1 },
    order: 2,
    visible: true
  },
  {
    id: 'activity',
    type: 'activity',
    title: 'Recent Activity',
    size: { width: 2, height: 2 },
    order: 3,
    visible: true
  },
  {
    id: 'jobs',
    type: 'jobs',
    title: 'Jobs Status',
    size: { width: 2, height: 2 },
    order: 4,
    visible: true
  },
  {
    id: 'discovery',
    type: 'discovery',
    title: 'Media Discovery',
    size: { width: 2, height: 1 },
    order: 5,
    visible: true
  },
  {
    id: 'integrations',
    type: 'integrations',
    title: 'Integrations',
    size: { width: 1, height: 4 },
    order: 6,
    visible: true
  }
];

// Initialize the dashboard store
function createDashboardStore() {
  // Try to load saved layout from localStorage
  let initialLayout: DashboardLayout = {
    widgets: [...defaultWidgets],
    editMode: false
  };

  try {
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
      const parsed = JSON.parse(savedLayout);
      // Merge with defaults in case we've added new widgets
      const savedIds = new Set(parsed.widgets.map((w: DashboardWidget) => w.id));
      const mergedWidgets = [
        ...parsed.widgets,
        ...defaultWidgets.filter(w => !savedIds.has(w.id))
      ];
      initialLayout = {
        widgets: mergedWidgets,
        editMode: false
      };
    }
  } catch (error) {
    console.error('Error loading dashboard layout from localStorage:', error);
  }

  const { subscribe, update, set } = writable<DashboardLayout>(initialLayout);

  return {
    subscribe,
    
    // Toggle edit mode
    toggleEditMode: () => update(state => {
      return { ...state, editMode: !state.editMode };
    }),
    
    // Update widget order
    reorderWidgets: (newOrder: string[]) => update(state => {
      const updatedWidgets = [...state.widgets];
      
      // Update order based on the new array of IDs
      newOrder.forEach((id, index) => {
        const widget = updatedWidgets.find(w => w.id === id);
        if (widget) {
          widget.order = index;
        }
      });
      
      // Sort by new order
      updatedWidgets.sort((a, b) => a.order - b.order);
      
      // Save to localStorage
      const newState = { ...state, widgets: updatedWidgets };
      localStorage.setItem('dashboardLayout', JSON.stringify(newState));
      
      return newState;
    }),
    
    // Toggle widget visibility
    toggleWidget: (id: string) => update(state => {
      const updatedWidgets = state.widgets.map(widget => {
        if (widget.id === id) {
          return { ...widget, visible: !widget.visible };
        }
        return widget;
      });
      
      const newState = { ...state, widgets: updatedWidgets };
      localStorage.setItem('dashboardLayout', JSON.stringify(newState));
      
      return newState;
    }),
    
    // Update widget size
    updateWidgetSize: (id: string, size: WidgetSize) => update(state => {
      const updatedWidgets = state.widgets.map(widget => {
        if (widget.id === id) {
          return { ...widget, size };
        }
        return widget;
      });
      
      const newState = { ...state, widgets: updatedWidgets };
      localStorage.setItem('dashboardLayout', JSON.stringify(newState));
      
      return newState;
    }),
    
    // Update widget position in grid
    updateWidgetPosition: (id: string, newSize: WidgetSize) => update(state => {
      const updatedWidgets = state.widgets.map(widget => {
        if (widget.id === id) {
          return { ...widget, size: newSize };
        }
        return widget;
      });
      
      const newState = { ...state, widgets: updatedWidgets };
      localStorage.setItem('dashboardLayout', JSON.stringify(newState));
      
      return newState;
    }),
    
    // Reset to default layout
    resetLayout: () => {
      localStorage.removeItem('dashboardLayout');
      set({
        widgets: [...defaultWidgets],
        editMode: false
      });
    }
  };
}

export const dashboardStore = createDashboardStore();