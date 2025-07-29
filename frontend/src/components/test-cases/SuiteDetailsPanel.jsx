import React from 'react';
import { 
  Edit, 
  Trash2, 
  Calendar,
  Hash,
  Folder,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { Card, Badge, Button } from '../ui';

const SuiteDetailsPanel = ({ suite, onEdit, onDelete }) => {
  if (!suite) {
    return (
      <div className="text-center py-8" data-element="suite-details-empty-state">
        <div className="text-apple-gray-4 mb-4" data-element="suite-details-empty-icon">
          <Folder className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2" data-element="suite-details-empty-title">
          Select a Test Suite
        </h3>
        <p className="text-apple-gray-5" data-element="suite-details-empty-description">
          Choose a test suite from the tree to view its details
        </p>
      </div>
    );
  }

  // Calculate suite statistics
  const getTestCasesCount = (suite) => {
    let count = suite.test_cases ? suite.test_cases.length : 0;
    if (suite.test_suites) {
      suite.test_suites.forEach(childSuite => {
        count += getTestCasesCount(childSuite);
      });
    }
    return count;
  };

  const getTestCasesByStatus = (suite) => {
    const statusCounts = { pending: 0, passed: 0, failed: 0, blocked: 0, skipped: 0 };
    
    const countStatuses = (testCases) => {
      testCases.forEach(testCase => {
        switch (testCase.status) {
          case 1: statusCounts.pending++; break;
          case 2: statusCounts.passed++; break;
          case 3: statusCounts.failed++; break;
          case 4: statusCounts.blocked++; break;
          case 5: statusCounts.skipped++; break;
          default: break;
        }
      });
    };

    if (suite.test_cases) {
      countStatuses(suite.test_cases);
    }
    
    // Count nested suites
    if (suite.test_suites) {
      suite.test_suites.forEach(childSuite => {
        if (childSuite.test_cases) {
          countStatuses(childSuite.test_cases);
        }
      });
    }

    return statusCounts;
  };

  const getTestCasesByPriority = (suite) => {
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    
    const countPriorities = (testCases) => {
      testCases.forEach(testCase => {
        switch (testCase.priority) {
          case 1: priorityCounts.low++; break;
          case 2: priorityCounts.medium++; break;
          case 3: priorityCounts.high++; break;
          default: break;
        }
      });
    };

    if (suite.test_cases) {
      countPriorities(suite.test_cases);
    }
    
    // Count nested suites
    if (suite.test_suites) {
      suite.test_suites.forEach(childSuite => {
        if (childSuite.test_cases) {
          countPriorities(childSuite.test_cases);
        }
      });
    }

    return priorityCounts;
  };

  const totalTestCases = getTestCasesCount(suite);
  const statusCounts = getTestCasesByStatus(suite);
  const priorityCounts = getTestCasesByPriority(suite);
  const subSuitesCount = suite.test_suites ? suite.test_suites.length : 0;

  // Calculate execution coverage
  const executedCount = statusCounts.passed + statusCounts.failed + statusCounts.blocked + statusCounts.skipped;
  const coveragePercentage = totalTestCases > 0 ? Math.round((executedCount / totalTestCases) * 100) : 0;

  // Calculate suite health score (0-100)
  const healthScore = totalTestCases > 0 
    ? Math.round(((statusCounts.passed * 100) + (statusCounts.skipped * 50) + (statusCounts.blocked * 25) + (statusCounts.failed * 0)) / totalTestCases)
    : 100;

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-4 h-4" />;
    if (score >= 60) return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6" data-element="suite-details-container">
      {/* Suite Header */}
      <div className="border-b border-apple-gray-3 pb-4" data-element="suite-details-header">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-2" data-element="suite-details-title">
              {suite.name}
            </h2>
            {suite.description && (
              <p className="text-apple-gray-5 text-sm" data-element="suite-details-description">
                {suite.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4" data-element="suite-details-actions">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(suite)}
              data-element="suite-details-edit-button"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete?.(suite)}
              data-element="suite-details-delete-button"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Suite Information */}
      <Card elevation="sm" data-element="suite-details-info-card">
        <Card.Header>
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="suite-details-info-title">
            Suite Information
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="suite-details-info-grid">
            {/* Basic Info */}
            <div className="space-y-3" data-element="suite-details-basic-info">
              <div className="flex items-center space-x-3" data-element="suite-details-id">
                <Hash className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-xs text-apple-gray-4">Internal ID</p>
                  <p className="text-sm font-medium text-apple-gray-7">{suite.id}</p>
                </div>
              </div>
              
              {suite.external_id && (
                <div className="flex items-center space-x-3" data-element="suite-details-external-id">
                  <Hash className="w-4 h-4 text-apple-gray-4" />
                  <div>
                    <p className="text-xs text-apple-gray-4">External ID</p>
                    <p className="text-sm font-medium text-apple-gray-7">{suite.external_id}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3" data-element="suite-details-created">
                <Calendar className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-xs text-apple-gray-4">Created</p>
                  <p className="text-sm font-medium text-apple-gray-7">
                    {new Date(suite.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3" data-element="suite-details-updated">
                <Calendar className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-xs text-apple-gray-4">Last Modified</p>
                  <p className="text-sm font-medium text-apple-gray-7">
                    {new Date(suite.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Hierarchy Info */}
            <div className="space-y-3" data-element="suite-details-hierarchy-info">
              <div className="flex items-center space-x-3" data-element="suite-details-parent">
                <Folder className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-xs text-apple-gray-4">Parent Suite</p>
                  <p className="text-sm font-medium text-apple-gray-7">
                    {suite.parent_suite_id ? `Suite ${suite.parent_suite_id}` : 'Root Level'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3" data-element="suite-details-children">
                <Folder className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-xs text-apple-gray-4">Sub-Suites</p>
                  <p className="text-sm font-medium text-apple-gray-7">{subSuitesCount}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3" data-element="suite-details-status">
                <CheckCircle className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-xs text-apple-gray-4">Status</p>
                  <Badge variant="outline" size="sm">
                    {suite.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {suite.node_order && (
                <div className="flex items-center space-x-3" data-element="suite-details-order">
                  <BarChart3 className="w-4 h-4 text-apple-gray-4" />
                  <div>
                    <p className="text-xs text-apple-gray-4">Display Order</p>
                    <p className="text-sm font-medium text-apple-gray-7">{suite.node_order}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Suite Statistics - Modern Compact Design */}
      <Card elevation="sm" data-element="suite-details-stats-card">
        <Card.Header className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="suite-details-stats-title">
              Overview
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {totalTestCases} Test Cases
              </Badge>
              <Badge variant="outline" size="sm">
                {subSuitesCount} Sub-Suites
              </Badge>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-element="suite-details-stats-grid">
            {/* Key Metrics */}
            <div className="space-y-4" data-element="suite-details-key-metrics">
              <div className="flex items-center justify-between p-3 bg-apple-gray-1 rounded-apple" data-element="suite-details-coverage">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-apple-gray-6">Coverage</span>
                </div>
                <span className="text-lg font-sf font-semibold text-apple-gray-7">{coveragePercentage}%</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-apple-gray-1 rounded-apple" data-element="suite-details-health">
                <div className="flex items-center gap-3">
                  <div className={getHealthScoreColor(healthScore)}>
                    {getHealthScoreIcon(healthScore)}
                  </div>
                  <span className="text-sm font-medium text-apple-gray-6">Health</span>
                </div>
                <span className={`text-lg font-sf font-semibold ${getHealthScoreColor(healthScore)}`}>{healthScore}%</span>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="space-y-3" data-element="suite-details-status-breakdown">
              <h4 className="text-sm font-sf font-semibold text-apple-gray-6">Status</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-apple-gray-5">Pending</span>
                  </div>
                  <span className="text-sm font-medium text-apple-gray-7">{statusCounts.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-apple-gray-5">Passed</span>
                  </div>
                  <span className="text-sm font-medium text-apple-gray-7">{statusCounts.passed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm text-apple-gray-5">Failed</span>
                  </div>
                  <span className="text-sm font-medium text-apple-gray-7">{statusCounts.failed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm text-apple-gray-5">Skipped</span>
                  </div>
                  <span className="text-sm font-medium text-apple-gray-7">{statusCounts.skipped}</span>
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="space-y-3" data-element="suite-details-priority-breakdown">
              <h4 className="text-sm font-sf font-semibold text-apple-gray-6">Priority</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-apple-gray-5">Low</span>
                  </div>
                  <span className="text-sm font-medium text-apple-gray-7">{priorityCounts.low}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-apple-gray-5">Medium</span>
                  </div>
                  <span className="text-sm font-medium text-apple-gray-7">{priorityCounts.medium}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span className="text-sm text-apple-gray-5">High</span>
                  </div>
                  <span className="text-sm font-medium text-apple-gray-7">{priorityCounts.high}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="mt-6" data-element="suite-details-status-breakdown">
            <h4 className="text-sm font-sf font-semibold text-apple-gray-6 mb-3" data-element="suite-details-status-title">
              Test Cases by Status
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3" data-element="suite-details-status-grid">
              <div className="text-center" data-element="suite-details-status-pending">
                <Badge variant="pending" size="sm" className="mb-1">{statusCounts.pending}</Badge>
                <p className="text-xs text-apple-gray-4">Pending</p>
              </div>
              <div className="text-center" data-element="suite-details-status-passed">
                <Badge variant="passed" size="sm" className="mb-1">{statusCounts.passed}</Badge>
                <p className="text-xs text-apple-gray-4">Passed</p>
              </div>
              <div className="text-center" data-element="suite-details-status-failed">
                <Badge variant="failed" size="sm" className="mb-1">{statusCounts.failed}</Badge>
                <p className="text-xs text-apple-gray-4">Failed</p>
              </div>
              <div className="text-center" data-element="suite-details-status-blocked">
                <Badge variant="blocked" size="sm" className="mb-1">{statusCounts.blocked}</Badge>
                <p className="text-xs text-apple-gray-4">Blocked</p>
              </div>
              <div className="text-center" data-element="suite-details-status-skipped">
                <Badge variant="skipped" size="sm" className="mb-1">{statusCounts.skipped}</Badge>
                <p className="text-xs text-apple-gray-4">Skipped</p>
              </div>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="mt-6" data-element="suite-details-priority-breakdown">
            <h4 className="text-sm font-sf font-semibold text-apple-gray-6 mb-3" data-element="suite-details-priority-title">
              Test Cases by Priority
            </h4>
            <div className="grid grid-cols-3 gap-3" data-element="suite-details-priority-grid">
              <div className="text-center" data-element="suite-details-priority-low">
                <Badge variant="low" size="sm" className="mb-1">{priorityCounts.low}</Badge>
                <p className="text-xs text-apple-gray-4">Low</p>
              </div>
              <div className="text-center" data-element="suite-details-priority-medium">
                <Badge variant="medium" size="sm" className="mb-1">{priorityCounts.medium}</Badge>
                <p className="text-xs text-apple-gray-4">Medium</p>
              </div>
              <div className="text-center" data-element="suite-details-priority-high">
                <Badge variant="high" size="sm" className="mb-1">{priorityCounts.high}</Badge>
                <p className="text-xs text-apple-gray-4">High</p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SuiteDetailsPanel; 