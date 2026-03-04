import { create } from 'zustand';

const useStore = create((set) => ({
  // Authentication & User Management
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
  token: localStorage.getItem('token') || null,
  
  login: (userData, token) => {
    localStorage.setItem('token', token);
    set({ user: userData, isAuthenticated: true, token });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, token: null });
  },

  // App Settings & Preferences
  isDarkMode: true,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  isSidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),

  activeTab: 'Dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Global Data States
  tweets: [],
  setTweets: (newTweets) => set({ tweets: newTweets }),
  addTweet: (tweet) => set((state) => ({
    tweets: [tweet, ...state.tweets].slice(0, 1000) // Keep history bounded
  })),

  alerts: [],
  setAlerts: (newAlerts) => set({ alerts: newAlerts }),
  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts]
  })),
  dismissAlert: (id) => set((state) => ({
    alerts: state.alerts.filter((a) => a.id !== id)
  })),

  metrics: {
    total_analyzed: 0,
    high_risk_events: 0,
    verified_reports: 0,
    disaster_distribution: {}
  },
  setMetrics: (metrics) => set({ metrics }),

  // Streaming Control
  isStreamPaused: false,
  toggleStream: () => set((state) => ({ isStreamPaused: !state.isStreamPaused })),
  isConnected: false,
  setIsConnected: (status) => set({ isConnected: status }),

  // Global Search/Filters
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  activeFilter: 'All', // e.g. 'Fire', 'Flood', 'All'
  setActiveFilter: (filterName) => set({ activeFilter: filterName }),
}));

export default useStore;
