import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown, Folder, FolderOpen, FileText, Users, Calendar, Hash, BarChart3 } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import TestSuiteTree from '../components/test-cases/TestSuiteTree';
import SuiteDetailsPanel from '../components/test-cases/SuiteDetailsPanel';
import { testSuitesAPI, projectsAPI } from '../services/api';

const TestSuiteBrowser = () => {
  const navigate = useNavigate();
  const [testSuites, setTestSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuite, setSelectedSuite] = useState(null);
  
  // New state for modern design
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'list', 'grid'
  const [expandedSuites, setExpandedSuites] = useState(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch projects and test suites in parallel
      const [projectsResponse, testSuitesResponse] = await Promise.all([
        projectsAPI.getAll(),
        testSuitesAPI.getAll(true)
      ]);
      
      const projectsData = projectsResponse.data.data || projectsResponse.data || [];
      const hierarchicalSuites = testSuitesResponse.data.data || testSuitesResponse.data || [];
      
      setProjects(projectsData);
      setTestSuites(hierarchicalSuites);
      
      // Set first project as default if available
      if (projectsData.length > 0 && !selectedProjectId) {
        setSelectedProjectId(projectsData[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load test suites');
    } finally {
      setLoading(false);
    }
  };

  // Filter test suites by selected project
  const filteredTestSuites = testSuites.filter(suite => {
    if (!selectedProjectId) return true;
    return suite.project_id?.toString() === selectedProjectId;
  });

  // Handle suite selection
  const handleSuiteSelect = (suite) => {
    console.log('Selected suite:', suite);
    setSelectedSuiteId(suite.id);
    setSelectedSuite(suite);
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

  // Suite action handlers
  const handleEditSuite = (suite) => {
    console.log('Edit suite:', suite);
    // TODO: Implement suite editing
  };

  const handleDeleteSuite = (suite) => {
    console.log('Delete suite:', suite);
    // TODO: Implement suite deletion with confirmation
  };

  // Project selection handler
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setShowProjectDropdown(false);
    // Reset selected suite when changing projects
    setSelectedSuiteId(null);
    setSelectedSuite(null);
  };

  // Toggle suite expansion
  const toggleSuiteExpansion = (suiteId) => {
    const newExpanded = new Set(expandedSuites);
    if (newExpanded.has(suiteId)) {
      newExpanded.delete(suiteId);
    } else {
      newExpanded.add(suiteId);
    }
    setExpandedSuites(newExpanded);
  };

  // Get selected project name
  const selectedProject = projects.find(p => p.id.toString() === selectedProjectId);

  if (loading) {
    return (
      <Layout
        onSearch={handleLayoutSearch}
        breadcrumbs={[
          { label: 'Test Suite Browser', href: '/test-suites' }
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
        onSearch={handleLayoutSearch}
        breadcrumbs={[
          { label: 'Test Suite Browser', href: '/test-suites' }
        ]}
      >
        <Card className="max-w-md mx-auto" data-element="testsuites-error-card">
          <Card.Body className="text-center" data-element="testsuites-error-content">
            <p className="text-error mb-4" data-element="testsuites-error-message">{error}</p>
            <Button onClick={fetchData} data-element="testsuites-error-retry-button">Try Again</Button>
          </Card.Body>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout
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
      {/* Modern Page Header with Project Selection */}
      <div className="mb-8" data-element="testsuites-page-header">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7" data-element="testsuites-page-title">
              Test Suite Browser
            </h1>
            <p className="text-apple-gray-5 mt-1" data-element="testsuites-page-description">
              Browse and manage your test suites hierarchically
            </p>
          </div>
          
          {/* Project Selection and Controls */}
          <div className="flex items-center gap-3" data-element="testsuites-controls">
            {/* Project Selector */}
            <div className="relative" data-element="project-selector">
              <Button
                variant="outline"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="min-w-[200px] justify-between"
                data-element="project-selector-button"
              >
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-apple-gray-4" />
                  <span className="text-sm font-medium">
                    {selectedProject ? selectedProject.name : 'Select Project'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${showProjectDropdown ? 'rotate-180' : ''}`} />
              </Button>
              
              {/* Project Dropdown */}
              {showProjectDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50 max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id.toString())}
                      className={`w-full px-4 py-3 text-left text-sm hover:bg-apple-gray-1 transition-colors duration-200 flex items-center gap-3 ${
                        selectedProjectId === project.id.toString() 
                          ? 'bg-apple-blue/10 text-apple-blue' 
                          : 'text-apple-gray-7'
                      }`}
                      data-element={`project-option-${project.id}`}
                    >
                      <Folder className="w-4 h-4" />
                      <span className="font-medium">{project.name}</span>
                      {selectedProjectId === project.id.toString() && (
                        <div className="ml-auto w-2 h-2 bg-apple-blue rounded-full" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-apple-gray-1 rounded-apple-lg p-1" data-element="view-mode-toggle">
              <Button
                variant={viewMode === 'tree' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className="text-xs"
                data-element="view-mode-tree"
              >
                Tree
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="text-xs"
                data-element="view-mode-list"
              >
                List
              </Button>
            </div>

            {/* Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="gap-2"
              data-element="filter-button"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Project Info Bar */}
        {selectedProject && (
          <div className="mt-4 p-4 bg-apple-gray-1 rounded-apple-lg border border-apple-gray-2" data-element="project-info-bar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-apple-blue" />
                  <span className="font-medium text-apple-gray-7">{selectedProject.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-apple-gray-5">
                  <Users className="w-4 h-4" />
                  <span>{selectedProject.owner || 'No Owner'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-apple-gray-5">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(selectedProject.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">
                  {filteredTestSuites.length} Test Suites
                </Badge>
                <Badge variant="outline" size="sm">
                  {selectedProject.status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Modern Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6" data-element="testsuites-main-content">
        {/* Test Suite Tree - Modern Design */}
        <div className="xl:col-span-4" data-element="testsuites-tree-section">
          <div className="bg-white rounded-apple border border-apple-gray-2 h-full" data-element="testsuites-tree-container">
            <div className="p-4 border-b border-apple-gray-2" data-element="testsuites-tree-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="testsuites-tree-title">
                  Test Suites
                </h3>
                <Badge variant="outline" size="sm">
                  {filteredTestSuites.length}
                </Badge>
              </div>
            </div>
            <div className="p-0" data-element="testsuites-tree-body">
              <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                <TestSuiteTree
                  testSuites={filteredTestSuites}
                  onSuiteSelect={handleSuiteSelect}
                  onTestCaseSelect={handleTestCaseSelect}
                  selectedSuiteId={selectedSuiteId}
                  selectedTestCaseId={selectedTestCaseId}
                  expandedSuites={expandedSuites}
                  onToggleExpansion={toggleSuiteExpansion}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details Panel - Compact Design */}
        <div className="xl:col-span-1" data-element="testsuites-details-section">
          {selectedSuite ? (
            <SuiteDetailsPanel
              suite={selectedSuite}
              onEdit={handleEditSuite}
              onDelete={handleDeleteSuite}
            />
          ) : (
            <div className="bg-white rounded-apple border border-apple-gray-2 h-full" data-element="testsuites-empty-state">
              <div className="flex items-center justify-center py-12">
                <div className="text-center" data-element="testsuites-empty-content">
                  <Folder className="w-16 h-16 text-apple-gray-3 mx-auto mb-4" />
                  <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                    No Test Suite Selected
                  </h3>
                  <p className="text-apple-gray-4 max-w-md">
                    Select a test suite from the tree to view its details
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TestSuiteBrowser; 