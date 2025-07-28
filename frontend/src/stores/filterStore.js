import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useFilterStore = create(
  persist(
    (set, get) => ({
      // Search state
      searchQuery: '',
      searchField: 'all', // 'all', 'title', 'description', 'id', 'tags'
      searchOperator: 'AND', // 'AND', 'OR', 'NOT'
      searchHistory: [],
      
      // Date filters
      dateFilters: {
        created: { start: null, end: null, enabled: false },
        updated: { start: null, end: null, enabled: false },
        executed: { start: null, end: null, enabled: false }
      },
      
      // Basic filters
      projectFilter: '',
      suiteFilter: '',
      statusFilter: '',
      priorityFilter: '',
      
      // Custom field filters
      customFieldFilters: {},
      
      // Filter presets
      savedPresets: [],
      activePreset: null,
      
      // UI state
      showAdvancedSearch: false,
      showDateFilters: false,
      showCustomFilters: false,
      
      // Actions
      setSearchQuery: (query) => {
        set({ searchQuery: query });
        // Add to search history if not empty
        if (query.trim()) {
          const currentHistory = get().searchHistory;
          const newHistory = [query, ...currentHistory.filter(h => h !== query)].slice(0, 10);
          set({ searchHistory: newHistory });
        }
      },
      
      setSearchField: (field) => set({ searchField: field }),
      setSearchOperator: (operator) => set({ searchOperator: operator }),
      
      setDateFilter: (type, field, value) => {
        set((state) => ({
          dateFilters: {
            ...state.dateFilters,
            [type]: {
              ...state.dateFilters[type],
              [field]: value
            }
          }
        }));
      },
      
      toggleDateFilter: (type) => {
        set((state) => ({
          dateFilters: {
            ...state.dateFilters,
            [type]: {
              ...state.dateFilters[type],
              enabled: !state.dateFilters[type].enabled
            }
          }
        }));
      },
      
      setBasicFilter: (filterType, value) => {
        const filterMapping = {
          project: 'projectFilter',
          suite: 'suiteFilter', 
          status: 'statusFilter',
          priority: 'priorityFilter'
        };
        
        const storeProperty = filterMapping[filterType];
        if (storeProperty) {
          set({ [storeProperty]: value });
        }
      },
      
      setCustomFieldFilter: (fieldName, value) => {
        set((state) => ({
          customFieldFilters: {
            ...state.customFieldFilters,
            [fieldName]: value
          }
        }));
      },
      
      clearCustomFieldFilter: (fieldName) => {
        set((state) => {
          const newCustomFilters = { ...state.customFieldFilters };
          delete newCustomFilters[fieldName];
          return { customFieldFilters: newCustomFilters };
        });
      },
      
      savePreset: (presetData) => {
        const preset = {
          id: presetData.id || Date.now().toString(),
          name: presetData.name,
          filters: presetData.filters,
          createdAt: presetData.createdAt || new Date().toISOString()
        };
        
        set((state) => {
          // If editing existing preset, replace it
          if (presetData.id) {
            return {
              savedPresets: state.savedPresets.map(p => 
                p.id === presetData.id ? preset : p
              )
            };
          }
          // Otherwise add new preset
          return {
            savedPresets: [...state.savedPresets, preset]
          };
        });
      },
      
      loadPreset: (presetId) => {
        const preset = get().savedPresets.find(p => p.id === presetId);
        if (preset) {
          set({ activePreset: presetId });
          // Apply the preset filters
          const { filters } = preset;
          set({
            searchQuery: filters.search?.query || '',
            searchField: filters.search?.field || 'all',
            searchOperator: filters.search?.operator || 'AND',
            dateFilters: filters.dates || get().dateFilters,
            projectFilter: filters.project || '',
            suiteFilter: filters.suite || '',
            statusFilter: filters.status || '',
            priorityFilter: filters.priority || '',
            customFieldFilters: filters.customFieldFilters || {}
          });
        }
      },

      applyPresetFilters: (filters) => {
        set({
          searchQuery: filters.search?.query || '',
          searchField: filters.search?.field || 'all',
          searchOperator: filters.search?.operator || 'AND',
          dateFilters: filters.dates || get().dateFilters,
          projectFilter: filters.project || '',
          suiteFilter: filters.suite || '',
          statusFilter: filters.status || '',
          priorityFilter: filters.priority || '',
          customFieldFilters: filters.customFieldFilters || {},
          activePreset: null
        });
      },
      
      deletePreset: (presetId) => {
        set((state) => ({
          savedPresets: state.savedPresets.filter(p => p.id !== presetId),
          activePreset: state.activePreset === presetId ? null : state.activePreset
        }));
      },
      
      clearAllFilters: () => {
        set({
          searchQuery: '',
          searchField: 'all',
          searchOperator: 'AND',
          dateFilters: {
            created: { start: null, end: null, enabled: false },
            updated: { start: null, end: null, enabled: false },
            executed: { start: null, end: null, enabled: false }
          },
          projectFilter: '',
          suiteFilter: '',
          statusFilter: '',
          priorityFilter: '',
          customFieldFilters: {},
          activePreset: null
        });
      },
      
      toggleAdvancedSearch: () => set((state) => ({ showAdvancedSearch: !state.showAdvancedSearch })),
      toggleDateFilters: () => set((state) => ({ showDateFilters: !state.showDateFilters })),
      toggleCustomFilters: () => set((state) => ({ showCustomFilters: !state.showCustomFilters })),
      
      // Computed values
      getActiveFiltersCount: () => {
        const state = get();
        let count = 0;
        
        if (state.searchQuery) count++;
        if (state.projectFilter) count++;
        if (state.suiteFilter) count++;
        if (state.statusFilter) count++;
        if (state.priorityFilter) count++;
        
        // Count enabled date filters
        Object.values(state.dateFilters).forEach(filter => {
          if (filter.enabled && (filter.start || filter.end)) count++;
        });
        
        // Count custom field filters
        Object.keys(state.customFieldFilters).forEach(key => {
          if (state.customFieldFilters[key]) count++;
        });
        
        return count;
      },
      
      getFilterSummary: () => {
        const state = get();
        const summary = [];
        
        if (state.searchQuery) {
          summary.push(`Search: "${state.searchQuery}"`);
        }
        if (state.projectFilter) {
          summary.push(`Project: ${state.projectFilter}`);
        }
        if (state.suiteFilter) {
          summary.push(`Suite: ${state.suiteFilter}`);
        }
        if (state.statusFilter) {
          summary.push(`Status: ${state.statusFilter}`);
        }
        if (state.priorityFilter) {
          summary.push(`Priority: ${state.priorityFilter}`);
        }
        
        Object.entries(state.dateFilters).forEach(([type, filter]) => {
          if (filter.enabled && (filter.start || filter.end)) {
            const dateRange = [];
            if (filter.start) dateRange.push(filter.start);
            if (filter.end) dateRange.push(filter.end);
            summary.push(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${dateRange.join(' - ')}`);
          }
        });
        
        return summary;
      }
    }),
    {
      name: 'test-case-filters',
      partialize: (state) => ({
        searchHistory: state.searchHistory,
        savedPresets: state.savedPresets,
        showAdvancedSearch: state.showAdvancedSearch,
        showDateFilters: state.showDateFilters,
        showCustomFilters: state.showCustomFilters
      })
    }
  )
);

export default useFilterStore; 