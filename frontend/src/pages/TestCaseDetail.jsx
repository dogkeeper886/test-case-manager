import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Copy, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  SkipForward,
  Play,
  FileText,
  Settings,
  Tag,
  Download,
  Share2,
  Info,
  List,
  ChevronRight,
  Calendar,
  Hash,
  BookOpen,
  Layers,
  Target,
  AlertCircle,
  X,
  Save
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';
import { TestCaseEditForm } from '../components/test-cases';
import { testCasesAPI, projectsAPI, testSuitesAPI } from '../services/api';
import { showSuccess, showError, showWarning, dismissToast } from '../utils/toast';

const TestCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [projects, setProjects] = useState([]);
  const [testSuites, setTestSuites] = useState([]);
  const formRef = useRef(null);

  useEffect(() => {
    fetchTestCase();
    fetchProjectsAndSuites();
  }, [id]);

  const fetchTestCase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await testCasesAPI.getById(id);
      
      // The API returns {success: true, data: {...}}, so we need response.data.data
      setTestCase(response.data.data);
      
    } catch (err) {
      console.error('Error fetching test case:', err);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to load test case. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Test case not found. It may have been deleted or moved.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to view this test case.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 1: return 'pending';
      case 2: return 'success';
      case 3: return 'error';
      case 4: return 'warning';
      case 5: return 'default';
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

  const getImportanceText = (importance) => {
    switch (importance) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Medium';
    }
  };

  const getImportanceBadgeVariant = (importance) => {
    switch (importance) {
      case 1: return 'default';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'warning';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <Clock className="w-4 h-4" />;
      case 2: return <CheckCircle className="w-4 h-4" />;
      case 3: return <XCircle className="w-4 h-4" />;
      case 4: return <AlertTriangle className="w-4 h-4" />;
      case 5: return <SkipForward className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 1: return 'default';
      case 2: return 'warning';
      case 3: return 'error';
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

  const fetchProjectsAndSuites = async () => {
    try {
      const [projectsResponse, suitesResponse] = await Promise.all([
        projectsAPI.getAll(),
        testSuitesAPI.getAll()
      ]);
      
      setProjects(projectsResponse.data.data || []);
      setTestSuites(suitesResponse.data.data || []);
    } catch (err) {
      console.error('Error fetching projects and suites:', err);
    }
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveEdit = async (formData) => {
    try {
      setLoading(true);
      
      // Show loading state
      const loadingToastId = showWarning('Saving test case...', { autoClose: false });
      
      // Update the test case
      const response = await testCasesAPI.update(testCase.id, formData);
      
      // Dismiss loading toast and show success
      dismissToast(loadingToastId);
      showSuccess('Test case updated successfully');
      
      // Refresh the test case data
      await fetchTestCase();
      
      // Exit edit mode
      setIsEditMode(false);
      
    } catch (err) {
      console.error('Error updating test case:', err);
      
      // Show specific error message based on error type
      let errorMessage = 'Failed to update test case. Please try again.';
      
      if (err.response?.status === 404) {
        errorMessage = 'Test case not found. It may have been deleted.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to update this test case.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate test case:', testCase);
  };

  const handleDelete = async () => {
    const confirmMessage = `Are you sure you want to delete the test case "${testCase.title}"?\n\nThis action cannot be undone and will permanently remove:\n• Test case: ${testCase.title}\n• ID: ${testCase.id}\n• All associated data and execution history`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // Show loading state
        const loadingToastId = showWarning('Deleting test case...', { autoClose: false });
        
        // Delete the test case
        await testCasesAPI.delete(testCase.id);
        
        // Dismiss loading toast and show success
        dismissToast(loadingToastId);
        showSuccess(`Test case "${testCase.title}" deleted successfully`);
        
        // Navigate back to test cases list
        navigate('/testcases');
        
      } catch (err) {
        console.error('Error deleting test case:', err);
        
        // Show specific error message based on error type
        let errorMessage = 'Failed to delete test case. Please try again.';
        
        if (err.response?.status === 404) {
          errorMessage = 'Test case not found. It may have already been deleted.';
        } else if (err.response?.status === 403) {
          errorMessage = 'You do not have permission to delete this test case.';
        } else if (err.response?.status === 409) {
          errorMessage = 'Cannot delete test case. It may be referenced by other items.';
        } else if (err.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        showError(errorMessage);
      }
    }
  };

  const handleBack = () => {
    navigate('/testcases');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-gray-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto mb-4"></div>
          <p className="text-apple-gray-5">Loading test case...</p>
        </div>
      </div>
    );
  }

  if (error || !testCase) {
    return (
      <div className="min-h-screen bg-apple-gray-1 flex items-center justify-center">
        <Card className="max-w-md">
          <Card.Body className="text-center">
            <p className="text-error mb-4">{error || 'Test case not found'}</p>
            <Button onClick={handleBack}>Go Back</Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Updated tab structure: Content and Meta Data
  const tabs = [
    { id: 'overview', label: 'Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'details', label: 'Meta Data', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Test Cases', href: '/testcases' },
        { label: testCase.title, href: `/testcases/${testCase.id}` }
      ]}
      actions={
        isEditMode ? [
          {
            label: 'Cancel',
            variant: 'ghost',
            icon: <X className="w-4 h-4" />,
            onClick: handleCancelEdit
          },
          {
            label: 'Save',
            variant: 'primary',
            icon: <Save className="w-4 h-4" />,
            onClick: () => {
              // Trigger save from the form
              if (formRef.current && formRef.current.handleSave) {
                formRef.current.handleSave();
              }
            }
          }
        ] : [
          {
            label: 'Edit',
            variant: 'secondary',
            icon: <Edit className="w-4 h-4" />,
            onClick: handleEdit
          },
          {
            label: 'Duplicate',
            variant: 'secondary',
            icon: <Copy className="w-4 h-4" />,
            onClick: handleDuplicate
          },
          {
            label: 'Delete',
            variant: 'danger',
            icon: <Trash2 className="w-4 h-4" />,
            onClick: handleDelete
          }
        ]
      }
      showSearch={false}
    >
      {/* Enhanced Header with Better Visual Hierarchy */}
      <div className="mb-8 bg-white rounded-apple-lg shadow-apple-sm border border-apple-gray-2 p-6" data-element="test-case-header">
        {/* Navigation and Status Row */}
        <div className="flex items-center justify-between mb-6" data-element="test-case-header-top">
          <div className="flex items-center gap-4" data-element="test-case-navigation">
            <Button
              variant="ghost"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBack}
              className="hover:bg-apple-gray-2 focus:ring-2 focus:ring-apple-blue/50"
              data-element="test-case-back-button"
              aria-label="Go back to test cases list"
            >
              Back to Test Cases
            </Button>
            <div className="w-px h-6 bg-apple-gray-3" data-element="test-case-header-divider"></div>
          </div>
          
          {/* Enhanced Status Badges with Better Visual Separation */}
          <div className="flex items-center gap-3" data-element="test-case-status-section">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-apple-gray-1 rounded-full" data-element="test-case-status-container">
              {getStatusIcon(testCase.status)}
              <Badge 
                variant={getStatusBadgeVariant(testCase.status)} 
                size="sm"
                className="font-semibold"
                data-element="test-case-status-badge"
              >
                {getStatusText(testCase.status)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2" data-element="test-case-priority-container">
              <Badge 
                variant={getPriorityBadgeVariant(testCase.priority)} 
                size="sm"
                className="font-semibold"
                data-element="test-case-priority-badge"
              >
                Priority: {getPriorityText(testCase.priority)}
              </Badge>
              <Badge 
                variant={getImportanceBadgeVariant(testCase.importance)} 
                size="sm"
                className="font-semibold"
                data-element="test-case-importance-badge"
              >
                {getImportanceText(testCase.importance)} Importance
              </Badge>
            </div>
            
            {testCase.execution_type === 2 && (
              <Badge 
                variant="success" 
                size="sm"
                className="font-semibold"
                data-element="test-case-automated-badge"
              >
                <Target className="w-3 h-3 mr-1" />
                Automated
              </Badge>
            )}
          </div>
        </div>
        
        {/* Enhanced Title Section */}
        <div className="mb-4" data-element="test-case-title-section">
          <h1 className="text-3xl font-sf-display font-bold text-apple-gray-7 mb-3 leading-tight" data-element="test-case-title">
            {testCase.title}
          </h1>
          
          {/* Enhanced Meta Information with Icons */}
          <div className="flex items-center gap-6 text-apple-gray-5" data-element="test-case-meta">
            <div className="flex items-center gap-2" data-element="test-case-id">
              <Hash className="w-4 h-4" />
              <span className="font-mono font-semibold text-apple-gray-6">#{testCase.id}</span>
            </div>
            
            {testCase.external_id && (
              <div className="flex items-center gap-2" data-element="test-case-external-id-header">
                <Tag className="w-4 h-4" />
                <span className="font-mono text-sm">External: {testCase.external_id}</span>
              </div>
            )}
            
            {testCase.version && (
              <div className="flex items-center gap-2" data-element="test-case-version-header">
                <Layers className="w-4 h-4" />
                <span className="text-sm font-medium">v{testCase.version}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2" data-element="test-case-created-date">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Created {new Date(testCase.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditMode && (
        <TestCaseEditForm
          ref={formRef}
          testCase={testCase}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          projects={projects}
          testSuites={testSuites}
        />
      )}

      {/* View Mode */}
      {!isEditMode && (
        <>
          {/* Enhanced Tabs with Better Visual Design */}
          <div className="mb-8" data-element="test-case-tabs">
            <div className="bg-white rounded-apple-lg shadow-apple-sm border border-apple-gray-2 p-2" data-element="test-case-tabs-container">
              <div className="flex space-x-1" data-element="test-case-tabs-list">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-3 px-6 py-3 rounded-apple text-sm font-semibold transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-apple-blue/50
                      ${activeTab === tab.id
                        ? 'bg-apple-blue text-white shadow-apple-sm'
                        : 'text-apple-gray-6 hover:text-apple-gray-7 hover:bg-apple-gray-1'
                      }
                    `}
                    data-element={`test-case-tab-${tab.id}`}
                    aria-label={`Switch to ${tab.label} tab`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Enhanced for Better Element Identification */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Enhanced Summary Section */}
                <Card elevation="lg" className="border-l-4 border-l-apple-blue" data-element="test-case-summary-card">
                  <Card.Header>
                    <div className="flex items-center gap-3" data-element="test-case-summary-header">
                      <div className="w-10 h-10 bg-apple-blue/10 rounded-full flex items-center justify-center" data-element="test-case-summary-icon">
                        <BookOpen className="w-5 h-5 text-apple-blue" />
                      </div>
                      <div>
                        <h3 className="text-xl font-sf font-bold text-apple-gray-7" data-element="test-case-summary-title">
                          Test Case Summary
                        </h3>
                        <p className="text-sm text-apple-gray-5" data-element="test-case-summary-subtitle">
                          Overview and description of the test case
                        </p>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body data-element="test-case-summary-content">
                    <div 
                      className="text-apple-gray-6 leading-relaxed prose prose-sm max-w-none prose-headings:text-apple-gray-7 prose-strong:text-apple-gray-7"
                      dangerouslySetInnerHTML={{ __html: testCase.description || 'No description available' }}
                      data-element="test-case-summary-text"
                    />
                  </Card.Body>
                </Card>

                {/* Enhanced Preconditions Section */}
                {testCase.prerequisites && (
                  <Card elevation="lg" className="border-l-4 border-l-warning" data-element="test-case-prerequisites-card">
                    <Card.Header>
                      <div className="flex items-center gap-3" data-element="test-case-prerequisites-header">
                        <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center" data-element="test-case-prerequisites-icon">
                          <AlertCircle className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <h3 className="text-xl font-sf font-bold text-apple-gray-7" data-element="test-case-prerequisites-title">
                            Preconditions
                          </h3>
                          <p className="text-sm text-apple-gray-5" data-element="test-case-prerequisites-subtitle">
                            Requirements that must be met before executing this test
                          </p>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body data-element="test-case-prerequisites-content">
                      <div 
                        className="text-apple-gray-6 leading-relaxed prose prose-sm max-w-none prose-headings:text-apple-gray-7 prose-strong:text-apple-gray-7"
                        dangerouslySetInnerHTML={{ __html: testCase.prerequisites }}
                        data-element="test-case-prerequisites-text"
                      />
                    </Card.Body>
                  </Card>
                )}

                {/* Enhanced Test Steps Section */}
                <Card elevation="lg" className="border-l-4 border-l-success" data-element="test-case-steps-card">
                  <Card.Header>
                    <div className="flex items-center justify-between" data-element="test-case-steps-header">
                      <div className="flex items-center gap-3" data-element="test-case-steps-header-left">
                        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center" data-element="test-case-steps-icon">
                          <List className="w-5 h-5 text-success" />
                        </div>
                        <div>
                          <h3 className="text-xl font-sf font-bold text-apple-gray-7" data-element="test-case-steps-title">
                            Test Steps
                          </h3>
                          <p className="text-sm text-apple-gray-5" data-element="test-case-steps-subtitle">
                            Step-by-step instructions and expected results
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" size="lg" className="font-semibold" data-element="test-case-steps-count">
                        {testCase.steps?.length || 0} Steps
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body data-element="test-case-steps-content">
                    {testCase.steps && testCase.steps.length > 0 ? (
                      <div data-element="test-case-steps-list">
                        {/* Enhanced Desktop Table View */}
                        <div className="hidden lg:block" data-element="test-case-steps-table-desktop">
                          <div className="overflow-hidden rounded-apple border border-apple-gray-2" data-element="test-case-steps-table-container">
                            <table className="w-full border-collapse bg-white" data-element="test-case-steps-table">
                              <thead>
                                <tr className="bg-apple-gray-1 border-b border-apple-gray-2" data-element="test-case-steps-table-header">
                                  <th className="text-left py-4 px-6 font-bold text-apple-gray-7 text-sm uppercase tracking-wide" data-element="test-case-steps-table-header-step">
                                    Step #
                                  </th>
                                  <th className="text-left py-4 px-6 font-bold text-apple-gray-7 text-sm uppercase tracking-wide" data-element="test-case-steps-table-header-action">
                                    Action
                                  </th>
                                  <th className="text-left py-4 px-6 font-bold text-apple-gray-7 text-sm uppercase tracking-wide" data-element="test-case-steps-table-header-expected">
                                    Expected Result
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-apple-gray-1" data-element="test-case-steps-table-body">
                                {testCase.steps.map((step, index) => (
                                  <tr 
                                    key={step.id || index} 
                                    className="hover:bg-apple-gray-1/50 transition-colors duration-200"
                                    data-element={`test-case-step-row-${index + 1}`}
                                  >
                                    <td className="py-6 px-6 align-top" data-element={`test-case-step-number-cell-${index + 1}`}>
                                      <div className="flex items-center gap-3" data-element={`test-case-step-number-container-${index + 1}`}>
                                        <div 
                                          className="flex-shrink-0 w-10 h-10 bg-apple-blue text-white rounded-full flex items-center justify-center text-sm font-bold shadow-apple-sm"
                                          data-element={`test-case-step-number-${index + 1}`}
                                        >
                                          {step.step_number || index + 1}
                                        </div>
                                        {step.execution_type === 2 && (
                                          <Badge variant="success" size="sm" className="font-semibold" data-element={`test-case-step-automated-${index + 1}`}>
                                            <Target className="w-3 h-3 mr-1" />
                                            Auto
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-6 px-6 align-top" data-element={`test-case-step-action-cell-${index + 1}`}>
                                      <div className="space-y-2" data-element={`test-case-step-action-container-${index + 1}`}>
                                        <h4 className="font-semibold text-apple-gray-7 text-sm uppercase tracking-wide" data-element={`test-case-step-action-label-${index + 1}`}>
                                          Action
                                        </h4>
                                        <div 
                                          className="text-apple-gray-7 prose prose-sm max-w-none prose-headings:text-apple-gray-7 prose-strong:text-apple-gray-7"
                                          dangerouslySetInnerHTML={{ __html: step.action }}
                                          data-element={`test-case-step-action-${index + 1}`}
                                        />
                                      </div>
                                    </td>
                                    <td className="py-6 px-6 align-top" data-element={`test-case-step-expected-cell-${index + 1}`}>
                                      <div className="space-y-2" data-element={`test-case-step-expected-container-${index + 1}`}>
                                        <h4 className="font-semibold text-apple-gray-7 text-sm uppercase tracking-wide" data-element={`test-case-step-expected-label-${index + 1}`}>
                                          Expected Result
                                        </h4>
                                        <div 
                                          className="text-apple-gray-6 prose prose-sm max-w-none prose-headings:text-apple-gray-6 prose-strong:text-apple-gray-6"
                                          dangerouslySetInnerHTML={{ __html: step.expected_result }}
                                          data-element={`test-case-step-expected-${index + 1}`}
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Enhanced Mobile Card View */}
                        <div className="lg:hidden space-y-6" data-element="test-case-steps-cards-mobile">
                          {testCase.steps.map((step, index) => (
                            <div 
                              key={step.id || index} 
                              className="bg-white border border-apple-gray-2 rounded-apple-lg p-6 hover:border-apple-gray-3 hover:shadow-apple-sm transition-all duration-200"
                              data-element={`test-case-step-card-${index + 1}`}
                            >
                              <div className="flex items-start gap-4" data-element={`test-case-step-card-content-${index + 1}`}>
                                <div 
                                  className="flex-shrink-0 w-12 h-12 bg-apple-blue text-white rounded-full flex items-center justify-center text-sm font-bold shadow-apple-sm"
                                  data-element={`test-case-step-number-mobile-${index + 1}`}
                                >
                                  {step.step_number || index + 1}
                                </div>
                                <div className="flex-1 space-y-4" data-element={`test-case-step-content-mobile-${index + 1}`}>
                                  <div className="flex items-center gap-2" data-element={`test-case-step-header-${index + 1}`}>
                                    <h4 className="font-bold text-apple-gray-7 text-sm uppercase tracking-wide" data-element={`test-case-step-action-title-mobile-${index + 1}`}>
                                      Action
                                    </h4>
                                    {step.execution_type === 2 && (
                                      <Badge variant="success" size="sm" className="font-semibold" data-element={`test-case-step-automated-mobile-${index + 1}`}>
                                        <Target className="w-3 h-3 mr-1" />
                                        Automated
                                      </Badge>
                                    )}
                                  </div>
                                  <div 
                                    className="text-apple-gray-7 prose prose-sm max-w-none prose-headings:text-apple-gray-7 prose-strong:text-apple-gray-7"
                                    dangerouslySetInnerHTML={{ __html: step.action }}
                                    data-element={`test-case-step-action-mobile-${index + 1}`}
                                  />
                                  <div className="pt-4 border-t border-apple-gray-2" data-element={`test-case-step-expected-section-${index + 1}`}>
                                    <h4 className="font-bold text-apple-gray-7 text-sm uppercase tracking-wide mb-3" data-element={`test-case-step-expected-title-mobile-${index + 1}`}>
                                      Expected Result
                                    </h4>
                                    <div 
                                      className="text-apple-gray-6 prose prose-sm max-w-none prose-headings:text-apple-gray-6 prose-strong:text-apple-gray-6"
                                      dangerouslySetInnerHTML={{ __html: step.expected_result }}
                                      data-element={`test-case-step-expected-mobile-${index + 1}`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12" data-element="test-case-no-steps">
                        <div className="w-20 h-20 bg-apple-gray-2 rounded-full flex items-center justify-center mx-auto mb-6" data-element="test-case-no-steps-icon">
                          <Play className="w-10 h-10 text-apple-gray-4" />
                        </div>
                        <h3 className="text-xl font-sf font-bold text-apple-gray-6 mb-3" data-element="test-case-no-steps-title">
                          No test steps defined
                        </h3>
                        <p className="text-apple-gray-5 max-w-md mx-auto" data-element="test-case-no-steps-description">
                          Add test steps to define the actions and expected results for this test case.
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Enhanced Basic Details */}
                <Card elevation="lg" className="border-l-4 border-l-info" data-element="test-case-details-card">
                  <Card.Header>
                    <div className="flex items-center gap-3" data-element="test-case-details-header">
                      <div className="w-10 h-10 bg-info/10 rounded-full flex items-center justify-center" data-element="test-case-details-icon">
                        <Info className="w-5 h-5 text-info" />
                      </div>
                      <div>
                        <h3 className="text-xl font-sf font-bold text-apple-gray-7" data-element="test-case-details-title">
                          Basic Information
                        </h3>
                        <p className="text-sm text-apple-gray-5" data-element="test-case-details-subtitle">
                          Core details and metadata
                        </p>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body data-element="test-case-details-content">
                    <div className="space-y-6" data-element="test-case-details-list">
                      <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-project">
                        <div className="flex items-center gap-3" data-element="test-case-project-label-container">
                          <BookOpen className="w-4 h-4 text-apple-gray-4" />
                          <span className="font-semibold text-apple-gray-6">Project</span>
                        </div>
                        <span className="font-bold text-apple-gray-7" data-element="test-case-project-value">{testCase.project_name || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-suite">
                        <div className="flex items-center gap-3" data-element="test-case-suite-label-container">
                          <Layers className="w-4 h-4 text-apple-gray-4" />
                          <span className="font-semibold text-apple-gray-6">Test Suite</span>
                        </div>
                        <span className="font-bold text-apple-gray-7" data-element="test-case-suite-value">{testCase.test_suite_name || 'No Suite'}</span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-execution-type">
                        <div className="flex items-center gap-3" data-element="test-case-execution-type-label-container">
                          <Target className="w-4 h-4 text-apple-gray-4" />
                          <span className="font-semibold text-apple-gray-6">Execution Type</span>
                        </div>
                        <Badge 
                          variant={testCase.execution_type === 1 ? 'manual' : 'automated'} 
                          size="sm"
                          className="font-semibold"
                          data-element="test-case-execution-type-value"
                        >
                          {testCase.execution_type === 1 ? 'Manual' : 'Automated'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-importance">
                        <div className="flex items-center gap-3" data-element="test-case-importance-label-container">
                          <AlertCircle className="w-4 h-4 text-apple-gray-4" />
                          <span className="font-semibold text-apple-gray-6">Importance</span>
                        </div>
                        <Badge 
                          variant={getImportanceBadgeVariant(testCase.importance)} 
                          size="sm"
                          className="font-semibold"
                          data-element="test-case-importance-value"
                        >
                          {getImportanceText(testCase.importance)}
                        </Badge>
                      </div>
                      
                      {testCase.external_id && (
                        <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-external-id">
                          <div className="flex items-center gap-3" data-element="test-case-external-id-label-container">
                            <Tag className="w-4 h-4 text-apple-gray-4" />
                            <span className="font-semibold text-apple-gray-6">External ID</span>
                          </div>
                          <span className="font-bold text-apple-gray-7 font-mono text-sm" data-element="test-case-external-id-value">{testCase.external_id}</span>
                        </div>
                      )}
                      
                      {testCase.internal_id && (
                        <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-internal-id">
                          <div className="flex items-center gap-3" data-element="test-case-internal-id-label-container">
                            <Hash className="w-4 h-4 text-apple-gray-4" />
                            <span className="font-semibold text-apple-gray-6">Internal ID</span>
                          </div>
                          <span className="font-bold text-apple-gray-7 font-mono text-sm" data-element="test-case-internal-id-value">{testCase.internal_id}</span>
                        </div>
                      )}
                      
                      {testCase.version && (
                        <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-version">
                          <div className="flex items-center gap-3" data-element="test-case-version-label-container">
                            <Layers className="w-4 h-4 text-apple-gray-4" />
                            <span className="font-semibold text-apple-gray-6">Version</span>
                          </div>
                          <span className="font-bold text-apple-gray-7" data-element="test-case-version-value">v{testCase.version}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between py-3 border-b border-apple-gray-1" data-element="test-case-created">
                        <div className="flex items-center gap-3" data-element="test-case-created-label-container">
                          <Calendar className="w-4 h-4 text-apple-gray-4" />
                          <span className="font-semibold text-apple-gray-6">Created</span>
                        </div>
                        <span className="font-bold text-apple-gray-7" data-element="test-case-created-value">
                          {new Date(testCase.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between py-3" data-element="test-case-updated">
                        <div className="flex items-center gap-3" data-element="test-case-updated-label-container">
                          <Calendar className="w-4 h-4 text-apple-gray-4" />
                          <span className="font-semibold text-apple-gray-6">Updated</span>
                        </div>
                        <span className="font-bold text-apple-gray-7" data-element="test-case-updated-value">
                          {new Date(testCase.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {testCase.import_source && (
                        <div className="flex items-center justify-between py-3 border-t border-apple-gray-1 mt-6" data-element="test-case-import-source">
                          <div className="flex items-center gap-3" data-element="test-case-import-source-label-container">
                            <Download className="w-4 h-4 text-apple-gray-4" />
                            <span className="font-semibold text-apple-gray-6">Import Source</span>
                          </div>
                          <span className="font-bold text-apple-gray-7 capitalize" data-element="test-case-import-source-value">{testCase.import_source}</span>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                {/* Enhanced Custom Fields */}
                <Card elevation="lg" className="border-l-4 border-l-warning" data-element="test-case-custom-fields-card">
                  <Card.Header>
                    <div className="flex items-center justify-between" data-element="test-case-custom-fields-header">
                      <div className="flex items-center gap-3" data-element="test-case-custom-fields-header-left">
                        <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center" data-element="test-case-custom-fields-icon">
                          <Settings className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                          <h3 className="text-xl font-sf font-bold text-apple-gray-7" data-element="test-case-custom-fields-title">
                            Custom Fields
                          </h3>
                          <p className="text-sm text-apple-gray-5" data-element="test-case-custom-fields-subtitle">
                            Additional metadata and properties
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" size="lg" className="font-semibold" data-element="test-case-custom-fields-count">
                        {testCase.custom_fields?.length || 0} Fields
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body data-element="test-case-custom-fields-content">
                    {testCase.custom_fields && testCase.custom_fields.length > 0 ? (
                      <div className="space-y-4" data-element="test-case-custom-fields-list">
                        {testCase.custom_fields.map((field, index) => (
                          <div 
                            key={field.id} 
                            className="bg-apple-gray-1 border border-apple-gray-2 rounded-apple p-4 hover:border-apple-gray-3 hover:bg-apple-gray-2/50 transition-all duration-200"
                            data-element={`test-case-custom-field-${index + 1}`}
                          >
                            <div className="space-y-3" data-element={`test-case-custom-field-content-${index + 1}`}>
                              <div className="flex items-center gap-2" data-element={`test-case-custom-field-header-${index + 1}`}>
                                <Tag className="w-4 h-4 text-apple-gray-4" />
                                <h4 className="font-bold text-apple-gray-7 text-sm uppercase tracking-wide" data-element={`test-case-custom-field-name-${index + 1}`}>
                                  {field.field_name}
                                </h4>
                              </div>
                              <p className="text-apple-gray-6 font-sf pl-6" data-element={`test-case-custom-field-value-${index + 1}`}>
                                {field.field_value || 'No value'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12" data-element="test-case-no-custom-fields">
                        <div className="w-20 h-20 bg-apple-gray-2 rounded-full flex items-center justify-center mx-auto mb-6" data-element="test-case-no-custom-fields-icon">
                          <Settings className="w-10 h-10 text-apple-gray-4" />
                        </div>
                        <h3 className="text-xl font-sf font-bold text-apple-gray-6 mb-3" data-element="test-case-no-custom-fields-title">
                          No custom fields
                        </h3>
                        <p className="text-apple-gray-5 max-w-md mx-auto" data-element="test-case-no-custom-fields-description">
                          Custom fields allow you to add additional metadata to your test cases.
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}
          </div>
        </>
      )}
    </Layout>
  );
};

export default TestCaseDetail; 