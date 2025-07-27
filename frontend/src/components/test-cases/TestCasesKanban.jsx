import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { htmlToText, getHtmlPreview, containsHtml } from '../../utils/htmlToText';

const TestCasesKanban = ({ 
  testCases, 
  onView, 
  onEdit, 
  onDelete,
  onStatusChange,
  onSelect,
  selectedIds = [],
  className = '' 
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Define status columns
  const columns = [
    {
      id: 'draft',
      title: 'Draft',
      icon: <FileText className="w-4 h-4" />,
      color: 'bg-apple-gray-2',
      borderColor: 'border-apple-gray-3',
      statusValue: 4
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      icon: <Clock className="w-4 h-4" />,
      color: 'bg-apple-blue/10',
      borderColor: 'border-apple-blue/30',
      statusValue: 5
    },
    {
      id: 'pass',
      title: 'Pass',
      icon: <CheckCircle className="w-4 h-4" />,
      color: 'bg-green-50',
      borderColor: 'border-green-200',
      statusValue: 1
    },
    {
      id: 'fail',
      title: 'Fail',
      icon: <XCircle className="w-4 h-4" />,
      color: 'bg-red-50',
      borderColor: 'border-red-200',
      statusValue: 2
    },
    {
      id: 'block',
      title: 'Block',
      icon: <AlertCircle className="w-4 h-4" />,
      color: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      statusValue: 3
    }
  ];

  // Group test cases by status
  const groupedTestCases = useMemo(() => {
    const grouped = {};
    columns.forEach(column => {
      grouped[column.id] = testCases.filter(testCase => testCase.status === column.statusValue);
    });
    return grouped;
  }, [testCases, columns]);

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 1: return 'success'; // Pass
      case 2: return 'danger';  // Fail
      case 3: return 'warning'; // Block
      case 4: return 'secondary'; // Draft
      case 5: return 'primary'; // In Progress
      default: return 'secondary';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Pass';
      case 2: return 'Fail';
      case 3: return 'Block';
      case 4: return 'Draft';
      case 5: return 'In Progress';
      default: return 'Unknown';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 1: return 'danger';   // High
      case 2: return 'warning';  // Medium
      case 3: return 'success';  // Low
      default: return 'secondary';
    }
  };

  // Get priority text
  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  };

  // Handle drag start
  const handleDragStart = (e, testCase) => {
    setDraggedItem(testCase);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  // Handle drop
  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedItem && onStatusChange) {
      const targetColumn = columns.find(col => col.id === columnId);
      if (targetColumn && draggedItem.status !== targetColumn.statusValue) {
        onStatusChange(draggedItem.id, targetColumn.statusValue);
      }
    }
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverColumn(null);
  };

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map((column) => (
        <div
          key={column.id}
          className={`flex-shrink-0 w-80 ${dragOverColumn === column.id ? 'opacity-75' : ''}`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {/* Column Header */}
          <div className={`flex items-center justify-between p-3 rounded-t-apple-lg ${column.color} ${column.borderColor} border-b`}>
            <div className="flex items-center gap-2">
              {column.icon}
              <h3 className="font-sf font-semibold text-apple-gray-7">{column.title}</h3>
              <Badge variant="secondary" size="sm">
                {groupedTestCases[column.id]?.length || 0}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>

          {/* Column Content */}
          <div className={`min-h-96 max-h-96 overflow-y-auto p-2 ${column.color} rounded-b-apple-lg`}>
            <AnimatePresence>
              {groupedTestCases[column.id]?.map((testCase) => (
                <motion.div
                  key={testCase.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2"
                >
                  <Card
                    elevation="sm"
                    padding="md"
                    hover={false}
                    className={`
                      cursor-grab active:cursor-grabbing
                      hover:shadow-apple-md hover:-translate-y-1
                      transition-all duration-200
                      ${draggedItem?.id === testCase.id ? 'opacity-50' : ''}
                      ${selectedIds.includes(testCase.id) ? 'border-apple-blue bg-apple-blue/5 shadow-apple-md' : 'border-apple-gray-2'}
                    `}
                    draggable
                    onDragStart={(e) => handleDragStart(e, testCase)}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => {
                      // Don't trigger card click if clicking on action buttons or selection checkbox
                      if (e.target.closest('button')) {
                        return;
                      }
                      onView(testCase);
                    }}
                    data-testid={`test-case-kanban-card-${testCase.id}`}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-2">
                      {/* Selection Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect?.(testCase.id);
                        }}
                        className="flex items-center justify-center w-4 h-4 rounded border-2 border-apple-gray-3 hover:border-apple-blue transition-colors duration-200 mr-2 mt-0.5"
                        data-testid={`select-checkbox-${testCase.id}`}
                        aria-label={`Select test case ${testCase.id}`}
                      >
                        {selectedIds.includes(testCase.id) ? (
                          <CheckSquare className="w-3 h-3 text-apple-blue" />
                        ) : (
                          <Square className="w-3 h-3 text-apple-gray-5" />
                        )}
                      </button>
                      
                      <h4 className="font-sf font-medium text-apple-gray-7 text-sm line-clamp-2 flex-1">
                        {testCase.title}
                      </h4>
                      <div className="flex items-center gap-1 ml-2">
                        <Badge variant={getPriorityBadgeVariant(testCase.priority)} size="xs">
                          {getPriorityText(testCase.priority)}
                        </Badge>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-2">
                      {/* Description */}
                      {testCase.description && (
                        <p 
                          className="text-xs text-apple-gray-5 line-clamp-2"
                          title={containsHtml(testCase.description) ? getHtmlPreview(testCase.description) : testCase.description}
                          data-testid={`test-case-description-${testCase.id}`}
                        >
                          {containsHtml(testCase.description) 
                            ? htmlToText(testCase.description, 60) 
                            : testCase.description.length > 60 
                              ? testCase.description.substring(0, 60) + '...' 
                              : testCase.description
                          }
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="text-xs text-apple-gray-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>ID:</span>
                          <span className="font-medium">#{testCase.id}</span>
                        </div>
                        {testCase.project_name && (
                          <div className="flex items-center justify-between">
                            <span>Project:</span>
                            <span className="font-medium truncate ml-2">{testCase.project_name}</span>
                          </div>
                        )}
                        {testCase.test_suite_name && (
                          <div className="flex items-center justify-between">
                            <span>Suite:</span>
                            <span className="font-medium truncate ml-2">{testCase.test_suite_name}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-apple-gray-2">
                        <div className="text-xs text-apple-gray-4">
                          Updated {new Date(testCase.updated_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={<Eye className="w-3 h-3" />}
                            onClick={() => onView(testCase)}
                            className="text-apple-gray-4 hover:text-apple-gray-6"
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={<Edit className="w-3 h-3" />}
                            onClick={() => onEdit(testCase)}
                            className="text-apple-gray-4 hover:text-apple-gray-6"
                          />
                          <Button
                            variant="ghost"
                            size="xs"
                            icon={<Trash2 className="w-3 h-3" />}
                            onClick={() => onDelete(testCase)}
                            className="text-apple-gray-4 hover:text-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Empty State */}
            {(!groupedTestCases[column.id] || groupedTestCases[column.id].length === 0) && (
              <div className="flex items-center justify-center h-32 text-apple-gray-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">📋</div>
                  <p className="text-sm">No test cases</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestCasesKanban; 