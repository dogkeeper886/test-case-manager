import React from 'react';
import { X, FileText, Calendar, User, Tag, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button, Card, Badge } from '../ui';

const TestCasePreviewDialog = ({ testCase, isOpen, onClose, onViewFull }) => {
  if (!isOpen || !testCase) return null;

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Draft';
      case 2: return 'Ready';
      case 3: return 'In Progress';
      case 4: return 'Blocked';
      case 5: return 'Completed';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'default';
      case 2: return 'success';
      case 3: return 'warning';
      case 4: return 'error';
      case 5: return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <Clock className="w-4 h-4" />;
      case 2: return <CheckCircle className="w-4 h-4" />;
      case 3: return <Clock className="w-4 h-4" />;
      case 4: return <AlertTriangle className="w-4 h-4" />;
      case 5: return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Low';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'default';
      case 2: return 'info';
      case 3: return 'warning';
      case 4: return 'error';
      default: return 'default';
    }
  };

  const getImportanceText = (importance) => {
    switch (importance) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Low';
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 1: return 'default';
      case 2: return 'info';
      case 3: return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-apple-lg shadow-apple-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-apple-gray-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-apple-blue/10 rounded-apple-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-apple-blue" />
            </div>
            <div>
              <h2 className="text-lg font-sf font-semibold text-apple-gray-7">
                Test Case Preview
              </h2>
              <p className="text-sm text-apple-gray-4">
                Quick overview of test case details
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 text-apple-gray-4 hover:text-apple-gray-7 hover:bg-apple-gray-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Title and Status */}
            <div>
              <h3 className="text-xl font-sf font-semibold text-apple-gray-7 mb-3">
                {testCase.title}
              </h3>
              <div className="flex items-center gap-3">
                <Badge
                  variant={getStatusColor(testCase.status)}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {getStatusIcon(testCase.status)}
                  {getStatusText(testCase.status)}
                </Badge>
                <Badge variant={getPriorityColor(testCase.priority)} size="sm">
                  {getPriorityText(testCase.priority)} Priority
                </Badge>
                <Badge variant={getImportanceColor(testCase.importance)} size="sm">
                  {getImportanceText(testCase.importance)} Importance
                </Badge>
              </div>
            </div>

            {/* Description */}
            {testCase.description && (
              <div>
                <h4 className="text-sm font-sf font-medium text-apple-gray-7 mb-2">
                  Description
                </h4>
                <p className="text-sm text-apple-gray-6 leading-relaxed">
                  {testCase.description}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-apple-gray-4" />
                <span className="text-apple-gray-5">Created:</span>
                <span className="font-sf font-medium text-apple-gray-7">
                  {formatDate(testCase.created_at)}
                </span>
              </div>
              {testCase.updated_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-apple-gray-4" />
                  <span className="text-apple-gray-5">Updated:</span>
                  <span className="font-sf font-medium text-apple-gray-7">
                    {formatDate(testCase.updated_at)}
                  </span>
                </div>
              )}
              {testCase.author && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-apple-gray-4" />
                  <span className="text-apple-gray-5">Author:</span>
                  <span className="font-sf font-medium text-apple-gray-7">
                    {testCase.author}
                  </span>
                </div>
              )}
              {testCase.test_suite_name && (
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="w-4 h-4 text-apple-gray-4" />
                  <span className="text-apple-gray-5">Test Suite:</span>
                  <span className="font-sf font-medium text-apple-gray-7">
                    {testCase.test_suite_name}
                  </span>
                </div>
              )}
            </div>

            {/* Test Steps Preview */}
            {testCase.test_steps && testCase.test_steps.length > 0 && (
              <div>
                <h4 className="text-sm font-sf font-medium text-apple-gray-7 mb-3">
                  Test Steps ({testCase.test_steps.length})
                </h4>
                <div className="space-y-2">
                  {testCase.test_steps.slice(0, 3).map((step, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-apple-gray-1/30 rounded-apple-md">
                      <div className="flex-shrink-0 w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-sf font-bold text-apple-blue">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-apple-gray-7 mb-1">
                          {step.step}
                        </p>
                        {step.expected_result && (
                          <p className="text-xs text-apple-gray-5">
                            Expected: {step.expected_result}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {testCase.test_steps.length > 3 && (
                    <p className="text-xs text-apple-gray-4 text-center py-2">
                      +{testCase.test_steps.length - 3} more steps
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-apple-gray-2 bg-apple-gray-1/30">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={onViewFull}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            View Full Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestCasePreviewDialog; 