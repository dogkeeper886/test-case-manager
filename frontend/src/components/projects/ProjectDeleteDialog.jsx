import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  X, 
  AlertTriangle, 
  FileText, 
  FolderOpen, 
  Activity, 
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { projectsAPI } from '../../services/api';
import { toast } from '../../utils/toast';

const ProjectDeleteDialog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setInitialLoading(true);
      
      // Fetch project details and statistics
      const [projectResponse, statsResponse] = await Promise.all([
        projectsAPI.getById(id),
        projectsAPI.getStatistics(id)
      ]);

      setProject(projectResponse.data.data);
      setStatistics(statsResponse.data.data);
    } catch (err) {
      console.error('Error fetching project data:', err);
      toast.error('Failed to load project data');
      navigate('/projects');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmationText !== project.name) {
      toast.error('Please type the project name exactly to confirm deletion');
      return;
    }

    setLoading(true);
    
    try {
      const response = await projectsAPI.delete(id);
      const deletionSummary = response.data.data;
      
      toast.success(`Project "${project.name}" deleted successfully`);
      
      // Show deletion summary
      const summaryMessage = `Deleted: ${deletionSummary.deletedItems.testCases} test cases, ${deletionSummary.deletedItems.testSuites} test suites, ${deletionSummary.deletedItems.importLogs} import logs, ${deletionSummary.deletedItems.activities} activities`;
      toast.info(summaryMessage);
      
      navigate('/projects');
    } catch (err) {
      console.error('Error deleting project:', err);
      
      if (err.response?.data?.error) {
        if (err.response.data.error.includes('not found')) {
          toast.error('Project not found');
          navigate('/projects');
        } else {
          toast.error(err.response.data.error);
        }
      } else {
        toast.error('Failed to delete project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${id}`);
  };

  const isConfirmationValid = confirmationText === project?.name;

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue mx-auto mb-4"></div>
            <p className="text-apple-gray-5">Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-apple-gray-7 font-sf font-medium mb-2">Project Not Found</p>
            <p className="text-apple-gray-5 mb-4">The project you're trying to delete doesn't exist.</p>
            <Button variant="primary" onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7">
            Delete Project
          </h1>
        </div>
        <p className="text-apple-gray-5 text-lg">
          This action cannot be undone. Please review the details below.
        </p>
      </div>

      {/* Warning Card */}
      <Card elevation="sm" className="mb-6 border-error/20 bg-error/5">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-sf font-semibold text-error mb-2">
                Warning: This action is irreversible
              </h3>
              <p className="text-apple-gray-7 mb-3">
                Deleting this project will permanently remove all associated data including test cases, test suites, import logs, and activities.
              </p>
              <div className="bg-white rounded-apple-lg p-4 border border-error/20">
                <p className="text-sm font-sf font-medium text-apple-gray-7 mb-2">
                  Project to be deleted: <span className="text-error">{project.name}</span>
                </p>
                {project.description && (
                  <p className="text-sm text-apple-gray-5">{project.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Items to be Deleted */}
      {statistics && (
        <Card elevation="sm" className="mb-6">
          <div className="p-6">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">
              Items that will be deleted:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg">
                <div className="w-8 h-8 bg-apple-blue/10 rounded-full flex items-center justify-center">
                  <FileText className="w-4 h-4 text-apple-blue" />
                </div>
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {statistics.testCases}
                  </p>
                  <p className="text-xs text-apple-gray-5">Test Cases</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg">
                <div className="w-8 h-8 bg-success/10 rounded-full flex items-center justify-center">
                  <FolderOpen className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {statistics.testSuites}
                  </p>
                  <p className="text-xs text-apple-gray-5">Test Suites</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg">
                <div className="w-8 h-8 bg-warning/10 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {statistics.importLogs}
                  </p>
                  <p className="text-xs text-apple-gray-5">Import Logs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-apple-gray-1/30 rounded-apple-lg">
                <div className="w-8 h-8 bg-info/10 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-info" />
                </div>
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {statistics.activities}
                  </p>
                  <p className="text-xs text-apple-gray-5">Activities</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Confirmation */}
      <Card elevation="sm" className="mb-6">
        <div className="p-6">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">
            Confirm Deletion
          </h3>
          <p className="text-apple-gray-5 mb-4">
            To confirm deletion, please type the project name exactly: <strong className="text-apple-gray-7">{project.name}</strong>
          </p>
          <Input
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder={`Type "${project.name}" to confirm`}
            className={confirmationText && !isConfirmationValid ? 'border-error focus:border-error focus:ring-error/50' : ''}
            disabled={loading}
          />
          {confirmationText && !isConfirmationValid && (
            <p className="text-sm text-error mt-1">
              Project name doesn't match. Please type it exactly.
            </p>
          )}
          {isConfirmationValid && (
            <div className="flex items-center gap-2 mt-2 text-success">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-sf font-medium">Project name matches</span>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading || !isConfirmationValid}
          className="flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {loading ? 'Deleting...' : 'Delete Project'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectDeleteDialog; 