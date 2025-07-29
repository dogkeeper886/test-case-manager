import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  FolderOpen, 
  FileText, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';
import { TestCasePreviewDialog } from '../components/test-cases';
import { ProjectEditSlideOver, ProjectDeleteDialog } from '../components/projects';
import { projectsAPI, testCasesAPI, testSuitesAPI } from '../services/api';
import { showError } from '../utils/toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentTestCases, setRecentTestCases] = useState([]);
  const [recentTestSuites, setRecentTestSuites] = useState([]);
  const [testCaseStats, setTestCaseStats] = useState({});
  const [loadingTestData, setLoadingTestData] = useState(false);
  const [previewTestCase, setPreviewTestCase] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.getDetails(id);
      setProject(response.data.data);
      
      // Fetch test case management data
      await fetchTestCaseManagementData();
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.response?.data?.error || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestCaseManagementData = async () => {
    try {
      setLoadingTestData(true);
      
      // Fetch recent test cases (limit to 5)
      const testCasesResponse = await testCasesAPI.getAll({ 
        projectId: id, 
        limit: 5
      });
      setRecentTestCases(testCasesResponse.data.data || []);
      
      // Fetch recent test suites (limit to 5)
      const testSuitesResponse = await testSuitesAPI.getByProject(id);
      setRecentTestSuites((testSuitesResponse.data.data || []).slice(0, 5));
      
      // Calculate test case statistics
      const allTestCasesResponse = await testCasesAPI.getAll({ projectId: id });
      const allTestCases = allTestCasesResponse.data.data || [];
      
      const stats = {
        total: allTestCases.length,
        byStatus: {},
        byPriority: {},
        byImportance: {}
      };
      
      allTestCases.forEach(testCase => {
        // Status stats
        const status = testCase.status || 1;
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
        
        // Priority stats
        const priority = testCase.priority || 1;
        stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
        
        // Importance stats
        const importance = testCase.importance || 1;
        stats.byImportance[importance] = (stats.byImportance[importance] || 0) + 1;
      });
      
      setTestCaseStats(stats);
    } catch (err) {
      console.error('Error fetching test case management data:', err);
      showError('Failed to load test case management data');
    } finally {
      setLoadingTestData(false);
    }
  };

  const handleEdit = () => {
    setIsEditOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
  };

  const handleEditSave = (updatedProject) => {
    setProject(updatedProject);
  };

  const handleDeleteConfirm = (deletedProjectId, deletedItems) => {
    navigate('/projects');
  };

  const handleBack = () => {
    navigate('/projects');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'archived':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      case 'archived':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Test Case Management Helper Functions
  const getTestCaseStatusText = (status) => {
    switch (status) {
      case 1: return 'Draft';
      case 2: return 'Ready';
      case 3: return 'In Progress';
      case 4: return 'Blocked';
      case 5: return 'Completed';
      default: return 'Unknown';
    }
  };

  const getTestCaseStatusColor = (status) => {
    switch (status) {
      case 1: return 'default';
      case 2: return 'success';
      case 3: return 'warning';
      case 4: return 'error';
      case 5: return 'success';
      default: return 'default';
    }
  };

  const getTestCasePriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Critical';
      default: return 'Low';
    }
  };

  const getTestCasePriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'default';
      case 2: return 'info';
      case 3: return 'warning';
      case 4: return 'error';
      default: return 'default';
    }
  };

  const handleViewTestCase = (testCaseId) => {
    navigate(`/testcases/${testCaseId}`);
  };

  const handlePreviewTestCase = async (testCaseId) => {
    try {
      const response = await testCasesAPI.getById(testCaseId);
      setPreviewTestCase(response.data.data);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error('Error fetching test case for preview:', err);
      showError('Failed to load test case preview');
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewTestCase(null);
  };

  const handleViewFullTestCase = () => {
    if (previewTestCase) {
      navigate(`/testcases/${previewTestCase.id}`);
    }
  };

  const handleViewTestSuite = (suiteId) => {
    navigate(`/test-suites/${suiteId}`);
  };

  const handleCreateTestCase = () => {
    navigate(`/testcases/create?project=${id}`);
  };

  // const handleCreateTestSuite = () => {
  //   navigate(`/test-suites/create?project=${id}`);
  // };

  if (loading) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Loading...', href: `/projects/${id}` }
        ]}
        showSearch={false}
        actions={[]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue mx-auto mb-4"></div>
            <p className="text-apple-gray-5">Loading project details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Error', href: `/projects/${id}` }
        ]}
        showSearch={false}
        actions={[]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <p className="text-apple-gray-7 font-sf font-medium mb-2">Error Loading Project</p>
            <p className="text-apple-gray-5 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchProjectDetails}>
              Try Again
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'Not Found', href: `/projects/${id}` }
        ]}
        showSearch={false}
        actions={[]}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FolderOpen className="w-12 h-12 text-apple-gray-4 mx-auto mb-4" />
            <p className="text-apple-gray-7 font-sf font-medium mb-2">Project Not Found</p>
            <p className="text-apple-gray-5 mb-4">The project you're looking for doesn't exist.</p>
            <Button variant="primary" onClick={handleBack}>
              Back to Projects
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        { label: 'Projects', href: '/projects' },
        { label: project.name, href: `/projects/${id}` }
      ]}
      showSearch={false}
      actions={[
        {
          label: 'Edit Project',
          variant: 'secondary',
          icon: <Edit className="w-4 h-4" />,
          onClick: handleEdit
        },
        {
          label: 'Delete Project',
          variant: 'destructive',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: handleDelete
        }
      ]}
    >
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7">
                {project.name}
              </h1>
            </div>
            {project.description && (
              <p className="text-apple-gray-5 text-lg">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Project Status and Metadata */}
      <div className="mb-8">
        <Card elevation="sm" hover={false}>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Badge
                  variant={getStatusColor(project.status)}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  {getStatusIcon(project.status)}
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </Badge>
                <div className="hidden sm:flex items-center gap-6 text-sm text-apple-gray-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(project.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Updated {formatDate(project.updated_at)}</span>
                  </div>
                </div>
              </div>
              
              {/* Mobile-friendly metadata */}
              <div className="sm:hidden space-y-2">
                <div className="flex items-center gap-2 text-sm text-apple-gray-4">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(project.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-apple-gray-4">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(project.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Statistics Grid */}
      <div className="mb-8">
        <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-6">Project Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Card elevation="sm" hover={false} className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-apple-blue/10 rounded-apple-lg mx-auto mb-3">
                <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-apple-blue" />
              </div>
              <p className="text-xl lg:text-2xl font-sf font-bold text-apple-gray-7 mb-1">
                {project.statistics.testCases.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-apple-gray-5">Test Cases</p>
            </div>
          </Card>

          <Card elevation="sm" hover={false} className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-success/10 rounded-apple-lg mx-auto mb-3">
                <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-success" />
              </div>
              <p className="text-xl lg:text-2xl font-sf font-bold text-apple-gray-7 mb-1">
                {project.statistics.testSuites.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-apple-gray-5">Test Suites</p>
            </div>
          </Card>

          <Card elevation="sm" hover={false} className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-warning/10 rounded-apple-lg mx-auto mb-3">
                <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-warning" />
              </div>
              <p className="text-xl lg:text-2xl font-sf font-bold text-apple-gray-7 mb-1">
                {project.statistics.importLogs.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-apple-gray-5">Import Logs</p>
            </div>
          </Card>

          <Card elevation="sm" hover={false} className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-info/10 rounded-apple-lg mx-auto mb-3">
                <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-info" />
              </div>
              <p className="text-xl lg:text-2xl font-sf font-bold text-apple-gray-7 mb-1">
                {project.statistics.activities.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-apple-gray-5">Activities</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activities */}
      {project.recentActivities && project.recentActivities.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-6">Recent Activities</h2>
          <Card elevation="sm" hover={false}>
            <div className="p-4 lg:p-6">
                                <div className="space-y-3">
                    {project.recentActivities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-apple-blue/10 rounded-full flex items-center justify-center">
                        <Activity className="w-4 h-4 text-apple-blue" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sf font-medium text-apple-gray-7 mb-1 line-clamp-2">
                        {activity.description}
                      </p>
                      <p className="text-xs text-apple-gray-4">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {project.recentActivities.length > 5 && (
                <div className="mt-4 pt-4 border-t border-apple-gray-2">
                  <p className="text-xs text-apple-gray-4 text-center">
                    Showing 5 of {project.recentActivities.length} activities
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Recent Import Logs */}
      {project.recentImportLogs && project.recentImportLogs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-6">Recent Import Logs</h2>
          <Card elevation="sm" hover={false}>
            <div className="p-4 lg:p-6">
                                <div className="space-y-3">
                    {project.recentImportLogs.slice(0, 5).map((log, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                        <FileText className="w-4 h-4 text-warning" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sf font-medium text-apple-gray-7 mb-1 line-clamp-1">
                        {log.file_name}
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={log.status === 'completed' ? 'success' : log.status === 'failed' ? 'error' : 'warning'} size="sm">
                          {log.status}
                        </Badge>
                        <span className="text-xs text-apple-gray-4">
                          {log.imported_test_cases} test cases imported
                        </span>
                      </div>
                      <p className="text-xs text-apple-gray-4">
                        {formatDate(log.started_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {project.recentImportLogs.length > 5 && (
                <div className="mt-4 pt-4 border-t border-apple-gray-2">
                  <p className="text-xs text-apple-gray-4 text-center">
                    Showing 5 of {project.recentImportLogs.length} import logs
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center gap-2 group transition-all"
            onClick={() => navigate(`/testcases?project=${id}`)}
          >
            <FileText className="w-6 h-6 text-apple-blue group-hover:scale-110 transition-transform" />
            <span className="font-sf font-medium">View Test Cases</span>
          </Button>
          <Button
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center gap-2 group transition-all"
            onClick={() => navigate(`/test-suites?project=${id}`)}
          >
            <FolderOpen className="w-6 h-6 text-success group-hover:scale-110 transition-transform" />
            <span className="font-sf font-medium">View Test Suites</span>
          </Button>
          <Button
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center gap-2 group transition-all"
            onClick={handleCreateTestCase}
          >
            <FileText className="w-6 h-6 text-info group-hover:scale-110 transition-transform" />
            <span className="font-sf font-medium">Create Test Case</span>
          </Button>
          <Button
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center gap-2 group transition-all"
            onClick={() => navigate(`/import?project=${id}`)}
          >
            <Activity className="w-6 h-6 text-warning group-hover:scale-110 transition-transform" />
            <span className="font-sf font-medium">Import Data</span>
          </Button>
        </div>
      </div>

      {/* Test Case Management Section */}
      {!loadingTestData && (
        <>
          {/* Test Case Statistics */}
          {testCaseStats.total > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-6">Test Case Overview</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <Card elevation="sm" hover={false}>
                  <div className="p-4">
                    <h3 className="text-sm font-sf font-medium text-apple-gray-7 mb-3">Status Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(testCaseStats.byStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getTestCaseStatusColor(parseInt(status))} size="sm">
                              {getTestCaseStatusText(parseInt(status))}
                            </Badge>
                          </div>
                          <span className="text-sm font-sf font-medium text-apple-gray-7">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Priority Distribution */}
                <Card elevation="sm" hover={false}>
                  <div className="p-4">
                    <h3 className="text-sm font-sf font-medium text-apple-gray-7 mb-3">Priority Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(testCaseStats.byPriority).map(([priority, count]) => (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant={getTestCasePriorityColor(parseInt(priority))} size="sm">
                              {getTestCasePriorityText(parseInt(priority))}
                            </Badge>
                          </div>
                          <span className="text-sm font-sf font-medium text-apple-gray-7">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card elevation="sm" hover={false}>
                  <div className="p-4">
                    <h3 className="text-sm font-sf font-medium text-apple-gray-7 mb-3">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-apple-gray-5">Total Test Cases</span>
                        <span className="text-lg font-sf font-bold text-apple-gray-7">
                          {testCaseStats.total}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-apple-gray-5">Test Suites</span>
                        <span className="text-lg font-sf font-bold text-apple-gray-7">
                          {recentTestSuites.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-apple-gray-5">Ready to Test</span>
                        <span className="text-lg font-sf font-bold text-success">
                          {testCaseStats.byStatus[2] || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Recent Test Cases */}
          {recentTestCases.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-sf font-semibold text-apple-gray-7">Recent Test Cases</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/testcases?project=${id}`)}
                  className="text-apple-blue hover:text-apple-blue/80"
                >
                  View All
                </Button>
              </div>
              <Card elevation="sm" hover={false}>
                <div className="p-4">
                  <div className="space-y-3">
                    {recentTestCases.map((testCase) => (
                      <div
                        key={testCase.id}
                        className="flex items-center justify-between p-3 bg-apple-gray-1/30 rounded-apple-lg group"
                      >
                        <div 
                          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleViewTestCase(testCase.id)}
                        >
                          <div className="flex-shrink-0">
                            <FileText className="w-5 h-5 text-apple-blue" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-sf font-medium text-apple-gray-7 mb-1 line-clamp-1 group-hover:text-apple-blue transition-colors">
                              {testCase.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant={getTestCaseStatusColor(testCase.status)} size="sm">
                                {getTestCaseStatusText(testCase.status)}
                              </Badge>
                              <Badge variant={getTestCasePriorityColor(testCase.priority)} size="sm">
                                {getTestCasePriorityText(testCase.priority)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewTestCase(testCase.id);
                            }}
                            className="h-8 w-8 p-0 text-apple-gray-4 hover:text-apple-blue"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewTestCase(testCase.id);
                            }}
                            className="h-8 w-8 p-0 text-apple-gray-4 hover:text-apple-blue"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Recent Test Suites */}
          {recentTestSuites.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-sf font-semibold text-apple-gray-7">Recent Test Suites</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/test-suites?project=${id}`)}
                  className="text-apple-blue hover:text-apple-blue/80"
                >
                  View All
                </Button>
              </div>
              <Card elevation="sm" hover={false}>
                <div className="p-4">
                  <div className="space-y-3">
                    {recentTestSuites.map((suite) => (
                      <div
                        key={suite.id}
                        className="flex items-center justify-between p-3 bg-apple-gray-1/30 rounded-apple-lg cursor-pointer group"
                        onClick={() => handleViewTestSuite(suite.id)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            <FolderOpen className="w-5 h-5 text-success" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-sf font-medium text-apple-gray-7 mb-1 line-clamp-1 group-hover:text-success transition-colors">
                              {suite.name}
                            </p>
                            <p className="text-xs text-apple-gray-4">
                              {suite.test_cases_count || 0} test cases
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <ChevronRight className="w-4 h-4 text-apple-gray-4 group-hover:text-success transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* Test Case Preview Dialog */}
      <TestCasePreviewDialog
        testCase={previewTestCase}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onViewFull={handleViewFullTestCase}
      />

      {/* Project Edit Slide-over */}
      <ProjectEditSlideOver
        project={project}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditSave}
      />

      {/* Project Delete Dialog */}
      <ProjectDeleteDialog
        project={project}
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDelete={handleDeleteConfirm}
      />
    </Layout>
  );
};

export default ProjectDetail; 