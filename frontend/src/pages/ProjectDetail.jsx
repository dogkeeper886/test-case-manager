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
  Users,
  BarChart3
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';
import { projectsAPI } from '../services/api';
import { showSuccess, showError } from '../utils/toast';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.getDetails(id);
      setProject(response.data.data);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError(err.response?.data?.error || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  const handleDelete = () => {
    navigate(`/projects/${id}/delete`);
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
        <Card elevation="sm">
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
        <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-4">Project Statistics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card elevation="sm" hover="lift" className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-apple-blue/10 rounded-apple-lg mx-auto mb-3 group-hover:bg-apple-blue/20 transition-colors">
                <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-apple-blue" />
              </div>
              <p className="text-xl lg:text-2xl font-sf font-bold text-apple-gray-7 mb-1">
                {project.statistics.testCases.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-apple-gray-5">Test Cases</p>
            </div>
          </Card>

          <Card elevation="sm" hover="lift" className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-success/10 rounded-apple-lg mx-auto mb-3 group-hover:bg-success/20 transition-colors">
                <FolderOpen className="w-5 h-5 lg:w-6 lg:h-6 text-success" />
              </div>
              <p className="text-xl lg:text-2xl font-sf font-bold text-apple-gray-7 mb-1">
                {project.statistics.testSuites.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-apple-gray-5">Test Suites</p>
            </div>
          </Card>

          <Card elevation="sm" hover="lift" className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-warning/10 rounded-apple-lg mx-auto mb-3 group-hover:bg-warning/20 transition-colors">
                <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-warning" />
              </div>
              <p className="text-xl lg:text-2xl font-sf font-bold text-apple-gray-7 mb-1">
                {project.statistics.importLogs.toLocaleString()}
              </p>
              <p className="text-xs lg:text-sm text-apple-gray-5">Import Logs</p>
            </div>
          </Card>

          <Card elevation="sm" hover="lift" className="group">
            <div className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-info/10 rounded-apple-lg mx-auto mb-3 group-hover:bg-info/20 transition-colors">
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
          <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-4">Recent Activities</h2>
          <Card elevation="sm">
            <div className="p-4 lg:p-6">
              <div className="space-y-3">
                {project.recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg hover:bg-apple-gray-1/50 transition-colors">
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
          <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-4">Recent Import Logs</h2>
          <Card elevation="sm">
            <div className="p-4 lg:p-6">
              <div className="space-y-3">
                {project.recentImportLogs.slice(0, 5).map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg hover:bg-apple-gray-1/50 transition-colors">
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
        <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center gap-2 group hover:bg-apple-blue/5 hover:border-apple-blue/20 transition-all"
            onClick={() => navigate(`/testcases?project=${id}`)}
          >
            <FileText className="w-6 h-6 text-apple-blue group-hover:scale-110 transition-transform" />
            <span className="font-sf font-medium">View Test Cases</span>
          </Button>
          <Button
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center gap-2 group hover:bg-success/5 hover:border-success/20 transition-all"
            onClick={() => navigate(`/test-suites?project=${id}`)}
          >
            <FolderOpen className="w-6 h-6 text-success group-hover:scale-110 transition-transform" />
            <span className="font-sf font-medium">View Test Suites</span>
          </Button>
          <Button
            variant="secondary"
            className="h-16 flex flex-col items-center justify-center gap-2 group hover:bg-warning/5 hover:border-warning/20 transition-all sm:col-span-2 lg:col-span-1"
            onClick={() => navigate(`/import?project=${id}`)}
          >
            <Activity className="w-6 h-6 text-warning group-hover:scale-110 transition-transform" />
            <span className="font-sf font-medium">Import Data</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail; 