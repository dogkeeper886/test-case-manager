import React, { useState } from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, CheckSquare, Square, FileText, CheckCircle, Minus, Edit, X } from 'lucide-react';
import { Button, Badge } from '../ui';
import { htmlToText, getHtmlPreview, containsHtml } from '../../utils/htmlToText';
import { InlineEditInput, InlineEditSelect, InlineEditTextarea, InlineEditBadge } from './index';

const TestCasesTable = ({ 
  testCases, 
  onSelect,
  selectedIds = [],
  sortBy = 'id',
  sortOrder = 'asc',
  onSort,
  onUpdateTestCase,
  projects = [],
  testSuites = []
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [editingTestCaseId, setEditingTestCaseId] = useState(null);

  // Select all functionality
  const isAllSelected = selectedIds.length === testCases.length && testCases.length > 0;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < testCases.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      testCases.forEach(testCase => {
        if (selectedIds.includes(testCase.id)) {
          onSelect(testCase.id);
        }
      });
    } else {
      // Select all
      testCases.forEach(testCase => {
        if (!selectedIds.includes(testCase.id)) {
          onSelect(testCase.id);
        }
      });
    }
  };

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

  const handleStartEdit = (testCaseId) => {
    setEditingTestCaseId(testCaseId);
  };

  const handleCancelEdit = () => {
    setEditingTestCaseId(null);
  };

  const handleSaveEdit = async (field, value) => {
    if (!onUpdateTestCase) return;
    
    try {
      await onUpdateTestCase(editingTestCaseId, { [field]: value });
      setEditingTestCaseId(null);
    } catch (error) {
      console.error('Failed to update test case:', error);
      throw error;
    }
  };

  const isEditing = (testCaseId) => editingTestCaseId === testCaseId;

  const statusOptions = [
    { value: 1, label: 'Pass', variant: 'success' },
    { value: 2, label: 'Fail', variant: 'error' },
    { value: 3, label: 'Block', variant: 'warning' },
    { value: 4, label: 'Draft', variant: 'default' }
  ];

  const priorityOptions = [
    { value: 1, label: 'High', variant: 'error' },
    { value: 2, label: 'Medium', variant: 'warning' },
    { value: 3, label: 'Low', variant: 'success' }
  ];

  const projectOptions = projects.map(project => ({
    value: project.id,
    label: project.name
  }));

  const testSuiteOptions = testSuites.map(suite => ({
    value: suite.id,
    label: suite.name
  }));

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ChevronUp className="w-4 h-4 text-apple-gray-4" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-apple-blue" />
      : <ChevronDown className="w-4 h-4 text-apple-blue" />;
  };

  return (
    <div className="bg-white rounded-apple border border-apple-gray-2 shadow-apple-sm overflow-hidden" data-testid="test-cases-table">
      <table className="w-full">
        <thead>
          <tr className="bg-apple-gray-1/60 border-b border-apple-gray-2">
            {/* Selection Header - Apple Design Guidelines */}
            <th className="px-4 py-3 text-left" data-testid="selection-header">
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
            </th>
            
            {/* ID Header */}
            <th className="px-4 py-3 text-left font-sf font-semibold text-sm text-apple-gray-6" data-testid="id-header">
              <button
                onClick={() => handleSort('id')}
                className="flex items-center gap-1 hover:text-apple-gray-7 transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-1 rounded-apple px-1 py-1"
                data-testid="sort-id-button"
              >
                ID
                {sortBy === 'id' && (
                  sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                )}
              </button>
            </th>

            {/* Title Header */}
            <th className="px-4 py-3 text-left" data-testid="title-header">
              <button
                onClick={() => handleSort('title')}
                className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                data-testid="sort-title-button"
              >
                <span>Title</span>
                <SortIcon field="title" />
              </button>
            </th>
            {/* Status Header */}
            <th className="px-4 py-3 text-left" data-testid="status-header">
              <button
                onClick={() => handleSort('status')}
                className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                data-testid="sort-status-button"
              >
                <span>Status</span>
                <SortIcon field="status" />
              </button>
            </th>
            {/* Priority Header */}
            <th className="px-4 py-3 text-left" data-testid="priority-header">
              <button
                onClick={() => handleSort('priority')}
                className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                data-testid="sort-priority-button"
              >
                <span>Priority</span>
                <SortIcon field="priority" />
              </button>
            </th>
            {/* Project Header */}
            <th className="px-4 py-3 text-left" data-testid="project-header">
              <button
                onClick={() => handleSort('project_name')}
                className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                data-testid="sort-project-button"
              >
                <span>Project</span>
                <SortIcon field="project_name" />
              </button>
            </th>
            {/* Test Suite Header */}
            <th className="px-4 py-3 text-left" data-testid="suite-header">
              <button
                onClick={() => handleSort('test_suite_name')}
                className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                data-testid="sort-suite-button"
              >
                <span>Test Suite</span>
                <SortIcon field="test_suite_name" />
              </button>
            </th>
            {/* Updated Header */}
            <th className="px-4 py-3 text-left" data-testid="updated-header">
              <button
                onClick={() => handleSort('updated_at')}
                className="flex items-center space-x-1 font-sf font-semibold text-apple-gray-7 hover:text-apple-gray-9 transition-colors duration-200"
                data-testid="sort-updated-button"
              >
                <span>Updated</span>
                <SortIcon field="updated_at" />
              </button>
            </th>
            {/* Actions Header */}
            <th className="px-4 py-3 text-left" data-testid="actions-header">
              <span className="font-sf font-semibold text-apple-gray-7">Actions</span>
            </th>

          </tr>
        </thead>
        <tbody data-testid="test-cases-table-body">
          {testCases.map((testCase) => (
            <tr
              key={testCase.id}
              data-testid={`test-case-row-${testCase.id}`}
              className={`border-b border-apple-gray-1 transition-all duration-200 cursor-pointer ${
                hoveredRow === testCase.id ? 'bg-apple-gray-1/30' : 'hover:bg-apple-gray-1/20'
              } ${selectedIds.includes(testCase.id) ? 'bg-apple-blue/5 border-apple-blue/20' : ''}`}
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
              <td className="px-4 py-3" data-testid={`test-case-select-${testCase.id}`}>
                <button
                  onClick={() => handleSelect(testCase.id)}
                  className="flex items-center justify-center w-5 h-5 rounded border-2 border-apple-gray-3 hover:border-apple-blue transition-colors duration-200"
                  data-testid={`select-checkbox-${testCase.id}`}
                  aria-label={`Select test case ${testCase.id}`}
                >
                  {selectedIds.includes(testCase.id) ? (
                    <CheckSquare className="w-4 h-4 text-apple-blue" />
                  ) : (
                    <Square className="w-4 h-4 text-apple-gray-5" />
                  )}
                </button>
              </td>
              <td className="px-4 py-3" data-testid={`test-case-id-${testCase.id}`}>
                <span className="font-sf font-medium text-apple-gray-7">
                  #{testCase.id}
                </span>
              </td>
              <td className="px-4 py-3" data-testid={`test-case-title-${testCase.id}`}>
                <div className="max-w-xs">
                  {isEditing(testCase.id) ? (
                    <InlineEditInput
                      value={testCase.title}
                      onSave={(value) => handleSaveEdit('title', value)}
                      onCancel={handleCancelEdit}
                      placeholder="Enter title..."
                      required
                      maxLength={255}
                      dataTestId={`title-edit-${testCase.id}`}
                    />
                  ) : (
                    <h3 className="font-sf font-semibold text-apple-gray-7 text-sm line-clamp-1">
                      {testCase.title}
                    </h3>
                  )}
                  {testCase.description && (
                    <p 
                      className="text-xs text-apple-gray-5 line-clamp-1 mt-1"
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
                </div>
              </td>
              <td className="px-4 py-3" data-testid={`test-case-status-${testCase.id}`}>
                {isEditing(testCase.id) ? (
                  <InlineEditBadge
                    value={testCase.status}
                    options={statusOptions}
                    onSave={(value) => handleSaveEdit('status', value)}
                    onCancel={handleCancelEdit}
                    placeholder="Select status..."
                    dataTestId={`status-edit-${testCase.id}`}
                  />
                ) : (
                  <Badge 
                    variant={getStatusBadgeVariant(testCase.status)} 
                    size="sm"
                    data-testid={`status-badge-${testCase.id}`}
                  >
                    {getStatusText(testCase.status)}
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3" data-testid={`test-case-priority-${testCase.id}`}>
                {isEditing(testCase.id) ? (
                  <InlineEditBadge
                    value={testCase.priority}
                    options={priorityOptions}
                    onSave={(value) => handleSaveEdit('priority', value)}
                    onCancel={handleCancelEdit}
                    placeholder="Select priority..."
                    dataTestId={`priority-edit-${testCase.id}`}
                  />
                ) : (
                  <Badge 
                    variant={getPriorityBadgeVariant(testCase.priority)} 
                    size="sm"
                    data-testid={`priority-badge-${testCase.id}`}
                  >
                    {getPriorityText(testCase.priority)}
                  </Badge>
                )}
              </td>
              <td className="px-4 py-3" data-testid={`test-case-project-${testCase.id}`}>
                {isEditing(testCase.id) ? (
                  <InlineEditSelect
                    value={testCase.project_id}
                    options={projectOptions}
                    onSave={(value) => handleSaveEdit('project_id', value)}
                    onCancel={handleCancelEdit}
                    placeholder="Select project..."
                    dataTestId={`project-edit-${testCase.id}`}
                  />
                ) : (
                  <span className="font-sf text-sm text-apple-gray-6">
                    {testCase.project_name || 'Unknown'}
                  </span>
                )}
              </td>
              <td className="px-4 py-3" data-testid={`test-case-suite-${testCase.id}`}>
                {isEditing(testCase.id) ? (
                  <InlineEditSelect
                    value={testCase.test_suite_id}
                    options={testSuiteOptions}
                    onSave={(value) => handleSaveEdit('test_suite_id', value)}
                    onCancel={handleCancelEdit}
                    placeholder="Select test suite..."
                    dataTestId={`suite-edit-${testCase.id}`}
                  />
                ) : (
                  <span className="font-sf text-sm text-apple-gray-6">
                    {testCase.test_suite_name || 'No Suite'}
                  </span>
                )}
              </td>
              <td className="px-4 py-3" data-testid={`test-case-updated-${testCase.id}`}>
                <span className="font-sf text-sm text-apple-gray-5">
                  {new Date(testCase.updated_at).toLocaleDateString()}
                </span>
              </td>
              <td className="px-4 py-3" data-testid={`test-case-actions-${testCase.id}`}>
                {isEditing(testCase.id) ? (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCancelEdit()}
                      className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`cancel-edit-${testCase.id}`}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(testCase.id);
                    }}
                    className="p-1 h-8 w-8 text-apple-blue hover:text-apple-blue-dark hover:bg-apple-blue/10"
                    data-testid={`edit-button-${testCase.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
      
      {testCases.length === 0 && (
        <div className="px-4 py-12 text-center" data-testid="empty-table-state">
          <div className="text-apple-gray-4 mb-2">
            <FileText className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-apple-gray-5 font-sf text-sm" data-testid="empty-table-message">No test cases found</p>
          <p className="text-apple-gray-4 font-sf text-xs mt-1" data-testid="empty-table-subtitle">Create your first test case to get started</p>
        </div>
      )}
    </div>
  );
};

export default TestCasesTable; 