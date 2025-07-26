import React, { useState, useEffect } from 'react';
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
  List
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

  // Updated tab structure: Overview and Details
  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'details', label: 'Details', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <Layout
      breadcrumbs={[
        { label: 'Test Cases', href: '/testcases' },
        { label: testCase.title, href: `/testcases/${testCase.id}` }
      ]}
      actions={[
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
      ]}
      showSearch={false}
    >
      {/* Header */}
      <div className="mb-6" data-element="test-case-header">
        <div className="flex items-center gap-4 mb-4" data-element="test-case-header-actions">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
            data-element="test-case-back-button"
          >
            Back
          </Button>
          <div className="flex items-center gap-2" data-element="test-case-status-badges">
            {getStatusIcon(testCase.status)}
            <Badge variant={getStatusBadgeVariant(testCase.status)} data-element="test-case-status-badge">
              {getStatusText(testCase.status)}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(testCase.priority)} data-element="test-case-priority-badge">
              {getPriorityText(testCase.priority)}
            </Badge>
            <Badge variant={getImportanceBadgeVariant(testCase.importance)} data-element="test-case-importance-badge">
              {getImportanceText(testCase.importance)}
            </Badge>
            {testCase.execution_type === 2 && (
              <Badge variant="success" size="sm" data-element="test-case-automated-badge">
                Automated
              </Badge>
            )}
          </div>
        </div>
        
        <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7 mb-2" data-element="test-case-title">
          {testCase.title}
        </h1>
        
        <div className="flex items-center gap-4 text-apple-gray-5" data-element="test-case-meta">
          <p className="text-lg" data-element="test-case-id">
            Test Case #{testCase.id}
          </p>
          {testCase.external_id && (
            <p className="text-sm font-mono" data-element="test-case-external-id-header">
              External ID: {testCase.external_id}
            </p>
          )}
          {testCase.version && (
            <p className="text-sm" data-element="test-case-version-header">
              Version {testCase.version}
            </p>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {isEditMode && (
        <TestCaseEditForm
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
          {/* Tabs */}
          <div className="mb-6" data-element="test-case-tabs">
            <div className="flex space-x-1 bg-apple-gray-2 p-1 rounded-apple" data-element="test-case-tabs-container">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-apple text-sm font-medium transition-all
                    ${activeTab === tab.id
                      ? 'bg-white text-apple-gray-7 shadow-apple-sm'
                      : 'text-apple-gray-5 hover:text-apple-gray-7'
                    }
                  `}
                  data-element={`test-case-tab-${tab.id}`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content - Reorganized for better information hierarchy */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 1. Summary Section - First Priority */}
                <Card elevation="sm" data-element="test-case-summary-card">
                  <Card.Header>
                    <h3 className="text-xl font-sf font-semibold text-apple-gray-7" data-element="test-case-summary-title">
                      Summary
                    </h3>
                  </Card.Header>
                  <Card.Body data-element="test-case-summary-content">
                    <div 
                      className="text-apple-gray-6 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: testCase.description || 'No description available' }}
                      data-element="test-case-summary-text"
                    />
                  </Card.Body>
                </Card>

                {/* 2. Preconditions Section - Second Priority */}
                {testCase.prerequisites && (
                  <Card elevation="sm" data-element="test-case-prerequisites-card">
                    <Card.Header>
                      <h3 className="text-xl font-sf font-semibold text-apple-gray-7" data-element="test-case-prerequisites-title">
                        Preconditions
                      </h3>
                    </Card.Header>
                    <Card.Body data-element="test-case-prerequisites-content">
                      <div 
                        className="text-apple-gray-6 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: testCase.prerequisites }}
                        data-element="test-case-prerequisites-text"
                      />
                    </Card.Body>
                  </Card>
                )}

                {/* 3. Test Steps Section - Third Priority */}
                <Card elevation="sm" data-element="test-case-steps-card">
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-sf font-semibold text-apple-gray-7" data-element="test-case-steps-title">
                        Test Steps
                      </h3>
                      <Badge variant="default" size="sm" data-element="test-case-steps-count">
                        {testCase.steps?.length || 0} steps
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body data-element="test-case-steps-content">
                    {testCase.steps && testCase.steps.length > 0 ? (
                      <div data-element="test-case-steps-list">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block" data-element="test-case-steps-table-desktop">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse" data-element="test-case-steps-table">
                              <thead>
                                <tr className="border-b border-apple-gray-2" data-element="test-case-steps-table-header">
                                  <th className="text-left py-3 px-4 font-medium text-apple-gray-6 text-sm uppercase tracking-wide" data-element="test-case-steps-table-header-step">
                                    Step
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-apple-gray-6 text-sm uppercase tracking-wide" data-element="test-case-steps-table-header-action">
                                    Action
                                  </th>
                                  <th className="text-left py-3 px-4 font-medium text-apple-gray-6 text-sm uppercase tracking-wide" data-element="test-case-steps-table-header-expected">
                                    Expected Result
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-apple-gray-1" data-element="test-case-steps-table-body">
                                {testCase.steps.map((step, index) => (
                                  <tr 
                                    key={step.id || index} 
                                    className="hover:bg-apple-gray-1 transition-colors"
                                    data-element={`test-case-step-row-${index + 1}`}
                                  >
                                    <td className="py-4 px-4 align-top" data-element={`test-case-step-number-cell-${index + 1}`}>
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="flex-shrink-0 w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center text-sm font-medium"
                                          data-element={`test-case-step-number-${index + 1}`}
                                        >
                                          {step.step_number || index + 1}
                                        </div>
                                        {step.execution_type === 2 && (
                                          <Badge variant="success" size="sm" data-element={`test-case-step-automated-${index + 1}`}>
                                            Auto
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-4 px-4 align-top" data-element={`test-case-step-action-cell-${index + 1}`}>
                                      <div 
                                        className="text-apple-gray-7 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: step.action }}
                                        data-element={`test-case-step-action-${index + 1}`}
                                      />
                                    </td>
                                    <td className="py-4 px-4 align-top" data-element={`test-case-step-expected-cell-${index + 1}`}>
                                      <div 
                                        className="text-apple-gray-6 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{ __html: step.expected_result }}
                                        data-element={`test-case-step-expected-${index + 1}`}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-4" data-element="test-case-steps-cards-mobile">
                          {testCase.steps.map((step, index) => (
                            <div 
                              key={step.id || index} 
                              className="border border-apple-gray-2 rounded-apple p-4 hover:border-apple-gray-3 transition-colors"
                              data-element={`test-case-step-card-${index + 1}`}
                            >
                              <div className="flex items-start gap-4">
                                <div 
                                  className="flex-shrink-0 w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center text-sm font-medium"
                                  data-element={`test-case-step-number-mobile-${index + 1}`}
                                >
                                  {step.step_number || index + 1}
                                </div>
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-center gap-2" data-element={`test-case-step-header-${index + 1}`}>
                                    <h4 className="font-medium text-apple-gray-7" data-element={`test-case-step-action-title-mobile-${index + 1}`}>
                                      Action
                                    </h4>
                                    {step.execution_type === 2 && (
                                      <Badge variant="success" size="sm" data-element={`test-case-step-automated-mobile-${index + 1}`}>
                                        Automated
                                      </Badge>
                                    )}
                                  </div>
                                  <div 
                                    className="text-apple-gray-7 prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: step.action }}
                                    data-element={`test-case-step-action-mobile-${index + 1}`}
                                  />
                                  <div>
                                    <h4 className="font-medium text-apple-gray-7 mb-2" data-element={`test-case-step-expected-title-mobile-${index + 1}`}>
                                      Expected Result
                                    </h4>
                                    <div 
                                      className="text-apple-gray-6 prose prose-sm max-w-none"
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
                      <div className="text-center py-8" data-element="test-case-no-steps">
                        <Play className="w-16 h-16 text-apple-gray-4 mx-auto mb-4" />
                        <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                          No test steps defined
                        </h3>
                        <p className="text-apple-gray-5">
                          Add test steps to define the actions and expected results for this test case.
                        </p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Details */}
                <Card elevation="sm" data-element="test-case-details-card">
                  <Card.Header>
                    <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="test-case-details-title">
                      Basic Information
                    </h3>
                  </Card.Header>
                  <Card.Body data-element="test-case-details-content">
                    <div className="space-y-4">
                      <div data-element="test-case-project">
                        <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-project-label">Project</label>
                        <p className="text-apple-gray-7 font-medium" data-element="test-case-project-value">{testCase.project_name || 'Unknown'}</p>
                      </div>
                      <div data-element="test-case-suite">
                        <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-suite-label">Test Suite</label>
                        <p className="text-apple-gray-7 font-medium" data-element="test-case-suite-value">{testCase.test_suite_name || 'No Suite'}</p>
                      </div>
                      <div data-element="test-case-execution-type">
                        <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-execution-type-label">Execution Type</label>
                        <p className="text-apple-gray-7 font-medium" data-element="test-case-execution-type-value">
                          {testCase.execution_type === 1 ? 'Manual' : 'Automated'}
                        </p>
                      </div>
                      <div data-element="test-case-importance">
                        <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-importance-label">Importance</label>
                        <div className="flex items-center gap-2" data-element="test-case-importance-value">
                          <Badge variant={getImportanceBadgeVariant(testCase.importance)} size="sm">
                            {getImportanceText(testCase.importance)}
                          </Badge>
                        </div>
                      </div>
                      {testCase.external_id && (
                        <div data-element="test-case-external-id">
                          <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-external-id-label">External ID</label>
                          <p className="text-apple-gray-7 font-medium font-mono text-sm" data-element="test-case-external-id-value">{testCase.external_id}</p>
                        </div>
                      )}
                      {testCase.internal_id && (
                        <div data-element="test-case-internal-id">
                          <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-internal-id-label">Internal ID</label>
                          <p className="text-apple-gray-7 font-medium font-mono text-sm" data-element="test-case-internal-id-value">{testCase.internal_id}</p>
                        </div>
                      )}
                      {testCase.version && (
                        <div data-element="test-case-version">
                          <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-version-label">Version</label>
                          <p className="text-apple-gray-7 font-medium" data-element="test-case-version-value">v{testCase.version}</p>
                        </div>
                      )}
                      <div data-element="test-case-created">
                        <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-created-label">Created</label>
                        <p className="text-apple-gray-7 font-medium" data-element="test-case-created-value">
                          {new Date(testCase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div data-element="test-case-updated">
                        <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-updated-label">Updated</label>
                        <p className="text-apple-gray-7 font-medium" data-element="test-case-updated-value">
                          {new Date(testCase.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      {testCase.import_source && (
                        <div data-element="test-case-import-source">
                          <label className="text-sm font-medium text-apple-gray-5" data-element="test-case-import-source-label">Import Source</label>
                          <p className="text-apple-gray-7 font-medium capitalize" data-element="test-case-import-source-value">{testCase.import_source}</p>
                        </div>
                      )}
                    </div>
                  </Card.Body>
                </Card>

                {/* Custom Fields */}
                <Card elevation="sm" data-element="test-case-custom-fields-card">
                  <Card.Header>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="test-case-custom-fields-title">
                        Custom Fields
                      </h3>
                      <Badge variant="default" size="sm" data-element="test-case-custom-fields-count">
                        {testCase.custom_fields?.length || 0} fields
                      </Badge>
                    </div>
                  </Card.Header>
                  <Card.Body data-element="test-case-custom-fields-content">
                    {testCase.custom_fields && testCase.custom_fields.length > 0 ? (
                      <div className="space-y-4" data-element="test-case-custom-fields-list">
                        {testCase.custom_fields.map((field, index) => (
                          <div 
                            key={field.id} 
                            className="border border-apple-gray-2 rounded-apple p-4 hover:border-apple-gray-3 transition-colors"
                            data-element={`test-case-custom-field-${index + 1}`}
                          >
                            <div className="space-y-2">
                              <h4 className="font-medium text-apple-gray-7 text-sm uppercase tracking-wide" data-element={`test-case-custom-field-name-${index + 1}`}>
                                {field.field_name}
                              </h4>
                              <p className="text-apple-gray-6 font-sf" data-element={`test-case-custom-field-value-${index + 1}`}>
                                {field.field_value || 'No value'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8" data-element="test-case-no-custom-fields">
                        <Settings className="w-16 h-16 text-apple-gray-4 mx-auto mb-4" />
                        <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                          No custom fields
                        </h3>
                        <p className="text-apple-gray-5">
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