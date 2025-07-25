import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Eye, Edit, Trash2, CheckSquare, Square } from 'lucide-react';
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
    <div className="bg-white rounded-apple-lg shadow-apple-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-apple-gray-1 border-b border-apple-gray-2">
            <tr>
              <th className="px-4 py-3 text-left">
                <div className="flex items-center">
                  <button
                    onClick={handleSelectAll}
                    className="mr-2 text-apple-gray-4 hover:text-apple-gray-6"
                  >
                    {selectedIds.length === testCases.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('id')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9"
                >
                  <span>ID</span>
                  <SortIcon field="id" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('title')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9"
                >
                  <span>Title</span>
                  <SortIcon field="title" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('status')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9"
                >
                  <span>Status</span>
                  <SortIcon field="status" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('priority')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9"
                >
                  <span>Priority</span>
                  <SortIcon field="priority" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('project_name')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9"
                >
                  <span>Project</span>
                  <SortIcon field="project_name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('test_suite_name')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9"
                >
                  <span>Test Suite</span>
                  <SortIcon field="test_suite_name" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('updated_at')}
                  className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9"
                >
                  <span>Updated</span>
                  <SortIcon field="updated_at" />
                </button>
              </th>
              <th className="px-4 py-3 text-left w-16">
                <span className="font-sf font-semibold text-apple-gray-7">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((testCase) => (
              <tr
                key={testCase.id}
                className={`border-b border-apple-gray-1 transition-colors duration-200 ${
                  hoveredRow === testCase.id ? 'bg-apple-gray-1/50' : ''
                } ${selectedIds.includes(testCase.id) ? 'bg-apple-blue/5' : ''}`}
                onMouseEnter={() => setHoveredRow(testCase.id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleSelect(testCase.id)}
                    className="text-apple-gray-4 hover:text-apple-gray-6"
                  >
                    {selectedIds.includes(testCase.id) ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
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
                      <p className="text-xs text-apple-gray-4 line-clamp-1 mt-1">
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
                  <span className="font-sf text-sm text-apple-gray-4">
                    {new Date(testCase.updated_at).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-3 h-3" />}
                      onClick={() => onView(testCase)}
                      className="text-apple-gray-4 hover:text-apple-gray-6"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit className="w-3 h-3" />}
                      onClick={() => onEdit(testCase)}
                      className="text-apple-gray-4 hover:text-apple-gray-6"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="w-3 h-3" />}
                      onClick={() => onDelete(testCase)}
                      className="text-apple-gray-4 hover:text-apple-gray-6"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {testCases.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-apple-gray-4 font-sf">No test cases found</p>
        </div>
      )}
    </div>
  );
};

export default TestCasesTable; 