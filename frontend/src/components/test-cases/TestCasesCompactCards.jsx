import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button, Badge } from '../ui';

const TestCasesCompactCards = ({ 
  testCases, 
  onView, 
  onEdit, 
  onDelete 
}) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {testCases.map((testCase) => (
        <div
          key={testCase.id}
          className="bg-white rounded-apple-lg shadow-apple-sm p-4 hover:shadow-apple-md transition-all duration-200 cursor-pointer group"
          onClick={() => onView(testCase)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-sf font-semibold text-apple-gray-7 text-sm line-clamp-2 leading-tight">
                {testCase.title}
              </h3>
              <p className="text-xs text-apple-gray-4 mt-1">
                #{testCase.id}
              </p>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="flex items-center gap-2 mb-3">
            <Badge 
              variant={getStatusBadgeVariant(testCase.status)} 
              size="sm"
              className="text-xs"
            >
              {getStatusText(testCase.status)}
            </Badge>
            <Badge 
              variant={getPriorityBadgeVariant(testCase.priority)} 
              size="sm"
              className="text-xs"
            >
              {getPriorityText(testCase.priority)}
            </Badge>
          </div>

          {/* Description */}
          {testCase.description && (
            <p className="text-xs text-apple-gray-5 line-clamp-2 mb-3">
              {testCase.description}
            </p>
          )}

          {/* Metadata */}
          <div className="space-y-1 text-xs text-apple-gray-4 mb-3">
            <div className="flex items-center justify-between">
              <span>Project:</span>
              <span className="font-medium text-apple-gray-6 truncate ml-2">
                {testCase.project_name || 'Unknown'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Suite:</span>
              <span className="font-medium text-apple-gray-6 truncate ml-2">
                {testCase.test_suite_name || 'No Suite'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-apple-gray-4">
              {new Date(testCase.updated_at).toLocaleDateString()}
            </span>
            
            {/* Actions - Hidden by default, shown on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                variant="ghost"
                size="sm"
                icon={<Eye className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onView(testCase);
                }}
                className="text-apple-gray-4 hover:text-apple-gray-6"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Edit className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(testCase);
                }}
                className="text-apple-gray-4 hover:text-apple-gray-6"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(testCase);
                }}
                className="text-apple-gray-4 hover:text-apple-gray-6"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCasesCompactCards; 