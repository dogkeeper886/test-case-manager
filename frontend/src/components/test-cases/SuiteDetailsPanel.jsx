import React from 'react';
import { 
  Edit, 
  Trash2, 
  Plus,
  Folder,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Badge, Button } from '../ui';

const SuiteDetailsPanel = ({ suite, onEdit, onDelete }) => {
  if (!suite) {
    return (
      <div className="flex items-center justify-center h-full" data-element="suite-details-empty-state">
        <div className="text-center" data-element="suite-details-empty-content">
          <Folder className="w-16 h-16 text-apple-gray-3 mx-auto mb-4" />
          <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
            Select a Test Suite
          </h3>
          <p className="text-apple-gray-4 max-w-md">
            Choose a test suite from the tree to view its details and statistics
          </p>
        </div>
      </div>
    );
  }

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
  const { totalTestCases, subSuitesCount, coveragePercentage, healthScore, statusCounts } = stats;

  const getHealthScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  return (
    <div className="h-full flex flex-col" data-element="suite-details-panel">
      {/* Quick Stats Bar */}
      <div className="flex items-center justify-between p-4 border-b border-apple-gray-2 bg-apple-gray-1/50" data-element="suite-details-quick-stats">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
            <span className="text-sm font-medium text-apple-gray-7">Coverage</span>
            <span className="text-sm text-apple-gray-5">{coveragePercentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            {getHealthScoreIcon(healthScore)}
            <span className="text-sm font-medium text-apple-gray-7">Health</span>
            <span className="text-sm text-apple-gray-5">{healthScore}/100</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-apple-gray-4" />
            <span className="text-sm font-medium text-apple-gray-7">Cases</span>
            <span className="text-sm text-apple-gray-5">{totalTestCases}</span>
          </div>
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-apple-gray-4" />
            <span className="text-sm font-medium text-apple-gray-7">Sub-Suites</span>
            <span className="text-sm text-apple-gray-5">{subSuitesCount}</span>
          </div>
        </div>
      </div>

      {/* Suite Header */}
      <div className="p-4 border-b border-apple-gray-2" data-element="suite-details-header">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-1" data-element="suite-details-name">
              {suite.name}
            </h3>
            <p className="text-sm text-apple-gray-5" data-element="suite-details-description">
              {suite.description || 'No description available'}
            </p>
          </div>
        </div>
      </div>

      {/* Status Overview - Visual */}
      <div className="flex-1 p-4" data-element="suite-details-status-overview">
        <div className="space-y-4">
          {/* Status Distribution */}
          <div data-element="suite-details-status-distribution">
            <h4 className="text-sm font-sf font-semibold text-apple-gray-6 mb-3">Status Distribution</h4>
            <div className="grid grid-cols-5 gap-2">
              <div className="text-center p-3 bg-orange-50 rounded-apple border border-orange-200">
                <div className="text-lg font-sf font-semibold text-orange-600">{statusCounts.pending}</div>
                <div className="text-xs text-orange-500">Pending</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-apple border border-green-200">
                <div className="text-lg font-sf font-semibold text-green-600">{statusCounts.passed}</div>
                <div className="text-xs text-green-500">Passed</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-apple border border-red-200">
                <div className="text-lg font-sf font-semibold text-red-600">{statusCounts.failed}</div>
                <div className="text-xs text-red-500">Failed</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-apple border border-orange-200">
                <div className="text-lg font-sf font-semibold text-orange-600">{statusCounts.blocked}</div>
                <div className="text-xs text-orange-500">Blocked</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-apple border border-gray-200">
                <div className="text-lg font-sf font-semibold text-gray-600">{statusCounts.skipped}</div>
                <div className="text-xs text-gray-500">Skipped</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div data-element="suite-details-quick-actions">
            <h4 className="text-sm font-sf font-semibold text-apple-gray-6 mb-3">Quick Actions</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                data-element="suite-details-add-test-button"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Test Case
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                data-element="suite-details-add-suite-button"
              >
                <Folder className="w-4 h-4 mr-1" />
                Add Sub-Suite
              </Button>
            </div>
          </div>

          {/* Basic Info - Minimal */}
          <div data-element="suite-details-basic-info">
            <h4 className="text-sm font-sf font-semibold text-apple-gray-6 mb-3">Basic Info</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-apple-gray-5">ID:</span>
                <span className="text-apple-gray-7 font-medium">{suite.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-apple-gray-5">Status:</span>
                <Badge variant="outline" size="sm">
                  {suite.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-apple-gray-5">Created:</span>
                <span className="text-apple-gray-7">{new Date(suite.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuiteDetailsPanel; 