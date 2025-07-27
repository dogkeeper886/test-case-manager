import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Kanban, 
  Calendar,
  BarChart3,
  Settings,
  Download,
  Upload,
  Trash2,
  Eye,
  Edit,
  Copy,
  CheckSquare,
  Square,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Monitor,
  Activity,
  CheckCircle,
  XCircle,
  FileDown,
  Trash
} from 'lucide-react';
import { Button, Badge, Card, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import { TestCasesTable } from '../components/test-cases';
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
import { showSuccess, showError, showWarning, showInfo, dismissToast } from '../utils/toast';
import useOptimizedFilters from '../hooks/useOptimizedFilters';

const TestCases = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [testCases, setTestCases] = useState([]);
  const [totalTestCases, setTotalTestCases] = useState(0);
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
  const [showBulkActions, setShowBulkActions] = useState(false);

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
      setTotalTestCases(testCasesRes.data.total || (testCasesRes.data.data || testCasesRes.data).length);
      setTestSuites(testSuitesRes.data.data || testSuitesRes.data);
      setProjects(projectsRes.data.data || projectsRes.data);

      // Update store
      setStoreTestCases(testCasesRes.data.data || testCasesRes.data);
      setStoreTestSuites(testSuitesRes.data.data || testSuitesRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to load test cases. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to access test cases.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Optimized filtering with caching
  const { filteredItems: filteredTestCases, cacheStats } = useOptimizedFilters(testCases || [], {
    search: { query: searchQuery, field: searchField, operator: searchOperator },
    project: projectFilter,
    suite: suiteFilter,
    status: statusFilter,
    priority: priorityFilter,
    dates: dateFilters
  });



  // Sort filtered test cases
  const sortedTestCases = [...(filteredTestCases || [])].sort((a, b) => {
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
    navigate(`/testcases/${testCase.id}`);
  };

  const handleUpdateTestCase = async (testCaseId, updates) => {
    try {
      // Show loading state
      const loadingToastId = showWarning('Updating test case...', { autoClose: false });
      
      // Update the test case
      await testCasesAPI.update(testCaseId, updates);
      
      // Dismiss loading toast and show success
      dismissToast(loadingToastId);
      showSuccess('Test case updated successfully');
      
      // Refresh data
      await fetchData();
      
    } catch (err) {
      console.error('Error updating test case:', err);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to update test case. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Test case not found. It may have been deleted.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to update this test case.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showError(errorMessage);
      throw err; // Re-throw to let the inline edit component handle it
    }
  };

  const handleDeleteTestCase = async (testCase) => {
    // Enhanced confirmation dialog with more details
    const confirmMessage = `Are you sure you want to delete the test case "${testCase.title}"?\n\nThis action cannot be undone and will permanently remove:\n• Test case: ${testCase.title}\n• ID: ${testCase.id}\n• All associated data`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // Show loading state
        const loadingToastId = showWarning('Deleting test case...', { autoClose: false });
        
        // Delete the test case
        await testCasesAPI.delete(testCase.id);
        
        // Dismiss loading toast and show success
        dismissToast(loadingToastId);
        showSuccess(`Test case "${testCase.title}" deleted successfully`);
        
        // Refresh data
        await fetchData();
        
        // Clear selection if the deleted item was selected
        setSelectedIds(prev => prev.filter(id => id !== testCase.id));
        
      } catch (err) {
        console.error('Error deleting test case:', err);
        
        // Show specific error message based on error type
        let errorMessage = 'Failed to delete test case. Please try again.';
        
        if (err.response?.status === 404) {
          errorMessage = 'Test case not found. It may have already been deleted.';
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to delete this test case.';
        } else if (err.response?.status === 409) {
          errorMessage = 'Cannot delete test case. It may be referenced by other items.';
        } else if (err.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        showError(errorMessage);
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

  // New select all functionality
  const handleSelectAll = () => {
    const allIds = filteredTestCases.map(testCase => testCase.id);
    setSelectedIds(allIds);
    showInfo(`Selected all ${allIds.length} test cases`);
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
    showInfo('Deselected all test cases');
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === filteredTestCases.length) {
      handleDeselectAll();
    } else {
      handleSelectAll();
    }
  };

  // Check if all items are selected
  const isAllSelected = selectedIds.length === filteredTestCases.length && filteredTestCases.length > 0;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < filteredTestCases.length;

  // Show/hide bulk actions based on selection
  useEffect(() => {
    if (selectedIds.length > 0) {
      setShowBulkActions(true);
    } else {
      setShowBulkActions(false);
    }
  }, [selectedIds.length]);

  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) {
      showWarning('Please select test cases first.');
      return;
    }

    switch (action) {
      case 'view':
        // Handle single test case view
        if (selectedIds.length === 1) {
          const testCase = testCases.find(tc => tc.id === selectedIds[0]);
          if (testCase) {
            handleViewTestCase(testCase);
          }
        }
        break;
        
      case 'delete':
        const confirmMessage = `Are you sure you want to delete ${selectedIds.length} test case${selectedIds.length > 1 ? 's' : ''}?\n\nThis action cannot be undone and will permanently remove all selected test cases.`;
        
        if (window.confirm(confirmMessage)) {
          try {
            // Show loading state
            const loadingToastId = showWarning(`Deleting ${selectedIds.length} test case${selectedIds.length > 1 ? 's' : ''}...`, { autoClose: false });
            
            // Delete all selected test cases with individual error handling
            const deleteResults = await Promise.allSettled(
              selectedIds.map(id => testCasesAPI.delete(id))
            );
            
            // Count successful and failed deletions
            const successful = deleteResults.filter(result => result.status === 'fulfilled').length;
            const failed = deleteResults.filter(result => result.status === 'rejected').length;
            
            // Dismiss loading toast
            dismissToast(loadingToastId);
            
            // Show appropriate success/error message
            if (successful > 0 && failed === 0) {
              showSuccess(`Successfully deleted ${successful} test case${successful > 1 ? 's' : ''}`);
            } else if (successful > 0 && failed > 0) {
              showWarning(`Deleted ${successful} test case${successful > 1 ? 's' : ''}, but failed to delete ${failed} test case${failed > 1 ? 's' : ''}. Some test cases may have already been deleted.`);
            } else {
              showError(`Failed to delete any test cases. Please try again.`);
            }
            
            // Refresh data and clear selection
            await fetchData();
            setSelectedIds([]);
            setShowBulkActions(false);
            
          } catch (err) {
            console.error('Error during bulk delete:', err);
            
            // Show error message
            let errorMessage = `Failed to delete test cases. Please try again.`;
            
            if (err.response?.status === 403) {
              errorMessage = 'You do not have permission to delete some test cases.';
            } else if (err.response?.status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            
            showError(errorMessage);
          }
        }
        break;
        
      case 'export':
        // Implement bulk export
        showInfo(`Exporting ${selectedIds.length} test case${selectedIds.length > 1 ? 's' : ''}...`);
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
      if (!testCase) {
        showError('Test case not found.');
        return;
      }

      // Show loading state
      const loadingToastId = showInfo(`Updating status to ${newStatus}...`, { autoClose: false });

      // Update the test case status
      const updatedTestCase = { ...testCase, status: newStatus };
      await testCasesAPI.update(testCaseId, updatedTestCase);
      
      // Dismiss loading toast and show success
      dismissToast(loadingToastId);
      showSuccess(`Status updated to ${newStatus}`);
      
      // Refresh data
      await fetchData();
    } catch (err) {
      console.error('Error updating test case status:', err);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to update test case status. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Test case not found. It may have been deleted.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to update this test case.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showError(errorMessage);
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
      <Layout
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Test Cases', href: '/testcases' }
        ]}
        showSearch={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-apple-gray-4">Loading test cases...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Test Cases', href: '/testcases' }
        ]}
        showSearch={false}
      >
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
    <Layout
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Test Cases', href: '/testcases' }
      ]}
      showSearch={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between" data-testid="test-cases-header">
          <div>
            <h1 className="text-2xl font-sf font-bold text-apple-gray-7" data-testid="test-cases-title">Test Cases</h1>
            <p className="text-apple-gray-5 mt-1" data-testid="test-cases-count">
              Showing {filteredTestCases.length} of {totalTestCases} test cases
              {getActiveFiltersCount() > 0 && (
                <span className="ml-2 text-apple-blue">
                  (filtered)
                </span>
              )}
              {filteredTestCases.length !== testCases.length && getActiveFiltersCount() === 0 && (
                <span className="ml-2 text-apple-orange">
                  (sorted)
                </span>
              )}
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreateTestCase}
            data-testid="create-test-case-button"
          >
            Create Test Case
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6" data-testid="test-cases-controls">
          {/* View Toggle */}
          <ViewToggle
            currentView={viewMode}
            onViewChange={handleViewChange}
            className="flex-shrink-0"
            data-testid="view-toggle"
          />

          {/* Select All Toggle - Apple Design Guidelines */}
          {filteredTestCases.length > 0 && (
            <Button
              variant="ghost"
              icon={isAllSelected ? <CheckCircle className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              onClick={handleSelectAllToggle}
              className={`flex-shrink-0 transition-all duration-200 ${
                isAllSelected 
                  ? 'text-apple-blue bg-apple-blue/10 hover:bg-apple-blue/20' 
                  : isPartiallySelected 
                    ? 'text-apple-orange bg-apple-orange/10 hover:bg-apple-orange/20'
                    : 'text-apple-gray-5 hover:text-apple-gray-7 hover:bg-apple-gray-2'
              }`}
              data-testid="select-all-toggle"
            >
              {isAllSelected ? 'Deselect All' : isPartiallySelected ? 'Select All' : 'Select All'}
              {selectedIds.length > 0 && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-apple-blue/10 text-apple-blue rounded-full" data-testid="selected-count-badge">
                  {selectedIds.length}
                </span>
              )}
            </Button>
          )}

          {/* Filters Toggle */}
          <Button
            variant="ghost"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
            className="flex-shrink-0"
            data-testid="filters-toggle-button"
          >
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 px-2 py-1 text-xs font-medium bg-apple-blue/10 text-apple-blue rounded-full" data-testid="active-filters-count">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>

          {/* Performance Toggle */}
          <Button
            variant="ghost"
            onClick={() => setUseOptimizedTable(!useOptimizedTable)}
            className="flex-shrink-0"
            data-testid="table-optimization-toggle"
          >
            {useOptimizedTable ? 'Optimized' : 'Standard'} Table
          </Button>

          {/* Performance Monitor Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
            className="flex-shrink-0"
            data-testid="performance-monitor-toggle"
          >
            Performance
          </Button>

          {/* Performance Analytics Toggle */}
          <Button
            variant="ghost"
            onClick={() => setShowPerformanceAnalytics(!showPerformanceAnalytics)}
            className="flex-shrink-0"
            data-testid="performance-analytics-toggle"
          >
            Analytics
          </Button>
        </div>

        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="mb-6" data-testid="advanced-filter-panel">
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
              data-testid="filter-panel"
            />
          </div>
        )}

        {/* Bulk Actions - Fixed Position Overlay */}
        {selectedIds.length > 0 && (
          <div 
            className={`fixed top-20 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-apple-gray-2 shadow-apple-sm transition-all duration-300 ease-out ${
              showBulkActions ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
            data-testid="bulk-actions-bar"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex items-center gap-2 py-3">
                <span className="text-sm font-sf font-medium text-apple-gray-7" data-testid="selected-count">
                  {selectedIds.length} test case{selectedIds.length !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2 ml-auto" data-testid="bulk-action-buttons">
                  {/* View Button - Show only when single test case is selected */}
                  {selectedIds.length === 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={() => handleBulkAction('view')}
                      className="text-apple-blue hover:text-apple-blue/80 hover:bg-apple-blue/10"
                      data-testid="bulk-view-button"
                    >
                      View
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<FileDown className="w-4 h-4" />}
                    onClick={() => handleBulkAction('export')}
                    className="text-apple-gray-6 hover:text-apple-gray-7 hover:bg-apple-gray-1"
                    data-testid="bulk-export-button"
                  >
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash className="w-4 h-4" />}
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    data-testid="bulk-delete-button"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Test Cases Display */}
        {filteredTestCases.length === 0 ? (
          <Card elevation="sm" padding="xl" data-testid="empty-state-card">
            <Card.Body className="text-center py-12">
              <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2" data-testid="empty-state-title">
                No test cases found
              </h3>
              <p className="text-apple-gray-5" data-testid="empty-state-message">
                {getActiveFiltersCount() > 0
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first test case'}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <div data-testid="test-cases-display">
            {viewMode === 'table' && (
              useOptimizedTable ? (
                <TestCasesTableOptimized
                  testCases={sortedTestCases}
                  onSelect={handleSelect}
                  selectedIds={selectedIds}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  data-testid="test-cases-table-optimized"
                />
              ) : (
                <TestCasesTable
                  testCases={sortedTestCases}
                  onSelect={handleSelect}
                  selectedIds={selectedIds}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onUpdateTestCase={handleUpdateTestCase}
                  projects={projects}
                  testSuites={testSuites}
                  data-testid="test-cases-table"
                />
              )
            )}
            
            {viewMode === 'cards' && (
              <TestCasesCompactCards
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                data-testid="test-cases-cards"
              />
            )}
            
            {viewMode === 'kanban' && (
              <TestCasesKanban
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                onStatusChange={handleStatusChange}
                data-testid="test-cases-kanban"
              />
            )}
            
            {viewMode === 'timeline' && (
              <TestCasesTimeline
                testCases={sortedTestCases}
                onView={handleViewTestCase}
                onEdit={handleEditTestCase}
                onDelete={handleDeleteTestCase}
                data-testid="test-cases-timeline"
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