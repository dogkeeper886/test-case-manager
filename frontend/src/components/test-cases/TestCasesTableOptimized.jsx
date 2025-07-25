import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit, Trash2, ChevronUp, ChevronDown, CheckSquare, Square, FileText } from 'lucide-react';
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
      <motion.div
        key={testCase.id}
        className={`flex items-center gap-4 px-4 py-3 border-b border-apple-gray-2 hover:bg-apple-gray-1/50 transition-all duration-200 ${
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
          <button
            onClick={() => onSelect?.(testCase.id)}
            className="flex items-center justify-center w-5 h-5 rounded border-2 border-apple-gray-3 hover:border-apple-blue transition-colors duration-200"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-apple-blue" />
            ) : (
              <Square className="w-4 h-4 text-apple-gray-5" />
            )}
          </button>
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
                  className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(testCase)}
                  className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(testCase)}
                  className="h-8 w-8 p-0 text-apple-gray-5 hover:text-error hover:bg-error/10 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
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
    <div className="flex items-center gap-4 px-4 py-3 bg-apple-gray-1/80 border-b border-apple-gray-2 font-sf font-medium text-sm text-apple-gray-7">
      {/* Selection */}
      <div className="w-5 flex-shrink-0" />
      
      {/* ID */}
      <div className="w-16 flex-shrink-0">
        <button
          onClick={() => handleSort('id')}
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors duration-200"
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
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors duration-200"
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
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors duration-200"
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
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors duration-200"
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
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors duration-200"
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
          className="flex items-center gap-1 hover:text-apple-gray-8 transition-colors duration-200"
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
      {filteredTestCases.length > 0 ? (
      <VirtualList
        items={filteredTestCases}
        itemHeight={72}
        containerHeight={600}
        overscan={10}
        renderItem={renderRow}
        onScroll={handleScroll}
        className="scrollbar-thin scrollbar-thumb-apple-gray-3 scrollbar-track-transparent"
      />
      ) : (
        <div className="px-4 py-12 text-center">
          <div className="text-apple-gray-4 mb-2">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-apple-gray-5 font-sf text-sm">No test cases found</p>
          <p className="text-apple-gray-4 font-sf text-xs mt-1">Create your first test case to get started</p>
        </div>
      )}

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

export default TestCasesTableOptimized; 