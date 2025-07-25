import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import TestSuiteTree from '../components/test-cases/TestSuiteTree';
import { testSuitesAPI } from '../services/api';

const TestSuiteBrowser = () => {
  const navigate = useNavigate();
  const [testSuites, setTestSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch test suites on component mount
  useEffect(() => {
    fetchTestSuites();
  }, []);

  const fetchTestSuites = async () => {
    try {
      setLoading(true);
      const response = await testSuitesAPI.getAll();
      setTestSuites(response.data || []);
    } catch (err) {
      console.error('Error fetching test suites:', err);
      setError('Failed to load test suites');
    } finally {
      setLoading(false);
    }
  };

  // Handle suite selection
  const handleSuiteSelect = (suite) => {
    console.log('Selected suite:', suite);
    setSelectedSuiteId(suite.id);
  };

  // Handle test case selection from tree
  const handleTestCaseSelect = (testCase) => {
    console.log('Selected test case from tree:', testCase);
    setSelectedTestCaseId(testCase.id);
    // Navigate to test case detail page
    navigate(`/testcases/${testCase.id}`);
  };

  // Handle search from layout
  const handleLayoutSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement global search
  };

  if (loading) {
    return (
      <Layout
        testSuites={testSuites}
        onSuiteSelect={handleSuiteSelect}
        onTestCaseSelect={handleTestCaseSelect}
        selectedSuiteId={selectedSuiteId}
        selectedTestCaseId={selectedTestCaseId}
        onSearch={handleLayoutSearch}
        breadcrumbs={[
          { label: 'Test Suite Browser', href: '/test-suites' }
        ]}
        actions={[
          {
            label: 'Add Test Suite',
            variant: 'primary',
            icon: <Plus className="w-4 h-4" />,
            onClick: () => console.log('Add test suite')
          }
        ]}
      >
        <div className="flex items-center justify-center py-12" data-element="testsuites-loading-container">
          <div className="text-center" data-element="testsuites-loading-content">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto mb-4" data-element="testsuites-loading-spinner"></div>
            <p className="text-apple-gray-5" data-element="testsuites-loading-text">Loading test suites...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        testSuites={testSuites}
        onSuiteSelect={handleSuiteSelect}
        onTestCaseSelect={handleTestCaseSelect}
        selectedSuiteId={selectedSuiteId}
        selectedTestCaseId={selectedTestCaseId}
        onSearch={handleLayoutSearch}
        breadcrumbs={[
          { label: 'Test Suite Browser', href: '/test-suites' }
        ]}
      >
        <Card className="max-w-md mx-auto" data-element="testsuites-error-card">
          <Card.Body className="text-center" data-element="testsuites-error-content">
            <p className="text-error mb-4" data-element="testsuites-error-message">{error}</p>
            <Button onClick={fetchTestSuites} data-element="testsuites-error-retry-button">Try Again</Button>
          </Card.Body>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
      testSuites={testSuites}
      onSuiteSelect={handleSuiteSelect}
      onTestCaseSelect={handleTestCaseSelect}
      selectedSuiteId={selectedSuiteId}
      selectedTestCaseId={selectedTestCaseId}
      onSearch={handleLayoutSearch}
      breadcrumbs={[
        { label: 'Test Suite Browser', href: '/test-suites' }
      ]}
      actions={[
        {
          label: 'Add Test Suite',
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => console.log('Add test suite')
        }
      ]}
      showSearch={false}
    >
      {/* Page Header */}
      <div className="mb-6" data-element="testsuites-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7" data-element="testsuites-page-title">
              Test Suite Browser
            </h1>
            <p className="text-apple-gray-5 mt-1" data-element="testsuites-page-description">
              Browse and manage your test suites hierarchically
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-element="testsuites-main-content">
        {/* Test Suite Tree */}
        <div className="lg:col-span-1" data-element="testsuites-tree-section">
          <Card elevation="sm" className="h-full" data-element="testsuites-tree-card">
            <Card.Header data-element="testsuites-tree-header">
              <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="testsuites-tree-title">
                Test Suite Tree
              </h3>
              <p className="text-sm text-apple-gray-5 mt-1" data-element="testsuites-tree-description">
                Navigate through your test suite hierarchy
              </p>
            </Card.Header>
            <Card.Body className="p-0" data-element="testsuites-tree-body">
              <TestSuiteTree
                testSuites={testSuites}
                onSuiteSelect={handleSuiteSelect}
                onTestCaseSelect={handleTestCaseSelect}
                selectedSuiteId={selectedSuiteId}
                selectedTestCaseId={selectedTestCaseId}
              />
            </Card.Body>
          </Card>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-2" data-element="testsuites-details-section">
          <Card elevation="sm" className="h-full" data-element="testsuites-details-card">
            <Card.Header data-element="testsuites-details-header">
              <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="testsuites-details-title">
                Suite Details
              </h3>
            </Card.Header>
            <Card.Body data-element="testsuites-details-body">
              {selectedSuiteId ? (
                <div className="space-y-4" data-element="testsuites-selected-suite">
                  <div className="text-center py-8" data-element="testsuites-suite-content">
                    <div className="text-apple-gray-4 mb-4" data-element="testsuites-suite-icon">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2" data-element="testsuites-suite-title">
                      Suite Selected
                    </h3>
                    <p className="text-apple-gray-5" data-element="testsuites-suite-description">
                      Test suite details will be displayed here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8" data-element="testsuites-empty-state">
                  <div className="text-apple-gray-4 mb-4" data-element="testsuites-empty-icon">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2" data-element="testsuites-empty-title">
                    Select a Test Suite
                  </h3>
                  <p className="text-apple-gray-5" data-element="testsuites-empty-description">
                    Choose a test suite from the tree to view its details
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default TestSuiteBrowser; 