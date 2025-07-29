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
import { Badge, Button } from '../ui';

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

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHealthScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5" />;
    return <XCircle className="w-5 h-5" />;
  };

  // Calculate statistics
  const totalTestCases = getTestCasesCount(suite);
  const statusCounts = getTestCasesByStatus(suite);
  const priorityCounts = getTestCasesByPriority(suite);
  const subSuitesCount = suite.test_suites ? suite.test_suites.length : 0;
  
  // Calculate coverage and health scores
  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const coveragePercentage = totalStatusCount > 0 ? Math.round((statusCounts.passed / totalStatusCount) * 100) : 0;
  const healthScore = totalStatusCount > 0 ? Math.round(((statusCounts.passed + statusCounts.pending) / totalStatusCount) * 100) : 0;

  return (
    <div className="space-y-6" data-element="suite-details-panel">
      {/* Suite Header */}
      <div className="flex items-center justify-between" data-element="suite-details-header">
        <div className="flex-1" data-element="suite-details-title-section">
          <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-1" data-element="suite-details-title">
            {suite.name}
          </h2>
          {suite.description && (
            <p className="text-apple-gray-5 text-sm" data-element="suite-details-description">
              {suite.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2" data-element="suite-details-actions">
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

      {/* Quick Stats Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-apple border border-apple-gray-2" data-element="suite-details-quick-stats">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-apple-gray-5">Coverage:</span>
            <span className="text-lg font-sf font-semibold text-green-600">{coveragePercentage}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-apple-gray-5">Health:</span>
            <span className={`text-lg font-sf font-semibold ${getHealthScoreColor(healthScore)}`}>{healthScore}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-apple-gray-5">Cases:</span>
            <span className="text-lg font-sf font-semibold text-apple-gray-7">{totalTestCases}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-apple-gray-5">Sub-Suites:</span>
            <span className="text-lg font-sf font-semibold text-apple-gray-7">{subSuitesCount}</span>
          </div>
        </div>
      </div>

      {/* Suite Information */}
      <div className="bg-white rounded-apple border border-apple-gray-2 p-4" data-element="suite-details-info-section">
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
      </div>

      {/* Statistics Breakdown */}
      <div className="bg-white rounded-apple border border-apple-gray-2 p-4" data-element="suite-details-stats-section">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-element="suite-details-stats-grid">
          {/* Status Breakdown */}
          <div className="space-y-3" data-element="suite-details-status-breakdown">
            <h4 className="text-sm font-sf font-semibold text-apple-gray-6">Status Breakdown</h4>
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
            <h4 className="text-sm font-sf font-semibold text-apple-gray-6">Priority Breakdown</h4>
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
      </div>
    </div>
  );
};

export default SuiteDetailsPanel; 