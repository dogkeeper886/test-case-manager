import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square } from 'lucide-react';
import { Badge } from '../ui';
import { htmlToText, getHtmlPreview, containsHtml } from '../../utils/htmlToText';

const TestCasesCompactCards = ({ 
  testCases = [],
  onView, 
  onSelect,
  selectedIds = [],
  className = ''
}) => {
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

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {testCases.map((testCase, index) => (
        <motion.div
          key={testCase.id}
          className={`group bg-white border rounded-apple-lg p-4 hover:shadow-apple-md transition-all duration-200 cursor-pointer ${
            selectedIds.includes(testCase.id) 
              ? 'border-apple-blue bg-apple-blue/5 shadow-apple-md' 
              : 'border-apple-gray-2 hover:border-apple-blue/50'
          }`}
          onClick={(e) => {
            // Don't trigger card click if clicking on selection checkbox
            if (e.target.closest('[data-testid*="select"]')) {
              return;
            }
            onView?.(testCase);
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -2 }}
          data-testid={`test-case-card-${testCase.id}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            {/* Selection Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(testCase.id);
              }}
              className="flex items-center justify-center w-5 h-5 rounded border-2 border-apple-gray-3 hover:border-apple-blue transition-colors duration-200 mr-3 mt-1"
              data-testid={`select-checkbox-${testCase.id}`}
              aria-label={`Select test case ${testCase.id}`}
            >
              {selectedIds.includes(testCase.id) ? (
                <CheckSquare className="w-4 h-4 text-apple-blue" />
              ) : (
                <Square className="w-4 h-4 text-apple-gray-5" />
              )}
            </button>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-sf font-semibold text-apple-gray-7 text-sm line-clamp-2 mb-1">
                {testCase.title}
              </h3>
              <p className="text-xs text-apple-gray-5 font-sf">
                #{testCase.id}
              </p>
            </div>
          </div>

          {/* Description */}
          {testCase.description && (
            <p 
              className="text-xs text-apple-gray-5 line-clamp-2 mb-3"
              title={containsHtml(testCase.description) ? getHtmlPreview(testCase.description) : testCase.description}
              data-testid={`test-case-description-${testCase.id}`}
            >
              {containsHtml(testCase.description) 
                ? htmlToText(testCase.description, 80) 
                : testCase.description.length > 80 
                  ? testCase.description.substring(0, 80) + '...' 
                  : testCase.description
              }
            </p>
          )}

          {/* Status and Priority */}
          <div className="flex items-center gap-2 mb-3">
            <Badge
              variant={getStatusBadgeVariant(testCase.status)}
              size="sm"
            >
              {getStatusText(testCase.status)}
            </Badge>
            <Badge
              variant={getPriorityBadgeVariant(testCase.priority)}
              size="sm"
            >
              {getPriorityText(testCase.priority)}
            </Badge>
          </div>

          {/* Metadata */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-apple-gray-5">Project:</span>
              <span className="text-apple-gray-6 font-medium truncate ml-2">
                {testCase.project_name || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-apple-gray-5">Suite:</span>
              <span className="text-apple-gray-6 font-medium truncate ml-2">
                {testCase.test_suite_name || 'No Suite'}
              </span>
          </div>
        </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TestCasesCompactCards; 