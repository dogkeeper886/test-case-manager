import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import TestSuiteTree from '../components/test-cases/TestSuiteTree';
import { testSuitesAPI } from '../services/api';

const TestSuiteBrowser = () => {
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
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto mb-4"></div>
            <p className="text-apple-gray-5">Loading test suites...</p>
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
        <Card className="max-w-md mx-auto">
          <Card.Body className="text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchTestSuites}>Try Again</Button>
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7">
              Test Suite Browser
            </h1>
            <p className="text-apple-gray-5 mt-1">
              Browse and manage your test suites hierarchically
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Suite Tree */}
        <div className="lg:col-span-1">
          <Card elevation="sm" className="h-full">
            <Card.Header>
              <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
                Test Suite Tree
              </h3>
              <p className="text-sm text-apple-gray-5 mt-1">
                Navigate through your test suite hierarchy
              </p>
            </Card.Header>
            <Card.Body className="p-0">
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
        <div className="lg:col-span-2">
          <Card elevation="sm" className="h-full">
            <Card.Header>
              <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
                Suite Details
              </h3>
            </Card.Header>
            <Card.Body>
              {selectedSuiteId ? (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="text-apple-gray-4 mb-4">
                      <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                      Suite Selected
                    </h3>
                    <p className="text-apple-gray-5">
                      Test suite details will be displayed here
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-apple-gray-4 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                    Select a Test Suite
                  </h3>
                  <p className="text-apple-gray-5">
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