import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Hash } from 'lucide-react';
import { Button, Card, Badge, Input, Textarea, Select } from '../ui';
import { projectsAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const ProjectEditSlideOver = ({ project, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active'
      });
      setErrors({});
    }
  }, [project, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Project name must be at least 2 characters';
    } else if (formData.name.trim().length > 255) {
      newErrors.name = 'Project name must be less than 255 characters';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await projectsAPI.update(project.id, formData);
      showSuccess('Project updated successfully');
      onSave(response.data.data);
      onClose();
    } catch (err) {
      console.error('Error updating project:', err);
      const errorMessage = err.response?.data?.error || 'Failed to update project';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
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
        return '🟢';
      case 'inactive':
        return '⚪';
      case 'archived':
        return '🟡';
      default:
        return '⚪';
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full">
        <div className="relative w-screen max-w-md">
          {/* Panel */}
          <div className="flex h-full flex-col bg-white shadow-apple-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-apple-gray-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-apple-blue/10 rounded-apple-lg flex items-center justify-center">
                  <Save className="w-4 h-4 text-apple-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-sf font-semibold text-apple-gray-7">
                    Edit Project
                  </h2>
                  <p className="text-sm text-apple-gray-4">
                    Update project details
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 text-apple-gray-4 hover:text-apple-gray-7 hover:bg-apple-gray-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Project Info Card */}
                <Card elevation="sm">
                  <div className="p-4">
                    <h3 className="text-sm font-sf font-medium text-apple-gray-7 mb-3">
                      Project Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4 text-apple-gray-4" />
                        <span className="text-apple-gray-4">ID:</span>
                        <span className="font-sf font-medium text-apple-gray-7">{project.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-apple-gray-4" />
                        <span className="text-apple-gray-4">Created:</span>
                        <span className="font-sf font-medium text-apple-gray-7">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-apple-gray-4" />
                        <span className="text-apple-gray-4">Updated:</span>
                        <span className="font-sf font-medium text-apple-gray-7">
                          {new Date(project.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Project Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-sf font-medium text-apple-gray-7 mb-2">
                    Project Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name"
                    className={errors.name ? 'border-error focus:border-error focus:ring-error/50' : ''}
                    disabled={loading}
                  />
                  {errors.name && (
                    <p className="text-sm text-error mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-error rounded-full"></span>
                      {errors.name}
                    </p>
                  )}
                  <p className="text-xs text-apple-gray-4 mt-1">
                    Choose a descriptive name for your project (2-255 characters)
                  </p>
                </div>

                {/* Project Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-sf font-medium text-apple-gray-7 mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter project description (optional)"
                    rows={4}
                    className={errors.description ? 'border-error focus:border-error focus:ring-error/50' : ''}
                    disabled={loading}
                  />
                  {errors.description && (
                    <p className="text-sm text-error mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-error rounded-full"></span>
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-apple-gray-4 mt-1">
                    Provide additional details about your project (max 1000 characters)
                  </p>
                </div>

                {/* Project Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-sf font-medium text-apple-gray-7 mb-2">
                    Status
                  </label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    disabled={loading}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </Select>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-apple-gray-4">Current:</span>
                    <Badge variant={getStatusColor(project.status)} size="sm">
                      {getStatusIcon(project.status)} {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-apple-gray-2 bg-apple-gray-1/30">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex items-center gap-2"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditSlideOver; 