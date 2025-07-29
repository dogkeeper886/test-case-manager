import React from 'react';
import { X, Edit, Trash2, Plus, Folder, FileText, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react';
import { Button, Badge } from '../ui';

const SuiteDetailsDialog = ({ suite, isOpen, onClose, onEdit, onDelete }) => {
  if (!isOpen || !suite) return null;

  // Calculate statistics
  const calculateStats = (suite) => {
    let totalTestCases = 0;
    let statusCounts = { passed: 0, failed: 0, blocked: 0, skipped: 0 };
    let priorityCounts = { high: 0, medium: 0, low: 0 };
    let subSuitesCount = 0;

    const traverseSuite = (s) => {
      // Count test cases in this suite
      if (s.test_cases) {
        totalTestCases += s.test_cases.length;
        s.test_cases.forEach(testCase => {
          if (testCase.status) {
            const status = typeof testCase.status === 'string' ? testCase.status.toLowerCase() : testCase.status.toString();
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          }
          if (testCase.priority) {
            const priority = typeof testCase.priority === 'string' ? testCase.priority.toLowerCase() : testCase.priority.toString();
            priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
          }
        });
      }

      // Count sub-suites
      if (s.test_suites) {
        subSuitesCount += s.test_suites.length;
        s.test_suites.forEach(traverseSuite);
      }
    };

    traverseSuite(suite);

    // Calculate coverage and health score
    const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const passedCount = statusCounts.passed || 0;
    const coveragePercentage = totalStatusCount > 0 ? Math.round((passedCount / totalStatusCount) * 100) : 0;
    
    const healthScore = Math.round(
      (passedCount * 0.4 + (statusCounts.skipped || 0) * 0.2) / totalStatusCount * 100
    ) || 0;

    return {
      totalTestCases,
      statusCounts,
      priorityCounts,
      subSuitesCount,
      coveragePercentage,
      healthScore
    };
  };

  const stats = calculateStats(suite);

  const getHealthScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadgeVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'passed': return 'success';
      case 'failed': return 'destructive';
      case 'blocked': return 'warning';
      case 'skipped': return 'outline';
      default: return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-element="suite-details-dialog-overlay">
      <div className="bg-white rounded-apple shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" data-element="suite-details-dialog">
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-6 border-b border-apple-gray-2" data-element="suite-details-dialog-header">
          <div className="flex items-center gap-3">
            <Folder className="w-6 h-6 text-apple-blue" />
            <div>
              <h2 className="text-xl font-sf font-semibold text-apple-gray-7" data-element="suite-details-dialog-title">
                {suite.name}
              </h2>
              <p className="text-sm text-apple-gray-5" data-element="suite-details-dialog-subtitle">
                Test Suite Details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(suite)}
              data-element="suite-details-dialog-edit-button"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(suite)}
              data-element="suite-details-dialog-delete-button"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-element="suite-details-dialog-close-button"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Dialog Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]" data-element="suite-details-dialog-content">
          {/* Quick Stats */}
          <div className="p-6 border-b border-apple-gray-2" data-element="suite-details-dialog-stats">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-apple-blue/5 rounded-apple border border-apple-blue/10">
                <div className="text-2xl font-sf font-bold text-apple-blue">{stats.totalTestCases}</div>
                <div className="text-sm text-apple-gray-5">Total Cases</div>
              </div>
              <div className="text-center p-4 bg-apple-green/5 rounded-apple border border-apple-green/10">
                <div className="text-2xl font-sf font-bold text-apple-green">{stats.coveragePercentage}%</div>
                <div className="text-sm text-apple-gray-5">Coverage</div>
              </div>
              <div className="text-center p-4 bg-apple-yellow/5 rounded-apple border border-apple-yellow/10">
                <div className="text-2xl font-sf font-bold text-apple-yellow">{stats.healthScore}</div>
                <div className="text-sm text-apple-gray-5">Health Score</div>
              </div>
              <div className="text-center p-4 bg-apple-gray-1 rounded-apple border border-apple-gray-2">
                <div className="text-2xl font-sf font-bold text-apple-gray-7">{stats.subSuitesCount}</div>
                <div className="text-sm text-apple-gray-5">Sub-Suites</div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="p-6 border-b border-apple-gray-2" data-element="suite-details-dialog-status">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-apple-gray-1 rounded-apple">
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(status)} size="sm">
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-lg font-sf font-semibold text-apple-gray-7">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="p-6 border-b border-apple-gray-2" data-element="suite-details-dialog-priority">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">Priority Breakdown</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(stats.priorityCounts).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between p-3 bg-apple-gray-1 rounded-apple">
                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityBadgeVariant(priority)} size="sm">
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Badge>
                  </div>
                  <span className="text-lg font-sf font-semibold text-apple-gray-7">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suite Information */}
          <div className="p-6" data-element="suite-details-dialog-info">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">Suite Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-apple-gray-6">Description</label>
                <p className="text-sm text-apple-gray-7 mt-1">
                  {suite.description || 'No description available'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-apple-gray-6">Created</label>
                  <p className="text-sm text-apple-gray-7 mt-1">
                    {suite.created_at ? new Date(suite.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-apple-gray-6">Last Modified</label>
                  <p className="text-sm text-apple-gray-7 mt-1">
                    {suite.updated_at ? new Date(suite.updated_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiteDetailsDialog; 