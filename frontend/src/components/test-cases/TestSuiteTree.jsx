import React, { useState, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react';
import { Card, Badge } from '../ui';

const TestSuiteTree = ({ 
  testSuites = [], 
  onSuiteSelect, 
  onTestCaseSelect,
  selectedSuiteId = null,
  selectedTestCaseId = null,
  expandedSuites: externalExpandedSuites,
  onToggleExpansion
}) => {
  const [internalExpandedSuites, setInternalExpandedSuites] = useState(new Set());
  const [loading] = useState(false);
  
  // Use external expanded state if provided, otherwise use internal
  const expandedSuites = externalExpandedSuites || internalExpandedSuites;
  const setExpandedSuites = onToggleExpansion || setInternalExpandedSuites;

  // Ensure testSuites is always an array and memoize it
  const safeTestSuites = useMemo(() => {
    return Array.isArray(testSuites) ? testSuites : [];
  }, [testSuites]);

  // Expand all suites by default - only run when testSuites prop actually changes
  useEffect(() => {
    if (!externalExpandedSuites) { // Only auto-expand if not using external state
      const allSuiteIds = new Set();
      const collectSuiteIds = (suites) => {
        suites.forEach(suite => {
          allSuiteIds.add(suite.id);
          if (suite.test_suites && suite.test_suites.length > 0) {
            collectSuiteIds(suite.test_suites);
          }
        });
      };
      collectSuiteIds(safeTestSuites);
      setInternalExpandedSuites(allSuiteIds);
    }
  }, [testSuites, externalExpandedSuites]); // Use testSuites directly instead of safeTestSuites

  const toggleSuite = (suiteId) => {
    if (onToggleExpansion) {
      // Use external toggle function
      const newSet = new Set(expandedSuites);
      if (newSet.has(suiteId)) {
        newSet.delete(suiteId);
      } else {
        newSet.add(suiteId);
      }
      onToggleExpansion(newSet);
    } else {
      // Use internal state
      setInternalExpandedSuites(prev => {
        const newSet = new Set(prev);
        if (newSet.has(suiteId)) {
          newSet.delete(suiteId);
        } else {
          newSet.add(suiteId);
        }
        return newSet;
      });
    }
  };

  const isExpanded = (suiteId) => expandedSuites.has(suiteId);

  const getTestCasesCount = (suite) => {
    let count = suite.test_cases ? suite.test_cases.length : 0;
    if (suite.test_suites) {
      suite.test_suites.forEach(childSuite => {
        count += getTestCasesCount(childSuite);
      });
    }
    return count;
  };

  const renderTestSuite = (suite, level = 0) => {
    const isExpandedState = isExpanded(suite.id);
    const isSelected = selectedSuiteId === suite.id;
    const testCasesCount = getTestCasesCount(suite);
    const hasChildren = (suite.test_suites && suite.test_suites.length > 0) || 
                       (suite.test_cases && suite.test_cases.length > 0);

    return (
      <div key={suite.id} className="w-full">
        {/* Test Suite Row */}
        <div
          className={`
            flex items-center px-3 py-2 rounded-apple cursor-pointer transition-all duration-200
            hover:bg-apple-gray-2/50
            ${isSelected ? 'bg-apple-blue/10 border border-apple-blue/20' : ''}
            ${level > 0 ? 'ml-6' : ''}
          `}
          onClick={() => onSuiteSelect?.(suite)}
        >
          {/* Indentation */}
          <div className="flex items-center space-x-2">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSuite(suite.id);
                }}
                className="p-1 hover:bg-apple-gray-3/50 rounded-apple transition-colors"
              >
                {isExpandedState ? (
                  <ChevronDown className="w-4 h-4 text-apple-gray-5" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-apple-gray-5" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-6" />}

            {/* Suite Icon */}
            {isExpandedState ? (
              <FolderOpen className="w-4 h-4 text-apple-blue" />
            ) : (
              <Folder className="w-4 h-4 text-apple-gray-5" />
            )}

            {/* Suite Name */}
            <span className="text-sm font-medium text-apple-gray-7 truncate">
              {suite.name}
            </span>

            {/* Test Cases Count */}
            {testCasesCount > 0 && (
              <Badge variant="outline" size="sm" className="ml-auto">
                {testCasesCount} {testCasesCount === 1 ? 'case' : 'cases'}
              </Badge>
            )}
          </div>
        </div>

        {/* Test Cases in this suite */}
        {isExpandedState && suite.test_cases && suite.test_cases.length > 0 && (
          <div className="ml-6">
            {suite.test_cases.map(testCase => (
              <div
                key={testCase.id}
                className={`
                  flex items-center px-3 py-2 rounded-apple cursor-pointer transition-all duration-200
                  hover:bg-apple-gray-2/50
                  ${selectedTestCaseId === testCase.id ? 'bg-apple-gray-2 border border-apple-gray-3' : ''}
                `}
                onClick={() => onTestCaseSelect?.(testCase)}
              >
                <FileText className="w-4 h-4 text-apple-gray-4 mr-2" />
                <span className="text-sm text-apple-gray-6 truncate flex-1">
                  {testCase.title}
                </span>
                <div className="flex items-center space-x-2 ml-2">
                  <Badge 
                    variant={getStatusBadgeVariant(testCase.status)} 
                    size="sm"
                  >
                    {getStatusText(testCase.status)}
                  </Badge>
                  <Badge 
                    variant={getPriorityBadgeVariant(testCase.priority)} 
                    size="sm"
                  >
                    {getPriorityText(testCase.priority)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nested Test Suites */}
        {isExpandedState && suite.test_suites && suite.test_suites.length > 0 && (
          <div>
            {suite.test_suites.map(childSuite => renderTestSuite(childSuite, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 1: return 'pending';
      case 2: return 'passed';
      case 3: return 'failed';
      case 4: return 'blocked';
      case 5: return 'skipped';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Passed';
      case 3: return 'Failed';
      case 4: return 'Blocked';
      case 5: return 'Skipped';
      default: return 'Unknown';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      default: return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <Card elevation={1} className="p-4" data-element="testsuite-tree-loading-card">
        <div className="flex items-center justify-center py-8" data-element="testsuite-tree-loading-container">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-apple-blue" data-element="testsuite-tree-loading-spinner"></div>
          <span className="ml-2 text-sm text-apple-gray-5" data-element="testsuite-tree-loading-text">Loading test suites...</span>
        </div>
      </Card>
    );
  }

  if (safeTestSuites.length === 0) {
    return (
      <Card elevation={1} className="p-4" data-element="testsuite-tree-empty-card">
        <div className="text-center py-8" data-element="testsuite-tree-empty-container">
          <Folder className="w-12 h-12 text-apple-gray-4 mx-auto mb-3" data-element="testsuite-tree-empty-icon" />
          <p className="text-sm text-apple-gray-5" data-element="testsuite-tree-empty-text">No test suites found</p>
          <p className="text-xs text-apple-gray-4 mt-1" data-element="testsuite-tree-empty-description">Import TestLink XML to get started</p>
        </div>
      </Card>
    );
  }

  return (
    <Card elevation={1} className="p-2" data-element="testsuite-tree-card">
      <div className="space-y-1" data-element="testsuite-tree-container">
        {safeTestSuites.map(suite => renderTestSuite(suite))}
      </div>
    </Card>
  );
};

export default TestSuiteTree; 