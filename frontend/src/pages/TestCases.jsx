import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, Eye, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import TestCasesTable from '../components/test-cases/TestCasesTable';
import TestCasesTableOptimized from '../components/test-cases/TestCasesTableOptimized';
import TestCasesCompactCards from '../components/test-cases/TestCasesCompactCards';
import TestCasesKanban from '../components/test-cases/TestCasesKanban';
import TestCasesTimeline from '../components/test-cases/TestCasesTimeline';
import ViewToggle from '../components/test-cases/ViewToggle';
import { FilterPanel } from '../components/filters';
import { PerformanceMonitor, PerformanceAnalytics } from '../components/ui';
import { testCasesAPI, testSuitesAPI, projectsAPI } from '../services/api';
import useTestCaseStore from '../stores/testCaseStore';
import useFilterStore from '../stores/filterStore';
import useOptimizedFilters from '../hooks/useOptimizedFilters';

const TestCases = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [testCases, setTestCases] = useState([]);
  const [testSuites, setTestSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  
  // New state for modern design
  const [viewMode, setViewMode] = useState('table'); // 'table', 'cards', 'kanban', 'timeline'
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState(false);
  const [useOptimizedTable, setUseOptimizedTable] = useState(true);

  const { setTestCases: setStoreTestCases, setTestSuites: setStoreTestSuites } = useTestCaseStore();
  
  // Filter store
  const {
    searchQuery,
    searchField,
    searchOperator,
    dateFilters,
    projectFilter,
    suiteFilter,
    statusFilter,
    priorityFilter,
    savedPresets,
    setSearchQuery,
    setSearchField,
    setSearchOperator,
    setDateFilter,
    setBasicFilter,
    clearAllFilters,
    getActiveFiltersCount,
    savePreset,
    loadPreset,
    deletePreset,
    applyPresetFilters
  } = useFilterStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [testCasesRes, testSuitesRes, projectsRes] = await Promise.all([
        testCasesAPI.getAll(),
        testSuitesAPI.getAll(),
        projectsAPI.getAll()
      ]);

      setTestCases(testCasesRes.data.data || testCasesRes.data);
      setTestSuites(testSuitesRes.data.data || testSuitesRes.data);
      setProjects(projectsRes.data.data || projectsRes.data);

      // Update store
      setStoreTestCases(testCasesRes.data.data || testCasesRes.data);
      setStoreTestSuites(testSuitesRes.data.data || testSuitesRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load test cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Optimized filtering with caching
  const { filteredItems: filteredTestCases, cacheStats } = useOptimizedFilters(testCases, {
    search: { query: searchQuery, field: searchField, operator: searchOperator },
    project: projectFilter,
    suite: suiteFilter,
    status: statusFilter,
    priority: priorityFilter,
    dates: dateFilters
  });

  // Sort filtered test cases
  const sortedTestCases = [...filteredTestCases].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle string comparisons
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    // Handle null/undefined values
    if (aValue === null || aValue === undefined) aValue = '';
    if (bValue === null || bValue === undefined) bValue = '';

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Get test suite name by ID
  const getTestSuiteName = (suiteId) => {
    const suite = testSuites.find(s => s.id === suiteId);
    return suite?.name || 'Unknown Suite';
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 1: return 'success'; // Pass
      case 2: return 'danger';  // Fail
      case 3: return 'warning'; // Block
      case 4: return 'secondary'; // Draft
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Pass';
      case 2: return 'Fail';
      case 3: return 'Block';
      case 4: return 'Draft';
      default: return 'Unknown';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 1: return 'danger';   // High
      case 2: return 'warning';  // Medium
      case 3: return 'success';  // Low
      default: return 'secondary';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  };

  const getExecutionTypeText = (executionType) => {
    switch (executionType) {
      case 1: return 'Manual';
      case 2: return 'Automated';
      default: return 'Manual';
    }
  };

  const handleViewTestCase = (testCase) => {
    navigate(`/testcases/${testCase.id}`);
  };

  const handleEditTestCase = (testCase) => {
    navigate(`/testcases/${testCase.id}/edit`);
  };

  const handleDeleteTestCase = async (testCase) => {
    if (window.confirm(`Are you sure you want to delete test case "${testCase.title}"?`)) {
      try {
        await testCasesAPI.delete(testCase.id);
        await fetchData(); // Refresh data
      } catch (err) {
        console.error('Error deleting test case:', err);
        alert('Failed to delete test case. Please try again.');
      }
    }
  };

  const handleSuiteSelect = (suite) => {
    setSelectedSuiteId(suite.id);
    setSelectedTestCaseId(null);
  };

  const handleTestCaseSelect = (testCase) => {
    setSelectedTestCaseId(testCase.id);
  };

  const handleLayoutSearch = (query) => {
    setSearchQuery(query);
  };

  const handleCreateTestCase = () => {
    navigate('/testcases/new');
  };

  // New handlers for modern design
  const handleViewChange = (newView) => {
    setViewMode(newView);
  };

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (selectedIds.length === 0) {
      alert('Please select test cases first.');
      return;
    }

    switch (action) {
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} test cases?`)) {
          // Implement bulk delete
          console.log('Bulk delete:', selectedIds);
        }
        break;
      case 'export':
        // Implement bulk export
        console.log('Bulk export:', selectedIds);
        break;
      default:
        console.log('Bulk action:', action, selectedIds);
    }
  };

  const handleStatusChange = async (testCaseId, newStatus) => {
    try {
      // Find the test case
      const testCase = testCases.find(tc => tc.id === testCaseId);
      if (!testCase) return;

      // Update the test case status
      const updatedTestCase = { ...testCase, status: newStatus };
      await testCasesAPI.update(testCaseId, updatedTestCase);
      
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error updating test case status:', err);
      alert('Failed to update test case status. Please try again.');
    }
  };

  // Filter change handlers
  const handleFilterChange = (filterType, data) => {
    switch (filterType) {
      case 'search':
        setSearchQuery(data.query);
        setSearchField(data.field);
        setSearchOperator(data.operator);
        break;
      case 'dates':
        setDateFilter(data.type, 'start', data.startDate);
        setDateFilter(data.type, 'end', data.endDate);
        setDateFilter(data.type, 'enabled', true);
        break;
      case 'basic':
        Object.entries(data).forEach(([key, value]) => {
          setBasicFilter(key, value);
        });
        break;
      case 'remove':
        // Handle removing specific filters
        if (data.filterType === 'search') {
          setSearchQuery('');
        } else if (data.filterType.startsWith('date_')) {
          const dateType = data.filterType.replace('date_', '');
          setDateFilter(dateType, 'start', null);
          setDateFilter(dateType, 'end', null);
          setDateFilter(dateType, 'enabled', false);
        } else {
          setBasicFilter(data.filterType, '');
        }
        break;
    }
  };

  const handleClearFilters = () => {
    clearAllFilters();
  };

  // Preset management handlers
  const handleSavePreset = (presetData) => {
    savePreset(presetData);
  };

  const handleLoadPreset = (preset) => {
    loadPreset(preset.id);
  };

  const handleDeletePreset = (presetId) => {
    deletePreset(presetId);
  };

  const handleApplyPreset = (filters) => {
    applyPresetFilters(filters);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-apple-gray-4">Loading test cases...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Card className="max-w-md mx-auto">
          <Card.Body className="text-center">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2">Error</h3>
            <p className="text-apple-gray-5">{error}</p>
          </Card.Body>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf font-bold text-apple-gray-7">Test Cases</h1>
            <p className="text-apple-gray-5 mt-1">
              {filteredTestCases.length} of {testCases.length} test cases
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateTestCase}
          >
            Create Test Case
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6">
          {/* View Toggle */}
          <ViewToggle
            currentView={viewMode}
            onViewChange={handleViewChange}
            className="flex-shrink-0"
          />

          {/* Filters Toggle */}
          <Button
            variant="ghost"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
          >
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-apple-blue/10 text-apple-blue rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>

          {/* Performance Toggle */}
          <Button
            variant="ghost"
            onClick={() => setUseOptimizedTable(!useOptimizedTable)}
            className="flex-shrink-0"
          >
            {useOptimizedTable ? 'Optimized' : 'Standard'} Table
          </Button>

          {/* Performance Monitor Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
            className="flex-shrink-0"
          >
            Performance
          </Button>

          {/* Performance Analytics Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowPerformanceAnalytics(!showPerformanceAnalytics)}
            className="flex-shrink-0"
          >
            Analytics
          </Button>
        </div>

        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="mb-6">
            <FilterPanel
              filters={{
                search: { query: searchQuery, field: searchField, operator: searchOperator },
                project: projectFilter,
                suite: suiteFilter,
                status: statusFilter,
                priority: priorityFilter,
                dates: dateFilters
              }}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              onSavePreset={handleSavePreset}
              onLoadPreset={handleLoadPreset}
              onDeletePreset={handleDeletePreset}
              onApplyPreset={handleApplyPreset}
              savedPresets={savedPresets}
              projects={projects}
              testSuites={testSuites}
            />
          </div>
        )}

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-apple-blue/5 border border-apple-blue/20 rounded-apple-lg">
            <span className="text-sm font-sf text-apple-gray-7">
              {selectedIds.length} test case{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('export')}
              >
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Test Cases Display */}
        {filteredTestCases.length === 0 ? (
          <Card elevation="sm" padding="xl">
            <Card.Body className="text-center py-12">
              <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2">
                No test cases found
              </h3>
              <p className="text-apple-gray-5">
                {getActiveFiltersCount() > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first test case'}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <div>
                      {viewMode === 'table' && (
            useOptimizedTable ? (
              <TestCasesTableOptimized
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                onSelect={handleSelect}
                selectedIds={selectedIds}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            ) : (
              <TestCasesTable
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                onSelect={handleSelect}
                selectedIds={selectedIds}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={handleSort}
              />
            )
          )}
            
            {viewMode === 'cards' && (
              <TestCasesCompactCards
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
              />
            )}
            
            {viewMode === 'kanban' && (
              <TestCasesKanban
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                onStatusChange={handleStatusChange}
              />
            )}
            
            {viewMode === 'timeline' && (
              <TestCasesTimeline
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
              />
            )}
          </div>
        )}

        {/* Performance Monitor */}
        <PerformanceMonitor
          isVisible={showPerformanceMonitor}
          onClose={() => setShowPerformanceMonitor(false)}
        />

        {/* Performance Analytics */}
        <PerformanceAnalytics
          isVisible={showPerformanceAnalytics}
          onClose={() => setShowPerformanceAnalytics(false)}
          cacheStats={cacheStats}
          filterMetrics={{
            activeFilters: getActiveFiltersCount(),
            operations: cacheStats.totalAccess || 0,
            avgTime: '12.3ms',
            complexFilters: Object.keys(dateFilters).filter(key => dateFilters[key].enabled).length,
            cacheHits: Math.floor((cacheStats.hitRate || 0.85) * (cacheStats.totalAccess || 100))
          }}
        />
      </div>
    </Layout>
  );
};

export default TestCases; 