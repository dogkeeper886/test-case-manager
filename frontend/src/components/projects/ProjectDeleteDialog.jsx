import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, FileText, FolderOpen, Activity, BarChart3 } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { projectsAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const ProjectDeleteDialog = ({ project, isOpen, onClose, onDelete }) => {
  const [confirmationText, setConfirmationText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmationText !== project.name) {
      return;
    }

    setLoading(true);
    try {
      const response = await projectsAPI.delete(project.id);
      const deletedItems = response.data.data.deletedItems;
      
      showSuccess(`Project "${project.name}" deleted successfully`);
      onDelete(project.id, deletedItems);
      onClose();
    } catch (err) {
      console.error('Error deleting project:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete project';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    onClose();
  };

  if (!isOpen || !project) return null;

  const isConfirmValid = confirmationText === project.name;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <Card elevation="xl" className="overflow-hidden">
            {/* Header */}
            <div className="bg-error/5 border-b border-error/20 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-error/10 rounded-apple-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <div>
                  <h2 className="text-lg font-sf font-semibold text-apple-gray-7">
                    Delete Project
                  </h2>
                  <p className="text-sm text-apple-gray-4">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Project Info */}
              <div className="text-center">
                <h3 className="text-xl font-sf font-semibold text-apple-gray-7 mb-2">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-apple-gray-5 mb-4">
                    {project.description}
                  </p>
                )}
                <Badge variant="error" size="lg" className="flex items-center gap-2 mx-auto w-fit">
                  <Trash2 className="w-4 h-4" />
                  Project will be permanently deleted
                </Badge>
              </div>

              {/* Items to be deleted */}
              <div className="bg-apple-gray-1/30 rounded-apple-lg p-4">
                <h4 className="text-sm font-sf font-medium text-apple-gray-7 mb-3">
                  The following items will also be deleted:
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-apple-blue" />
                      <span className="text-apple-gray-6">Test Cases</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7">
                      {project.statistics?.testCases || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-success" />
                      <span className="text-apple-gray-6">Test Suites</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7">
                      {project.statistics?.testSuites || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-warning" />
                      <span className="text-apple-gray-6">Import Logs</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7">
                      {project.statistics?.importLogs || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-info" />
                      <span className="text-apple-gray-6">Activities</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7">
                      {project.statistics?.activities || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div>
                <label htmlFor="confirmation" className="block text-sm font-sf font-medium text-apple-gray-7 mb-2">
                  Type the project name to confirm deletion
                </label>
                <input
                  id="confirmation"
                  type="text"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder={`Type "${project.name}" to confirm`}
                  className={`
                    w-full px-3 py-2
                    border rounded-apple-md
                    font-sf text-sm
                    placeholder:text-apple-gray-4
                    focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue
                    transition-all duration-200
                    ${isConfirmValid 
                      ? 'border-error bg-error/5 focus:border-error focus:ring-error/50' 
                      : 'border-apple-gray-3 bg-white'
                    }
                  `}
                  disabled={loading}
                />
                {isConfirmValid && (
                  <p className="text-sm text-error mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-error rounded-full"></span>
                    This will permanently delete the project and all related data
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-apple-gray-2 bg-apple-gray-1/30">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={!isConfirmValid || loading}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {loading ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDeleteDialog; 