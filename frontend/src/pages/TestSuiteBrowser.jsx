import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown, Folder, FolderOpen, FileText, Users, Calendar, Hash, BarChart3, User, Edit, Trash2 } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import TestSuiteTree from '../components/test-cases/TestSuiteTree';
import SuiteDetailsPanel from '../components/test-cases/SuiteDetailsPanel';
import SuiteDetailsDialog from '../components/test-cases/SuiteDetailsDialog';
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

  // State for SuiteDetailsDialog
  const [isSuiteDetailsDialogOpen, setIsSuiteDetailsDialogOpen] = useState(false);
  const [suiteToEdit, setSuiteToEdit] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle project selection changes
  useEffect(() => {
    if (selectedProjectId && testSuites.length > 0) {
      console.log('Project selection changed to:', selectedProjectId);
      console.log('Available test suites:', testSuites.length);
      const filtered = testSuites.filter(suite => suite.project_id?.toString() === selectedProjectId);
      console.log('Filtered test suites:', filtered.length);
    }
  }, [selectedProjectId, testSuites]);

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
      
      // Set first project as default if available and no project is currently selected
      if (projectsData.length > 0 && !selectedProjectId) {
        const defaultProjectId = projectsData[0].id.toString();
        setSelectedProjectId(defaultProjectId);
        console.log('Setting default project:', defaultProjectId);
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
    // Temporarily show all suites for debugging
    console.log(`Suite ${suite.id}: ${suite.name} (project ${suite.project_id})`);
    return true;
    
    // Original filtering logic (commented out for debugging)
    /*
    if (!selectedProjectId) {
      console.log('No project selected, showing all suites');
      return true;
    }
    const matches = suite.project_id?.toString() === selectedProjectId;
    console.log(`Suite ${suite.id} (project ${suite.project_id}) matches selected project ${selectedProjectId}: ${matches}`);
    return matches;
    */
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
    setSuiteToEdit(suite);
    setIsSuiteDetailsDialogOpen(true);
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
  const toggleSuiteExpansion = (expandedSuitesSet) => {
    console.log('Toggle expansion called with:', expandedSuitesSet);
    setExpandedSuites(expandedSuitesSet);
  };

  // Handle view suite details
  const handleViewSuite = (suite) => {
    setSuiteToEdit(suite);
    setIsSuiteDetailsDialogOpen(true);
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
        },
        ...(selectedSuite ? [
          {
            label: 'Edit Suite',
            variant: 'outline',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => handleEditSuite(selectedSuite)
          },
          {
            label: 'Delete Suite',
            variant: 'outline',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => handleDeleteSuite(selectedSuite)
          }
        ] : [])
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
          
          {/* Project Selector */}
          <div className="relative" data-element="testsuites-project-selector">
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-apple-gray-3 rounded-apple hover:border-apple-gray-4 transition-colors"
              data-element="testsuites-project-button"
            >
              <div className="w-2 h-2 bg-apple-blue rounded-full" data-element="testsuites-project-indicator"></div>
              <span className="text-sm font-medium text-apple-gray-7" data-element="testsuites-project-name">
                {selectedProject?.name || 'Select Project'}
              </span>
              <ChevronDown className="w-4 h-4 text-apple-gray-5" data-element="testsuites-project-chevron" />
            </button>
            
            {showProjectDropdown && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-apple-gray-3 rounded-apple shadow-lg z-10" data-element="testsuites-project-dropdown">
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => handleProjectSelect(project.id.toString())}
                    className="w-full px-4 py-2 text-left hover:bg-apple-gray-2 transition-colors flex items-center gap-2"
                    data-element={`testsuites-project-option-${project.id}`}
                  >
                    <div className={`w-2 h-2 rounded-full ${project.id.toString() === selectedProjectId ? 'bg-apple-blue' : 'bg-apple-gray-4'}`}></div>
                    <span className="text-sm text-apple-gray-7">{project.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Project Info Bar */}
        {selectedProject && (
          <div className="mt-4 p-4 bg-apple-gray-1 rounded-apple border border-apple-gray-2" data-element="testsuites-project-info">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-apple-blue rounded-full"></div>
                  <span className="text-sm font-medium text-apple-gray-7">{selectedProject.name}</span>
                </div>
                <div className="flex items-center gap-2 text-apple-gray-5">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{selectedProject.owner || 'No Owner'}</span>
                </div>
                <div className="flex items-center gap-2 text-apple-gray-5">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Created {new Date(selectedProject.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-apple-gray-5">{filteredTestSuites.length} Test Suites</span>
                <Badge variant="outline" size="sm" className="bg-apple-green/10 text-apple-green border-apple-green/20">
                  active
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
                  onViewSuite={handleViewSuite}
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

      {/* Suite Details Dialog */}
      <SuiteDetailsDialog
        isOpen={isSuiteDetailsDialogOpen}
        onClose={() => {
          setIsSuiteDetailsDialogOpen(false);
          setSuiteToEdit(null);
        }}
        suite={suiteToEdit}
        onEdit={(suite) => {
          console.log('Edit suite from dialog:', suite);
          // TODO: Implement suite editing
        }}
        onDelete={(suite) => {
          console.log('Delete suite from dialog:', suite);
          // TODO: Implement suite deletion with confirmation
          setIsSuiteDetailsDialogOpen(false);
          setSuiteToEdit(null);
        }}
      />
    </Layout>
  );
};

export default TestSuiteBrowser; 