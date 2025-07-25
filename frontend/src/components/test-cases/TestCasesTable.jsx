import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Eye, Edit, Trash2, CheckSquare, Square, FileText } from 'lucide-react';
import { Button, Badge } from '../ui';

const TestCasesTable = ({ 
  testCases, 
  onView, 
  onEdit, 
  onDelete, 
  onSelect,
  selectedIds = [],
  sortBy = 'id',
  sortOrder = 'asc',
  onSort
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

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

  const getExecutionTypeText = (executionType) => {
    switch (executionType) {
      case 1: return 'Manual';
      case 2: return 'Automated';
      default: return 'Manual';
    }
  };

  const handleSort = (field) => {
    const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  };

  const handleSelect = (id) => {
    onSelect(id);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === testCases.length) {
      // Deselect all
      testCases.forEach(tc => onSelect(tc.id));
    } else {
      // Select all
      testCases.forEach(tc => {
        if (!selectedIds.includes(tc.id)) {
          onSelect(tc.id);
        }
      });
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp className="w-4 h-4 text-apple-gray-4" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-apple-blue" />
      : <ChevronDown className="w-4 h-4 text-apple-blue" />;
  };

  return (
    <div className="bg-white rounded-apple-lg shadow-apple-sm overflow-hidden border border-apple-gray-2">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-apple-gray-1/80 border-b border-apple-gray-2">
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-5 h-5 rounded border-2 border-apple-gray-3 hover:border-apple-blue transition-colors duration-200"
                  >
                    {selectedIds.length === testCases.length ? (
                      <CheckSquare className="w-4 h-4 text-apple-blue" />
                    ) : (
                      <Square className="w-4 h-4 text-apple-gray-5" />
                    )}
                  </button>
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                >
                  <span>ID</span>
                  <SortIcon field="id" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                >
                  <span>Title</span>
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                >
                  <span>Status</span>
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                >
                  <span>Priority</span>
                  <SortIcon field="priority" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('project_name')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                >
                  <span>Project</span>
                  <SortIcon field="project_name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('test_suite_name')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                >
                  <span>Test Suite</span>
                  <SortIcon field="test_suite_name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('updated_at')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                >
                  <span>Updated</span>
                  <SortIcon field="updated_at" />
                </button>
              </th>
              <th className="px-4 py-3 text-left w-20">
                <span className="font-sf font-semibold text-apple-gray-7">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase) => (
              <tr
                key={testCase.id}
                className={`border-b border-apple-gray-1 transition-all duration-200 ${
                  hoveredRow === testCase.id ? 'bg-apple-gray-1/50' : ''
                } ${selectedIds.includes(testCase.id) ? 'bg-apple-blue/5 border-apple-blue/20' : ''}`}
                onMouseEnter={() => setHoveredRow(testCase.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSelect(testCase.id)}
                    className="flex items-center justify-center w-5 h-5 rounded border-2 border-apple-gray-3 hover:border-apple-blue transition-colors duration-200"
                  >
                    {selectedIds.includes(testCase.id) ? (
                      <CheckSquare className="w-4 h-4 text-apple-blue" />
                    ) : (
                      <Square className="w-4 h-4 text-apple-gray-5" />
                    )}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span className="font-sf font-medium text-apple-gray-7">
                    #{testCase.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="max-w-xs">
                    <h3 className="font-sf font-semibold text-apple-gray-7 text-sm line-clamp-1">
                      {testCase.title}
                    </h3>
                    {testCase.description && (
                      <p className="text-xs text-apple-gray-5 line-clamp-1 mt-1">
                        {testCase.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge 
                    variant={getStatusBadgeVariant(testCase.status)} 
                    size="sm"
                  >
                    {getStatusText(testCase.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge 
                    variant={getPriorityBadgeVariant(testCase.priority)} 
                    size="sm"
                  >
                    {getPriorityText(testCase.priority)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <span className="font-sf text-sm text-apple-gray-6">
                    {testCase.project_name || 'Unknown'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-sf text-sm text-apple-gray-6">
                    {testCase.test_suite_name || 'No Suite'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-sf text-sm text-apple-gray-5">
                    {new Date(testCase.updated_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(testCase)}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(testCase)}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(testCase)}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-error hover:bg-error/10 transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {testCases.length === 0 && (
        <div className="px-4 py-12 text-center">
          <div className="text-apple-gray-4 mb-2">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-apple-gray-5 font-sf text-sm">No test cases found</p>
          <p className="text-apple-gray-4 font-sf text-xs mt-1">Create your first test case to get started</p>
        </div>
      )}
    </div>
  );
};

export default TestCasesTable; 