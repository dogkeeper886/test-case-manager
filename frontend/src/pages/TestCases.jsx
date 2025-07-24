import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, Eye, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import { testCasesAPI, testSuitesAPI, projectsAPI } from '../services/api';
import useTestCaseStore from '../stores/testCaseStore';

const TestCases = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [testCases, setTestCases] = useState([]);
  const [testSuites, setTestSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedSuite, setSelectedSuite] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showFilters, setShowFilters] = useState(!!searchParams.get('status'));
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);

  const { setTestCases: setStoreTestCases, setTestSuites: setStoreTestSuites } = useTestCaseStore();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [testCasesRes, testSuitesRes, projectsRes] = await Promise.all([
        testCasesAPI.getAll(),
        testSuitesAPI.getAll(),
        projectsAPI.getAll()
      ]);

      setTestCases(testCasesRes.data.data || testCasesRes.data);
      setTestSuites(testSuitesRes.data.data || testSuitesRes.data);
      setProjects(projectsRes.data.data || projectsRes.data);

      // Update store
      setStoreTestCases(testCasesRes.data.data || testCasesRes.data);
      setStoreTestSuites(testSuitesRes.data.data || testSuitesRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load test cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter test cases based on search and filters
  const filteredTestCases = testCases.filter(testCase => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        testCase.title?.toLowerCase().includes(query) ||
        testCase.description?.toLowerCase().includes(query) ||
        testCase.id?.toString().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Project filter
    if (selectedProject && testCase.project_name !== selectedProject) {
      return false;
    }

    // Test suite filter
    if (selectedSuite && testCase.test_suite_name !== selectedSuite) {
      return false;
    }

    // Status filter
    if (statusFilter && testCase.status !== parseInt(statusFilter)) {
      return false;
    }

    // Priority filter
    if (priorityFilter && testCase.priority !== parseInt(priorityFilter)) {
      return false;
    }

    return true;
  });

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  // Get test suite name by ID
  const getTestSuiteName = (suiteId) => {
    const suite = testSuites.find(s => s.id === suiteId);
    return suite?.name || 'No Suite';
  };

  // Get status badge variant
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

  // Get status text
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

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 1: return 'low';
      case 2: return 'medium';
      case 3: return 'high';
      default: return 'default';
    }
  };

  // Get priority text
  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  // Get execution type text
  const getExecutionTypeText = (executionType) => {
    return executionType === 1 ? 'Manual' : 'Automated';
  };

  // Handle test case actions
  const handleViewTestCase = (testCase) => {
    navigate(`/testcases/${testCase.id}`);
  };

  const handleEditTestCase = (testCase) => {
    console.log('Edit test case:', testCase);
    // TODO: Open edit modal or navigate to edit page
  };

  const handleDeleteTestCase = async (testCase) => {
    if (window.confirm(`Are you sure you want to delete "${testCase.title}"?`)) {
      try {
        await testCasesAPI.delete(testCase.id);
        setTestCases(testCases.filter(tc => tc.id !== testCase.id));
      } catch (err) {
        console.error('Error deleting test case:', err);
        alert('Failed to delete test case');
      }
    }
  };

  // Handle suite selection
  const handleSuiteSelect = (suite) => {
    console.log('Selected suite:', suite);
    setSelectedSuiteId(suite.id);
    // TODO: Filter test cases by suite
  };

  // Handle test case selection from tree
  const handleTestCaseSelect = (testCase) => {
    console.log('Selected test case from tree:', testCase);
    setSelectedTestCaseId(testCase.id);
    // TODO: Navigate to test case detail view
  };

  // Handle search from layout
  const handleLayoutSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement global search
  };

  // Handle create test case from top nav
  const handleCreateTestCase = () => {
    console.log('Create test case clicked');
    // TODO: Open create test case modal or navigate to create form
    // For now, show a placeholder alert
    alert('Create Test Case functionality will be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-gray-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto mb-4"></div>
          <p className="text-apple-gray-5">Loading test cases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-apple-gray-1 flex items-center justify-center">
        <Card className="max-w-md">
          <Card.Body className="text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchData}>Try Again</Button>
          </Card.Body>
        </Card>
      </div>
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
        { label: 'Test Cases', href: '/testcases' }
      ]}
      actions={[
        {
          label: 'Create Test Case',
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => handleCreateTestCase()
        }
      ]}
      showSearch={false}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7">
              Test Cases
            </h1>
            <p className="text-apple-gray-5 mt-1">
              {filteredTestCases.length} of {testCases.length} test cases
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card elevation="sm" padding="lg" className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Search test cases..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Toggle */}
          <Button
            variant="secondary"
            icon={showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-apple-gray-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Project
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                  >
                    <option value="">All Projects</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Test Suite
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                    value={selectedSuite}
                    onChange={(e) => setSelectedSuite(e.target.value)}
                  >
                    <option value="">All Suites</option>
                    {testSuites.map(suite => (
                      <option key={suite.id} value={suite.name}>
                        {suite.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="1">Pending</option>
                    <option value="2">Passed</option>
                    <option value="3">Failed</option>
                    <option value="4">Blocked</option>
                    <option value="5">Skipped</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="">All Priorities</option>
                    <option value="1">Low</option>
                    <option value="2">Medium</option>
                    <option value="3">High</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Test Cases Grid */}
        <div className="mt-6">
          {filteredTestCases.length === 0 ? (
            <Card elevation="sm" padding="xl">
              <Card.Body className="text-center py-12">
                <div className="text-apple-gray-4 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                  No test cases found
                </h3>
                <p className="text-apple-gray-5">
                  {searchQuery || selectedProject || selectedSuite || statusFilter || priorityFilter
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first test case'}
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTestCases.map(testCase => (
                <Card 
                  key={testCase.id} 
                  elevation="md" 
                  hover={true}
                  className="cursor-pointer transition-all duration-200 hover:shadow-apple-md"
                  onClick={() => handleViewTestCase(testCase)}
                >
                  <Card.Header>
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-sf font-semibold text-apple-gray-7 line-clamp-2">
                        {testCase.title}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <Badge variant={getStatusBadgeVariant(testCase.status)} size="sm">
                          {getStatusText(testCase.status)}
                        </Badge>
                        <Badge variant={getPriorityBadgeVariant(testCase.priority)} size="sm">
                          {getPriorityText(testCase.priority)}
                        </Badge>
                      </div>
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    <p className="text-apple-gray-5 text-sm mb-3 line-clamp-3">
                      {testCase.description || 'No description available'}
                    </p>
                    
                    <div className="space-y-2 text-xs text-apple-gray-4">
                      <div className="flex items-center justify-between">
                        <span>Project:</span>
                        <span className="font-medium">{testCase.project_name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Test Suite:</span>
                        <span className="font-medium">{testCase.test_suite_name || 'No Suite'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Execution:</span>
                        <span className="font-medium">{getExecutionTypeText(testCase.execution_type)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>ID:</span>
                        <span className="font-medium">#{testCase.id}</span>
                      </div>
                    </div>
                  </Card.Body>
                  
                  <Card.Footer>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-apple-gray-4">
                        Updated {new Date(testCase.updated_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3 h-3" />}
                          onClick={() => handleViewTestCase(testCase)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit className="w-3 h-3" />}
                          onClick={() => handleEditTestCase(testCase)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3 h-3" />}
                          onClick={() => handleDeleteTestCase(testCase)}
                        />
                      </div>
                    </div>
                  </Card.Footer>
                </Card>
              ))}
            </div>
          )}
        </div>
    </Layout>
  );
};

export default TestCases; 