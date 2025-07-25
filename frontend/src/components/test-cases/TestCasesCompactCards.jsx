import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button, Badge } from '../ui';

const TestCasesCompactCards = ({ 
  testCases = [],
  onView, 
  onEdit, 
  onDelete,
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
          className="group bg-white border border-apple-gray-2 rounded-apple-lg p-4 hover:shadow-apple-md transition-all duration-200 cursor-pointer"
          onClick={() => onView?.(testCase)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -2 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-sf font-semibold text-apple-gray-7 text-sm line-clamp-2 mb-1">
                {testCase.title}
              </h3>
              <p className="text-xs text-apple-gray-5 font-sf">
                #{testCase.id}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(testCase);
                }}
                className="h-7 w-7 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
              >
                <Eye className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(testCase);
                }}
                className="h-7 w-7 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(testCase);
                }}
                className="h-7 w-7 p-0 text-apple-gray-5 hover:text-error hover:bg-error/10 transition-all duration-200"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Description */}
          {testCase.description && (
            <p className="text-xs text-apple-gray-5 line-clamp-2 mb-3">
              {testCase.description}
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