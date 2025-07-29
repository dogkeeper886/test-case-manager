import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, ChevronDown, Folder, FolderOpen, FileText, Users, Calendar, Hash, BarChart3, User } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import TestSuiteTree from '../components/test-cases/TestSuiteTree';
import SuiteDetailsDialog from '../components/test-cases/SuiteDetailsDialog';
import TestCaseDetailModal from '../components/test-cases/TestCaseDetailModal';
import { testSuitesAPI, projectsAPI } from '../services/api';

const TestSuiteBrowser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // State management
  const [testSuites, setTestSuites] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [expandedSuites, setExpandedSuites] = useState(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // State for SuiteDetailsDialog
  const [isSuiteDetailsDialogOpen, setIsSuiteDetailsDialogOpen] = useState(false);
  const [suiteToEdit, setSuiteToEdit] = useState(null);

  // State for TestCaseDetailModal
  const [isTestCaseModalOpen, setIsTestCaseModalOpen] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Restore state from URL parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const expandedParam = searchParams.get('expanded');
    const projectParam = searchParams.get('project');
    
    // Restore project selection immediately
    if (projectParam) {
      setSelectedProjectId(projectParam);
    }
    
    // Store expanded state to restore after data loads
    if (expandedParam) {
      const expandedIds = expandedParam.split(',').filter(id => id.trim() !== '');
      // Store in sessionStorage temporarily
      sessionStorage.setItem('restoreExpandedSuites', JSON.stringify(expandedIds));
    }
  }, [location.search]);

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
      // Fetch projects and test suites in parallel
      const [projectsResponse, testSuitesResponse] = await Promise.all([
        projectsAPI.getAll(),
        testSuitesAPI.getAll(true) // Get hierarchical data with test cases
      ]);

      // Ensure we have arrays
      const projectsData = Array.isArray(projectsResponse.data) ? projectsResponse.data : 
                          Array.isArray(projectsResponse.data.data) ? projectsResponse.data.data : [];
      
      const testSuitesData = Array.isArray(testSuitesResponse.data) ? testSuitesResponse.data : 
                            Array.isArray(testSuitesResponse.data.data) ? testSuitesResponse.data.data : [];

      setProjects(projectsData);
      setTestSuites(testSuitesData);

      // Set default project if none selected
      if (projectsData.length > 0 && !selectedProjectId) {
        const defaultProject = projectsData[0];
        setSelectedProjectId(defaultProject.id.toString());
      }

      // Restore expanded suites state after data is loaded
      const restoreExpandedSuites = sessionStorage.getItem('restoreExpandedSuites');
      if (restoreExpandedSuites) {
        try {
          const expandedIds = JSON.parse(restoreExpandedSuites);
          console.log('Restoring expanded suites:', expandedIds);
          setExpandedSuites(new Set(expandedIds));
          // Clear the stored state
          sessionStorage.removeItem('restoreExpandedSuites');
        } catch (error) {
          console.error('Error restoring expanded suites:', error);
          sessionStorage.removeItem('restoreExpandedSuites');
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      // Set empty arrays on error
      setProjects([]);
      setTestSuites([]);
    }
  };

  // Filter test suites by selected project
  const filteredTestSuites = (testSuites || []).filter(suite => 
    suite.project_id && suite.project_id.toString() === selectedProjectId
  );

  // Handle suite selection
  const handleSuiteSelect = (suite) => {
    console.log('Selected suite:', suite);
    // setSelectedSuiteId(suite.id); // Removed
    // setSelectedSuite(suite); // Removed
  };

  // Handle test case selection from tree
  const handleTestCaseSelect = (testCase) => {
    console.log('Selected test case from tree:', testCase);
    
    // Open modal instead of navigating - this preserves all tree state!
    setSelectedTestCaseId(testCase.id);
    setIsTestCaseModalOpen(true);
  };

  // Handle closing test case modal
  const handleCloseTestCaseModal = () => {
    setIsTestCaseModalOpen(false);
    setSelectedTestCaseId(null);
  };

  // Handle search from layout
  const handleLayoutSearch = (query) => {
    // setSearchQuery(query); // Removed
    // TODO: Implement global search
  };

  // Project selection handler
  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    setShowProjectDropdown(false);
    // Reset selected suite when changing projects
    // setSelectedSuiteId(null); // Removed
    // setSelectedSuite(null); // Removed
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
  const selectedProject = (projects || []).find(p => p.id.toString() === selectedProjectId);

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
        <div className="xl:col-span-5" data-element="testsuites-tree-section">
          <div className="bg-white rounded-apple border border-apple-gray-2 h-full" data-element="testsuites-tree-container">
            <div className="p-4 border-b border-apple-gray-2" data-element="testsuites-tree-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="testsuites-tree-title">
                  Test Suites
                </h3>
                <Badge variant="outline" size="sm" className="ml-auto">
                  {filteredTestSuites.length} {filteredTestSuites.length === 1 ? 'suite' : 'suites'}
                </Badge>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-300px)]" data-element="testsuites-tree-body">
              {filteredTestSuites.length > 0 ? (
                <TestSuiteTree
                  testSuites={filteredTestSuites}
                  onSuiteSelect={handleSuiteSelect}
                  onTestCaseSelect={handleTestCaseSelect}
                  expandedSuites={expandedSuites}
                  onToggleExpansion={toggleSuiteExpansion}
                  onViewSuite={handleViewSuite}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-12" data-element="testsuites-empty-state">
                  <Folder className="w-16 h-16 text-apple-gray-3 mx-auto mb-4" />
                  <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                    No Test Suites Found
                  </h3>
                  <p className="text-apple-gray-4 max-w-md text-center mx-auto">
                    It looks like there are no test suites in this project yet. Click "Add Test Suite" to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
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

      {/* Test Case Detail Modal */}
      <TestCaseDetailModal
        testCaseId={selectedTestCaseId}
        isOpen={isTestCaseModalOpen}
        onClose={handleCloseTestCaseModal}
      />
    </Layout>
  );
};

export default TestSuiteBrowser; 