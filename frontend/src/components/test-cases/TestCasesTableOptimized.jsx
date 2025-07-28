import React, { useState, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown, CheckSquare, Square, FileText, CheckCircle, Minus } from 'lucide-react';
import { Button, Badge } from '../ui';
import VirtualList from '../ui/VirtualList';
import { debounce, throttle } from '../../utils/filterCache';
import { htmlToText, getHtmlPreview, containsHtml } from '../../utils/htmlToText';

const TestCasesTableOptimized = ({
  testCases = [],
  onSelect,
  selectedIds = [],
  sortBy = 'id',
  sortOrder = 'asc',
  onSort,
  className = ''
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  // Memoized sorting function
  const sortedTestCases = useMemo(() => {
    const sorted = [...testCases].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [testCases, sortBy, sortOrder]);

  // Filtered results (no caching)
  const filteredTestCases = useMemo(() => {
    return sortedTestCases;
  }, [sortedTestCases]);

  // Select all functionality
  const isAllSelected = selectedIds.length === filteredTestCases.length && filteredTestCases.length > 0;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < filteredTestCases.length;

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      // Deselect all
      filteredTestCases.forEach(testCase => {
        if (selectedIds.includes(testCase.id)) {
          onSelect(testCase.id);
        }
      });
    } else {
      // Select all
      filteredTestCases.forEach(testCase => {
        if (!selectedIds.includes(testCase.id)) {
          onSelect(testCase.id);
        }
      });
    }
  }, [isAllSelected, filteredTestCases, selectedIds, onSelect]);

  // Debounced sort handler
  const handleSort = useCallback(
    debounce((field) => {
      const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
      onSort?.(field, newOrder);
    }, 100),
    [sortBy, sortOrder, onSort]
  );

  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle((scrollTop) => {
      // Could implement infinite scrolling here
      console.log('Scrolled to:', scrollTop);
    }, 100),
    []
  );

  // Helper functions for status and priority
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 1: return 'success'; // Pass
      case 2: return 'error';  // Fail
      case 3: return 'warning'; // Block
      case 4: return 'default'; // Draft
      default: return 'default';
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
      case 1: return 'error';   // High
      case 2: return 'warning';  // Medium
      case 3: return 'success';  // Low
      default: return 'default';
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

  // Memoized row renderer
  const renderRow = useCallback((testCase, index) => {
    const isSelected = selectedIds.includes(testCase.id);
    const isHovered = hoveredRow === testCase.id;

    return (
                <div
            key={testCase.id}
            data-testid={`test-case-row-optimized-${testCase.id}`}
            className={`flex items-center gap-4 px-4 py-3 border-b transition-all duration-200 ease-out h-12 cursor-pointer ${
              isSelected ? 'bg-apple-blue/5 border-apple-blue/20' : 'border-apple-gray-2'
            } ${
              isHovered ? 'shadow-apple-md border-apple-blue/50 -translate-y-0.5' : ''
            }`}
            onMouseEnter={() => setHoveredRow(testCase.id)}
            onMouseLeave={() => setHoveredRow(null)}
            onClick={(e) => {
              // Don't trigger row click if clicking on selection checkbox
              if (e.target.closest('[data-testid*="select"]')) {
                return;
              }
              // Navigate to test case detail page
              window.location.href = `/testcases/${testCase.id}`;
            }}
          >
        {/* Selection Checkbox */}
        <div className="flex-shrink-0" data-testid={`test-case-select-optimized-${testCase.id}`}>
          <button
            onClick={() => onSelect?.(testCase.id)}
            className="flex items-center justify-center w-5 h-5 rounded-apple border-2 border-apple-gray-3 hover:border-apple-blue transition-all duration-200 ease-out focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1"
            data-testid={`select-checkbox-optimized-${testCase.id}`}
            aria-label={`Select test case ${testCase.id}`}
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-apple-blue" />
            ) : (
              <Square className="w-4 h-4 text-apple-gray-5" />
            )}
          </button>
        </div>

        {/* ID */}
        <div className="w-16 flex-shrink-0" data-testid={`test-case-id-optimized-${testCase.id}`}>
          <span className="text-sm font-sf font-medium text-apple-gray-7">
            #{testCase.id}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0" data-testid={`test-case-title-optimized-${testCase.id}`}>
          <div className="text-sm font-sf font-medium text-apple-gray-7 truncate">
            {testCase.title}
          </div>
          {testCase.description && (
            <div 
              className="text-xs text-apple-gray-5 truncate mt-1"
              title={containsHtml(testCase.description) ? getHtmlPreview(testCase.description) : testCase.description}
              data-testid={`test-case-description-optimized-${testCase.id}`}
            >
              {containsHtml(testCase.description) 
                ? htmlToText(testCase.description, 80) 
                : testCase.description.length > 80 
                  ? testCase.description.substring(0, 80) + '...' 
                  : testCase.description
              }
            </div>
          )}
        </div>

        {/* Project */}
        <div className="w-32 flex-shrink-0" data-testid={`test-case-project-optimized-${testCase.id}`}>
          <span className="text-sm text-apple-gray-6 truncate">
            {testCase.project_name || 'N/A'}
          </span>
        </div>

        {/* Test Suite */}
        <div className="w-40 flex-shrink-0" data-testid={`test-case-suite-optimized-${testCase.id}`}>
          <span className="text-sm text-apple-gray-6 truncate">
            {testCase.test_suite_name || 'N/A'}
          </span>
        </div>

        {/* Status */}
        <div className="w-20 flex-shrink-0" data-testid={`test-case-status-optimized-${testCase.id}`}>
          <Badge
            variant={getStatusBadgeVariant(testCase.status)}
            size="sm"
            data-testid={`status-badge-optimized-${testCase.id}`}
          >
            {getStatusText(testCase.status)}
          </Badge>
        </div>

        {/* Priority */}
        <div className="w-20 flex-shrink-0" data-testid={`test-case-priority-optimized-${testCase.id}`}>
          <Badge
            variant={getPriorityBadgeVariant(testCase.priority)}
            size="sm"
            data-testid={`priority-badge-optimized-${testCase.id}`}
          >
            {getPriorityText(testCase.priority)}
          </Badge>
        </div>


      </div>
    );
  }, [selectedIds, hoveredRow, onSelect]);

  // Memoized header renderer
  const renderHeader = useCallback(() => (
    <div className="flex items-center gap-4 px-4 py-3 bg-apple-gray-1/60 border-b border-apple-gray-2 font-sf font-semibold text-sm text-apple-gray-6" data-testid="optimized-table-header">
      {/* Selection - Apple Design Guidelines */}
      <div className="w-5 flex-shrink-0 flex items-center justify-center" data-testid="selection-header-optimized">
        <button
          onClick={handleSelectAll}
          className={`p-1 rounded-apple transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 ${
            isAllSelected 
              ? 'text-apple-blue bg-apple-blue/10 hover:bg-apple-blue/20' 
              : isPartiallySelected 
                ? 'text-apple-orange bg-apple-orange/10 hover:bg-apple-orange/20'
                : 'text-apple-gray-4 hover:text-apple-gray-6 hover:bg-apple-gray-2'
          }`}
          data-testid="select-all-header-button"
          aria-label={isAllSelected ? 'Deselect all test cases' : 'Select all test cases'}
        >
          {isAllSelected ? (
            <CheckCircle className="w-4 h-4" />
          ) : isPartiallySelected ? (
            <Minus className="w-4 h-4" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* ID */}
      <div className="w-16 flex-shrink-0" data-testid="id-header-optimized">
        <button
          onClick={() => handleSort('id')}
          className="flex items-center gap-1 hover:text-apple-gray-7 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 rounded-apple px-1 py-1"
          data-testid="sort-id-button-optimized"
        >
          ID
          {sortBy === 'id' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Title */}
      <div className="flex-1" data-testid="title-header-optimized">
        <button
          onClick={() => handleSort('title')}
          className="flex items-center gap-1 hover:text-apple-gray-7 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 rounded-apple px-1 py-1"
          data-testid="sort-title-button-optimized"
        >
          Title
          {sortBy === 'title' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Project */}
      <div className="w-32 flex-shrink-0" data-testid="project-header-optimized">
        <button
          onClick={() => handleSort('project_name')}
          className="flex items-center gap-1 hover:text-apple-gray-7 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 rounded-apple px-1 py-1"
          data-testid="sort-project-button-optimized"
        >
          Project
          {sortBy === 'project_name' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Test Suite */}
      <div className="w-40 flex-shrink-0" data-testid="suite-header-optimized">
        <button
          onClick={() => handleSort('test_suite_name')}
          className="flex items-center gap-1 hover:text-apple-gray-7 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 rounded-apple px-1 py-1"
          data-testid="sort-suite-button-optimized"
        >
          Test Suite
          {sortBy === 'test_suite_name' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="w-20 flex-shrink-0" data-testid="status-header-optimized">
        <button
          onClick={() => handleSort('status')}
          className="flex items-center gap-1 hover:text-apple-gray-7 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 rounded-apple px-1 py-1"
          data-testid="sort-status-button-optimized"
        >
          Status
          {sortBy === 'status' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Priority */}
      <div className="w-20 flex-shrink-0" data-testid="priority-header-optimized">
        <button
          onClick={() => handleSort('priority')}
          className="flex items-center gap-1 hover:text-apple-gray-7 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 rounded-apple px-1 py-1"
          data-testid="sort-priority-button-optimized"
        >
          Priority
          {sortBy === 'priority' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>


    </div>
  ), [sortBy, sortOrder, handleSort, isAllSelected, isPartiallySelected, handleSelectAll]);

  return (
    <div className={`bg-white border border-apple-gray-2 rounded-apple-lg overflow-hidden ${className}`} data-testid="test-cases-table-optimized-container">
      {/* Header */}
      <div data-testid="test-cases-table-optimized-header">
        {renderHeader()}
      </div>

      {/* Virtual List */}
      {filteredTestCases.length > 0 ? (
        <div data-testid="test-cases-virtual-list">
          <VirtualList
            items={filteredTestCases}
            itemHeight={72}
            containerHeight={600}
            overscan={10}
            renderItem={renderRow}
            onScroll={handleScroll}
            className="scrollbar-thin scrollbar-thumb-apple-gray-3 scrollbar-track-transparent"
            autoScrollOnDataChange={false}
          />
        </div>
      ) : (
        <div className="px-4 py-12 text-center" data-testid="empty-table-state-optimized">
          <div className="text-apple-gray-4 mb-2">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-apple-gray-5 font-sf text-sm" data-testid="empty-table-message-optimized">No test cases found</p>
          <p className="text-apple-gray-4 font-sf text-xs mt-1" data-testid="empty-table-subtitle-optimized">Create your first test case to get started</p>
        </div>
      )}

      {/* Footer with stats */}
      <div className="px-4 py-3 bg-apple-gray-1/30 border-t border-apple-gray-2" data-testid="table-footer-optimized">
        <div className="flex items-center justify-between text-xs text-apple-gray-5">
          <span data-testid="test-cases-count-optimized">
            Showing {filteredTestCases.length} of {testCases.length} test cases
          </span>

        </div>
      </div>
    </div>
  );
};

export default TestCasesTableOptimized; 