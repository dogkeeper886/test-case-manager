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
  Share2
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';
import { testCasesAPI } from '../services/api';
import { showSuccess, showError, showWarning, dismissToast } from '../utils/toast';

const TestCaseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTestCase();
  }, [id]);

  const fetchTestCase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await testCasesAPI.getById(id);
      setTestCase(response.data);
      
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

  const handleEdit = () => {
    // TODO: Navigate to edit page or open edit modal
    console.log('Edit test case:', testCase);
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-4 h-4" /> },
    { id: 'steps', label: 'Test Steps', icon: <Play className="w-4 h-4" /> },
    { id: 'custom', label: 'Custom Fields', icon: <Settings className="w-4 h-4" /> },
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
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {getStatusIcon(testCase.status)}
            <Badge variant={getStatusBadgeVariant(testCase.status)}>
              {getStatusText(testCase.status)}
            </Badge>
            <Badge variant={getPriorityBadgeVariant(testCase.priority)}>
              {getPriorityText(testCase.priority)}
            </Badge>
          </div>
        </div>
        
        <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7 mb-2">
          {testCase.title}
        </h1>
        
        <p className="text-apple-gray-5 text-lg">
          Test Case #{testCase.id}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-apple-gray-2 p-1 rounded-apple">
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
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card elevation="sm">
                <Card.Header>
                  <h3 className="text-xl font-sf font-semibold text-apple-gray-7">
                    Description
                  </h3>
                </Card.Header>
                <Card.Body>
                  <p className="text-apple-gray-6 leading-relaxed">
                    {testCase.description || 'No description available'}
                  </p>
                </Card.Body>
              </Card>

              {testCase.preconditions && (
                <Card elevation="sm">
                  <Card.Header>
                    <h3 className="text-xl font-sf font-semibold text-apple-gray-7">
                      Preconditions
                    </h3>
                  </Card.Header>
                  <Card.Body>
                    <p className="text-apple-gray-6 leading-relaxed">
                      {testCase.preconditions}
                    </p>
                  </Card.Body>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card elevation="sm">
                <Card.Header>
                  <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
                    Details
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-apple-gray-5">Project</label>
                      <p className="text-apple-gray-7 font-medium">{testCase.project_name || 'Unknown'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-apple-gray-5">Test Suite</label>
                      <p className="text-apple-gray-7 font-medium">{testCase.test_suite_name || 'No Suite'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-apple-gray-5">Execution Type</label>
                      <p className="text-apple-gray-7 font-medium">
                        {testCase.execution_type === 1 ? 'Manual' : 'Automated'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-apple-gray-5">Created</label>
                      <p className="text-apple-gray-7 font-medium">
                        {new Date(testCase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-apple-gray-5">Updated</label>
                      <p className="text-apple-gray-7 font-medium">
                        {new Date(testCase.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {testCase.keywords && (
                <Card elevation="sm">
                  <Card.Header>
                    <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
                      Keywords
                    </h3>
                  </Card.Header>
                  <Card.Body>
                    <div className="flex flex-wrap gap-2">
                      {testCase.keywords.split(',').map((keyword, index) => (
                        <Badge key={index} variant="default" size="sm">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'steps' && (
          <Card elevation="sm">
            <Card.Header>
              <h3 className="text-xl font-sf font-semibold text-apple-gray-7">
                Test Steps
              </h3>
            </Card.Header>
            <Card.Body>
              {testCase.steps && testCase.steps.length > 0 ? (
                <div className="space-y-4">
                  {testCase.steps.map((step, index) => (
                    <div key={index} className="border border-apple-gray-2 rounded-apple p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-medium text-apple-gray-7 mb-2">Action</h4>
                            <p className="text-apple-gray-6">{step.action}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-apple-gray-7 mb-2">Expected Result</h4>
                            <p className="text-apple-gray-6">{step.expected_result}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
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
        )}

        {activeTab === 'custom' && (
          <Card elevation="sm">
            <Card.Header>
              <h3 className="text-xl font-sf font-semibold text-apple-gray-7">
                Custom Fields
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-apple-gray-4 mx-auto mb-4" />
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                  No custom fields
                </h3>
                <p className="text-apple-gray-5">
                  Custom fields allow you to add additional metadata to your test cases.
                </p>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default TestCaseDetail; 