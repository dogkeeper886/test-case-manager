import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useTestCaseStore = create(
  persist(
    (set, get) => ({
      // State
      testSuites: [],
      testCases: [],
      selectedTestSuite: null,
      selectedTestCase: null,
      searchQuery: '',
      filters: {
        status: [],
        importance: [],
        executionType: [],
        customFields: {},
      },
      loading: false,
      error: null,

      // Actions
      setTestSuites: (testSuites) => set({ testSuites }),
      
      setTestCases: (testCases) => set({ testCases }),
      
      addTestSuite: (testSuite) => 
        set((state) => ({ 
          testSuites: [...state.testSuites, testSuite] 
        })),
      
      addTestCase: (testCase) => 
        set((state) => ({ 
          testCases: [...state.testCases, testCase] 
        })),
      
      updateTestSuite: (id, updates) =>
        set((state) => ({
          testSuites: state.testSuites.map(suite =>
            suite.id === id ? { ...suite, ...updates } : suite
          ),
        })),
      
      updateTestCase: (id, updates) =>
        set((state) => ({
          testCases: state.testCases.map(testCase =>
            testCase.id === id ? { ...testCase, ...updates } : testCase
          ),
        })),
      
      deleteTestSuite: (id) =>
        set((state) => ({
          testSuites: state.testSuites.filter(suite => suite.id !== id),
        })),
      
      deleteTestCase: (id) =>
        set((state) => ({
          testCases: state.testCases.filter(testCase => testCase.id !== id),
        })),
      
      setSelectedTestSuite: (testSuite) => set({ selectedTestSuite: testSuite }),
      
      setSelectedTestCase: (testCase) => set({ selectedTestCase: testCase }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilters: (filters) => set({ filters }),
      
      updateFilter: (filterType, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [filterType]: value,
          },
        })),
      
      clearFilters: () =>
        set({
          filters: {
            status: [],
            importance: [],
            executionType: [],
            customFields: {},
          },
        }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      // Computed values
      getFilteredTestCases: () => {
        const { testCases, searchQuery, filters } = get();
        
        return testCases.filter(testCase => {
          // Search filter
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesSearch = 
              testCase.title?.toLowerCase().includes(query) ||
              testCase.description?.toLowerCase().includes(query) ||
              testCase.internal_id?.toString().includes(query) ||
              testCase.external_id?.toString().includes(query);
            
            if (!matchesSearch) return false;
          }
          
          // Status filter
          if (filters.status.length > 0 && !filters.status.includes(testCase.status)) {
            return false;
          }
          
          // Importance filter
          if (filters.importance.length > 0 && !filters.importance.includes(testCase.importance)) {
            return false;
          }
          
          // Execution type filter
          if (filters.executionType.length > 0 && !filters.executionType.includes(testCase.execution_type)) {
            return false;
          }
          
          // Custom fields filter
          if (Object.keys(filters.customFields).length > 0) {
            for (const [fieldName, fieldValue] of Object.entries(filters.customFields)) {
              if (fieldValue && testCase.custom_fields?.[fieldName] !== fieldValue) {
                return false;
              }
            }
          }
          
          return true;
        });
      },
      
      getTestCasesBySuite: (suiteId) => {
        const { testCases } = get();
        return testCases.filter(testCase => testCase.test_suite_id === suiteId);
      },
      
      getTestSuiteStats: (suiteId) => {
        const { testCases } = get();
        const suiteTestCases = testCases.filter(testCase => testCase.test_suite_id === suiteId);
        
        return {
          total: suiteTestCases.length,
          passed: suiteTestCases.filter(tc => tc.status === 'passed').length,
          failed: suiteTestCases.filter(tc => tc.status === 'failed').length,
          blocked: suiteTestCases.filter(tc => tc.status === 'blocked').length,
          skipped: suiteTestCases.filter(tc => tc.status === 'skipped').length,
          automated: suiteTestCases.filter(tc => tc.execution_type === 'automated').length,
          manual: suiteTestCases.filter(tc => tc.execution_type === 'manual').length,
        };
      },
      
      getGlobalStats: () => {
        const { testCases } = get();
        
        return {
          total: testCases.length,
          passed: testCases.filter(tc => tc.status === 'passed').length,
          failed: testCases.filter(tc => tc.status === 'failed').length,
          blocked: testCases.filter(tc => tc.status === 'blocked').length,
          skipped: testCases.filter(tc => tc.status === 'skipped').length,
          automated: testCases.filter(tc => tc.execution_type === 'automated').length,
          manual: testCases.filter(tc => tc.execution_type === 'manual').length,
          highImportance: testCases.filter(tc => tc.importance === 'high').length,
          mediumImportance: testCases.filter(tc => tc.importance === 'medium').length,
          lowImportance: testCases.filter(tc => tc.importance === 'low').length,
        };
      },
    }),
    {
      name: 'test-case-store',
      partialize: (state) => ({
        selectedTestSuite: state.selectedTestSuite,
        selectedTestCase: state.selectedTestCase,
        searchQuery: state.searchQuery,
        filters: state.filters,
      }),
    }
  )
);

export default useTestCaseStore; 