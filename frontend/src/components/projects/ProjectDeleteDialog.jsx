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
    <div className="fixed inset-0 z-50 overflow-y-auto" data-element="project-delete-dialog">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
        data-element="project-delete-backdrop"
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4" data-element="project-delete-container">
        <div className="relative w-full max-w-md" data-element="project-delete-content">
          <Card elevation="xl" hover={false} className="overflow-hidden" data-element="project-delete-card">
            {/* Header */}
            <div className="bg-error/5 border-b border-error/20 px-6 py-4" data-element="project-delete-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-error/10 rounded-apple-lg flex items-center justify-center" data-element="project-delete-icon">
                  <AlertTriangle className="w-5 h-5 text-error" />
                </div>
                <div>
                  <h2 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="project-delete-title">
                    Delete Project
                  </h2>
                  <p className="text-sm text-apple-gray-4" data-element="project-delete-subtitle">
                    This action cannot be undone
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6" data-element="project-delete-content-body">
              {/* Project Info */}
              <div className="text-center" data-element="project-delete-info">
                <h3 className="text-xl font-sf font-semibold text-apple-gray-7 mb-2" data-element="project-delete-name">
                  {project.name}
                </h3>
                {project.description && (
                  <p className="text-sm text-apple-gray-5 mb-4" data-element="project-delete-description">
                    {project.description}
                  </p>
                )}
                <Badge variant="error" size="lg" className="flex items-center gap-2 mx-auto w-fit" data-element="project-delete-warning-badge">
                  <Trash2 className="w-4 h-4" />
                  Project will be permanently deleted
                </Badge>
              </div>

              {/* Items to be deleted */}
              <div className="bg-apple-gray-1/30 rounded-apple-lg p-4" data-element="project-delete-items-section">
                <h4 className="text-sm font-sf font-medium text-apple-gray-7 mb-3" data-element="project-delete-items-title">
                  The following items will also be deleted:
                </h4>
                <div className="space-y-2" data-element="project-delete-items-list">
                  <div className="flex items-center justify-between text-sm" data-element="project-delete-test-cases-item">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-apple-blue" />
                      <span className="text-apple-gray-6">Test Cases</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7" data-element="project-delete-test-cases-count">
                      {project.statistics?.testCases || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm" data-element="project-delete-test-suites-item">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-success" />
                      <span className="text-apple-gray-6">Test Suites</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7" data-element="project-delete-test-suites-count">
                      {project.statistics?.testSuites || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm" data-element="project-delete-import-logs-item">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-warning" />
                      <span className="text-apple-gray-6">Import Logs</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7" data-element="project-delete-import-logs-count">
                      {project.statistics?.importLogs || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm" data-element="project-delete-activities-item">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-info" />
                      <span className="text-apple-gray-6">Activities</span>
                    </div>
                    <span className="font-sf font-medium text-apple-gray-7" data-element="project-delete-activities-count">
                      {project.statistics?.activities || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Confirmation */}
              <div data-element="project-delete-confirmation-section">
                <label htmlFor="confirmation" className="block text-sm font-sf font-medium text-apple-gray-7 mb-2" data-element="project-delete-confirmation-label">
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
                  data-element="project-delete-confirmation-input"
                />
                {isConfirmValid && (
                  <p className="text-sm text-error mt-1 flex items-center gap-1" data-element="project-delete-confirmation-warning">
                    <span className="w-1 h-1 bg-error rounded-full"></span>
                    This will permanently delete the project and all related data
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-apple-gray-2 bg-apple-gray-1/30" data-element="project-delete-footer">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
                className="flex items-center gap-2"
                data-element="project-delete-cancel-button"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={!isConfirmValid || loading}
                className="flex items-center gap-2"
                data-element="project-delete-confirm-button"
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