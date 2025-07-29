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
            Choose a test suite from the tree to view its details
          </p>
        </div>
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
    
    if (suite.test_suites) {
      suite.test_suites.forEach(childSuite => {
        if (childSuite.test_cases) {
          countStatuses(childSuite.test_cases);
        }
      });
    }

    return statusCounts;
  };

  // Calculate statistics
  const totalTestCases = getTestCasesCount(suite);
  const statusCounts = getTestCasesByStatus(suite);
  const subSuitesCount = suite.test_suites ? suite.test_suites.length : 0;
  
  // Calculate health score
  const totalStatusCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const healthScore = totalStatusCount > 0 ? Math.round(((statusCounts.passed + statusCounts.pending) / totalStatusCount) * 100) : 0;

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="h-full flex flex-col" data-element="suite-details-panel">
      {/* Suite Header - Minimal */}
      <div className="flex items-center justify-between p-4 border-b border-apple-gray-2" data-element="suite-details-header">
        <div className="flex-1" data-element="suite-details-title-section">
          <h2 className="text-lg font-sf font-semibold text-apple-gray-7 mb-1" data-element="suite-details-title">
            {suite.name}
          </h2>
          {suite.description && (
            <p className="text-sm text-apple-gray-5 truncate" data-element="suite-details-description">
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

      {/* Quick Stats - Compact */}
      <div className="p-4 border-b border-apple-gray-2" data-element="suite-details-quick-stats">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-apple-gray-4" />
              <span className="text-sm text-apple-gray-5">Cases:</span>
              <span className="text-lg font-sf font-semibold text-apple-gray-7">{totalTestCases}</span>
            </div>
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-apple-gray-4" />
              <span className="text-sm text-apple-gray-5">Sub-Suites:</span>
              <span className="text-lg font-sf font-semibold text-apple-gray-7">{subSuitesCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-apple-gray-5">Health:</span>
              <span className={`text-lg font-sf font-semibold ${getHealthColor(healthScore)}`}>{healthScore}%</span>
            </div>
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