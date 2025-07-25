import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit, Trash2, ChevronUp, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { Button, Badge } from '../ui';
import VirtualList from '../ui/VirtualList';
import FilterCache, { debounce, throttle, memoize } from '../../utils/filterCache';

const TestCasesTableOptimized = ({
  testCases = [],
  onView,
  onEdit,
  onDelete,
  onSelect,
  selectedIds = [],
  sortBy = 'id',
  sortOrder = 'asc',
  onSort,
  className = ''
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [cache] = useState(() => new FilterCache(50));

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

  // Memoized filter cache key
  const cacheKey = useMemo(() => {
    return cache.generateKey({}, testCases);
  }, [testCases, cache]);

  // Cached filtered results
  const filteredTestCases = useMemo(() => {
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached.value;
    }

    const result = sortedTestCases;
    cache.set(cacheKey, result);
    return result;
  }, [sortedTestCases, cacheKey, cache]);

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

  // Memoized row renderer
  const renderRow = useCallback((testCase, index) => {
    const isSelected = selectedIds.includes(testCase.id);
    const isHovered = hoveredRow === testCase.id;

    return (
      <motion.div
        key={testCase.id}
        className={`flex items-center gap-4 px-4 py-3 border-b border-apple-gray-2 hover:bg-apple-gray-1/50 transition-colors ${
          isSelected ? 'bg-apple-blue/5 border-apple-blue/20' : ''
        }`}
        onMouseEnter={() => setHoveredRow(testCase.id)}
        onMouseLeave={() => setHoveredRow(null)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.01 }}
      >
        {/* Selection Checkbox */}
        <div className="flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect?.(testCase.id)}
            className="h-4 w-4 p-0"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-apple-blue" />
            ) : (
              <Square className="w-4 h-4 text-apple-gray-4" />
            )}
          </Button>
        </div>

        {/* ID */}
        <div className="w-16 flex-shrink-0">
          <span className="text-sm font-sf font-medium text-apple-gray-7">
            #{testCase.id}
          </span>
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-sf font-medium text-apple-gray-7 truncate">
            {testCase.title}
          </div>
          {testCase.description && (
            <div className="text-xs text-apple-gray-5 truncate mt-1">
              {testCase.description}
            </div>
          )}
        </div>

        {/* Project */}
        <div className="w-32 flex-shrink-0">
          <span className="text-sm text-apple-gray-6 truncate">
            {testCase.project_name || 'N/A'}
          </span>
        </div>

        {/* Test Suite */}
        <div className="w-40 flex-shrink-0">
          <span className="text-sm text-apple-gray-6 truncate">
            {testCase.test_suite_name || 'N/A'}
          </span>
        </div>

        {/* Status */}
        <div className="w-20 flex-shrink-0">
          <Badge
            variant={getStatusBadgeVariant(testCase.status)}
            size="sm"
          >
            {getStatusText(testCase.status)}
          </Badge>
        </div>

        {/* Priority */}
        <div className="w-20 flex-shrink-0">
          <Badge
            variant={getPriorityBadgeVariant(testCase.priority)}
            size="sm"
          >
            {getPriorityText(testCase.priority)}
          </Badge>
        </div>

        {/* Actions */}
        <div className="w-24 flex-shrink-0">
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onView?.(testCase)}
                  className="h-7 w-7 p-0"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(testCase)}
                  className="h-7 w-7 p-0"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(testCase)}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }, [selectedIds, hoveredRow, onSelect, onView, onEdit, onDelete]);

  // Memoized header renderer
  const renderHeader = useCallback(() => (
    <div className="flex items-center gap-4 px-4 py-3 bg-apple-gray-1/50 border-b border-apple-gray-2 font-sf font-medium text-sm text-apple-gray-7">
      {/* Selection */}
      <div className="w-4 flex-shrink-0" />
      
      {/* ID */}
      <div className="w-16 flex-shrink-0">
        <button
          onClick={() => handleSort('id')}
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors"
        >
          ID
          {sortBy === 'id' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Title */}
      <div className="flex-1">
        <button
          onClick={() => handleSort('title')}
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors"
        >
          Title
          {sortBy === 'title' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Project */}
      <div className="w-32 flex-shrink-0">
        <button
          onClick={() => handleSort('project_name')}
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors"
        >
          Project
          {sortBy === 'project_name' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Test Suite */}
      <div className="w-40 flex-shrink-0">
        <button
          onClick={() => handleSort('test_suite_name')}
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors"
        >
          Test Suite
          {sortBy === 'test_suite_name' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Status */}
      <div className="w-20 flex-shrink-0">
        <button
          onClick={() => handleSort('status')}
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors"
        >
          Status
          {sortBy === 'status' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Priority */}
      <div className="w-20 flex-shrink-0">
        <button
          onClick={() => handleSort('priority')}
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors"
        >
          Priority
          {sortBy === 'priority' && (
            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Actions */}
      <div className="w-24 flex-shrink-0">
        Actions
      </div>
    </div>
  ), [sortBy, sortOrder, handleSort]);

  return (
    <div className={`bg-white border border-apple-gray-2 rounded-apple-lg overflow-hidden ${className}`}>
      {/* Header */}
      {renderHeader()}

      {/* Virtual List */}
      <VirtualList
        items={filteredTestCases}
        itemHeight={72}
        containerHeight={600}
        overscan={10}
        renderItem={renderRow}
        onScroll={handleScroll}
        className="scrollbar-thin scrollbar-thumb-apple-gray-3 scrollbar-track-transparent"
      />

      {/* Footer with stats */}
      <div className="px-4 py-3 bg-apple-gray-1/30 border-t border-apple-gray-2">
        <div className="flex items-center justify-between text-xs text-apple-gray-5">
          <span>
            Showing {filteredTestCases.length} of {testCases.length} test cases
          </span>
          <span>
            Cache: {cache.getStats().size}/{cache.getStats().maxSize} entries
          </span>
        </div>
      </div>
    </div>
  );
};

// Helper functions (memoized)
const getStatusBadgeVariant = memoize((status) => {
  switch (status) {
    case 1: return 'success'; // Pass
    case 2: return 'danger';  // Fail
    case 3: return 'warning'; // Block
    case 4: return 'secondary'; // Draft
    case 5: return 'info';    // In Progress
    default: return 'secondary';
  }
});

const getStatusText = memoize((status) => {
  switch (status) {
    case 1: return 'Pass';
    case 2: return 'Fail';
    case 3: return 'Block';
    case 4: return 'Draft';
    case 5: return 'In Progress';
    default: return 'Unknown';
  }
});

const getPriorityBadgeVariant = memoize((priority) => {
  switch (priority) {
    case 1: return 'danger';   // High
    case 2: return 'warning';  // Medium
    case 3: return 'success';  // Low
    default: return 'secondary';
  }
});

const getPriorityText = memoize((priority) => {
  switch (priority) {
    case 1: return 'High';
    case 2: return 'Medium';
    case 3: return 'Low';
    default: return 'Unknown';
  }
});

export default TestCasesTableOptimized; 