import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Button, Card, Input, Textarea, Select } from '../ui';
import { projectsAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const ProjectEditForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [project, setProject] = useState(null);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setInitialLoading(true);
      const response = await projectsAPI.getById(id);
      const projectData = response.data.data;
      
      setProject(projectData);
      setFormData({
        name: projectData.name || '',
        description: projectData.description || '',
        status: projectData.status || 'active'
      });
    } catch (err) {
      console.error('Error fetching project:', err);
      showError('Failed to load project details');
      navigate('/projects');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
      const response = await projectsAPI.update(id, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status
      });

      showSuccess('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (err) {
      console.error('Error updating project:', err);
      
      if (err.response?.data?.error) {
        if (err.response.data.error.includes('already exists')) {
          setErrors({ name: 'A project with this name already exists' });
        } else if (err.response.data.error.includes('not found')) {
          showError('Project not found');
          navigate('/projects');
        } else {
          showError(err.response.data.error);
        }
      } else {
        showError('Failed to update project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${id}`);
  };

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue mx-auto mb-4"></div>
            <p className="text-apple-gray-5">Loading project details...</p>
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
            <p className="text-apple-gray-5 mb-4">The project you're trying to edit doesn't exist.</p>
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
            Edit Project
          </h1>
        </div>
        <p className="text-apple-gray-5 text-lg">
          Update project details and settings.
        </p>
      </div>

      {/* Form */}
      <Card elevation="sm">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
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
                <p className="text-sm text-error mt-1">{errors.name}</p>
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
                <p className="text-sm text-error mt-1">{errors.description}</p>
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
              <p className="text-xs text-apple-gray-4 mt-1">
                Set the status for your project
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-apple-gray-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancel}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Project Info */}
      <div className="mt-6">
        <Card elevation="sm">
          <div className="p-4">
            <h3 className="text-sm font-sf font-medium text-apple-gray-7 mb-2">
              Project Information
            </h3>
            <div className="text-sm text-apple-gray-5 space-y-1">
              <p>• Project ID: {project.id}</p>
              <p>• Created: {new Date(project.created_at).toLocaleDateString()}</p>
              <p>• Last Updated: {new Date(project.updated_at).toLocaleDateString()}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ProjectEditForm; 