import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, FolderOpen, Users, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import { projectsAPI, testCasesAPI } from '../services/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [projectsRes, testCasesRes] = await Promise.all([
        projectsAPI.getAll(),
        testCasesAPI.getAll({ limit: 1000 })
      ]);

      setProjects(projectsRes.data.data || projectsRes.data);
      setTestCases(testCasesRes.data.data || testCasesRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate project statistics
  const getProjectStats = (projectName) => {
    const projectTests = testCases.filter(tc => tc.project_name === projectName);
    const pending = projectTests.filter(tc => tc.status === 1).length;
    const passed = projectTests.filter(tc => tc.status === 2).length;
    const failed = projectTests.filter(tc => tc.status === 3).length;
    
    return {
      total: projectTests.length,
      pending,
      passed,
      failed,
      status: projectTests.length > 0 ? 'Active' : 'No Tests'
    };
  };

  // Filter projects based on search
  const filteredProjects = projects.filter(project => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    if (statusFilter) {
      const stats = getProjectStats(project.name);
      if (statusFilter === 'active' && stats.total === 0) return false;
      if (statusFilter === 'no-tests' && stats.total > 0) return false;
    }

    return true;
  });

  const handleViewProject = (project) => {
    console.log('View project:', project);
    // TODO: Navigate to project detail view
  };

  const handleEditProject = (project) => {
    console.log('Edit project:', project);
    // TODO: Open edit modal or navigate to edit page
  };

  const handleDeleteProject = async (project) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await projectsAPI.delete(project.id);
        setProjects(projects.filter(p => p.id !== project.id));
      } catch (err) {
        console.error('Error deleting project:', err);
        alert('Failed to delete project');
      }
    }
  };

  const handleCreateProject = () => {
    console.log('Create project clicked');
    // TODO: Open create project modal or navigate to create form
  };

  const handleLayoutSearch = (query) => {
    setSearchQuery(query);
  };

  if (loading) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Projects', href: '/projects' }
        ]}
        showSearch={true}
        onSearch={handleLayoutSearch}
      >
        <div className="flex items-center justify-center h-64">
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue mx-auto mb-4"></div>
          <p className="text-apple-gray-5">Loading projects...</p>
        </div>
      </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Projects', href: '/projects' }
        ]}
        showSearch={true}
        onSearch={handleLayoutSearch}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <p className="text-apple-gray-7 font-sf font-medium mb-2">Error Loading Projects</p>
            <p className="text-apple-gray-5 mb-4">{error}</p>
            <Button variant="primary" onClick={fetchData}>
              Try Again
            </Button>
          </div>
      </div>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        { label: 'Projects', href: '/projects' }
      ]}
      showSearch={true}
      onSearch={handleLayoutSearch}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="projects-header">
        <div className="flex items-center justify-between" data-element="projects-header-content">
          <div data-element="projects-title-section">
            <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7" data-element="projects-title">
              Projects
            </h1>
            <p className="text-apple-gray-5 mt-2" data-element="projects-subtitle">
              Manage and organize your test case projects
            </p>
          </div>
          <div className="flex items-center gap-3" data-element="projects-actions">
            <Button
              variant="primary"
              onClick={handleCreateProject}
              data-element="projects-create-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6" data-element="projects-filters">
        <div className="flex flex-col sm:flex-row gap-4" data-element="projects-filters-content">
          <div className="flex-1" data-element="projects-search">
            <div className="relative" data-element="projects-search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-apple-gray-4" />
            <Input
                type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              data-element="projects-search-input"
            />
            </div>
          </div>
          <div className="flex gap-2" data-element="projects-filter-buttons">
            <Button
              variant={statusFilter === '' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('')}
              data-element="projects-filter-all"
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'active' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('active')}
              data-element="projects-filter-active"
            >
              Active
            </Button>
            <Button
              variant={statusFilter === 'no-tests' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('no-tests')}
              data-element="projects-filter-no-tests"
            >
              No Tests
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
        <Card elevation="sm" data-element="projects-empty-state">
          <div className="text-center py-12" data-element="projects-empty-content">
            <FolderOpen className="w-16 h-16 text-apple-gray-4 mx-auto mb-4" />
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2" data-element="projects-empty-title">
                No projects found
              </h3>
            <p className="text-apple-gray-5 mb-6" data-element="projects-empty-description">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search or filters'
                : 'Get started by creating your first project'
              }
              </p>
            {!searchQuery && !statusFilter && (
              <Button
                variant="primary"
                onClick={handleCreateProject}
                data-element="projects-empty-create"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            )}
          </div>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-element="projects-grid">
          {filteredProjects.map((project) => {
              const stats = getProjectStats(project.name);
              return (
                <Card 
                  key={project.id} 
                elevation="sm"
                hover="lift"
                className="cursor-pointer"
                  data-element={`project-card-${project.id}`}
                >
                <div className="p-6" data-element={`project-card-content-${project.id}`}>
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4" data-element={`project-header-${project.id}`}>
                    <div className="flex-1 min-w-0" data-element={`project-title-section-${project.id}`}>
                      <h3 className="text-lg font-sf font-semibold text-apple-gray-7 truncate" data-element={`project-title-${project.id}`}>
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-apple-gray-5 mt-1 line-clamp-2" data-element={`project-description-${project.id}`}>
                          {project.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-4" data-element={`project-actions-${project.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProject(project);
                          }}
                        className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                        data-element={`project-view-${project.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                        className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                        data-element={`project-edit-${project.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                        className="h-8 w-8 p-0 text-apple-gray-5 hover:text-error hover:bg-error/10 transition-all duration-200"
                        data-element={`project-delete-${project.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="space-y-3" data-element={`project-stats-${project.id}`}>
                    {/* Status Badge */}
                    <div data-element={`project-status-${project.id}`}>
                      <Badge
                        variant={stats.total > 0 ? 'success' : 'default'}
                        size="sm"
                      >
                        {stats.status}
                      </Badge>
                    </div>

                    {/* Test Case Counts */}
                    <div className="grid grid-cols-3 gap-3" data-element={`project-test-counts-${project.id}`}>
                      <div className="text-center" data-element={`project-total-${project.id}`}>
                        <p className="text-lg font-sf font-bold text-apple-gray-7" data-element={`project-total-count-${project.id}`}>
                          {stats.total}
                        </p>
                        <p className="text-xs text-apple-gray-5" data-element={`project-total-label-${project.id}`}>
                          Total
                        </p>
                      </div>
                      <div className="text-center" data-element={`project-passed-${project.id}`}>
                        <p className="text-lg font-sf font-bold text-success" data-element={`project-passed-count-${project.id}`}>
                          {stats.passed}
                        </p>
                        <p className="text-xs text-apple-gray-5" data-element={`project-passed-label-${project.id}`}>
                          Passed
                        </p>
                      </div>
                      <div className="text-center" data-element={`project-failed-${project.id}`}>
                        <p className="text-lg font-sf font-bold text-error" data-element={`project-failed-count-${project.id}`}>
                          {stats.failed}
                        </p>
                        <p className="text-xs text-apple-gray-5" data-element={`project-failed-label-${project.id}`}>
                          Failed
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {stats.total > 0 && (
                      <div className="space-y-2" data-element={`project-progress-${project.id}`}>
                        <div className="flex items-center justify-between text-xs" data-element={`project-progress-labels-${project.id}`}>
                          <span className="text-apple-gray-5">Success Rate</span>
                          <span className="font-sf font-medium text-apple-gray-7">
                            {Math.round((stats.passed / stats.total) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-apple-gray-2 rounded-full h-2" data-element={`project-progress-bar-${project.id}`}>
                          <div
                            className="bg-success h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(stats.passed / stats.total) * 100}%` }}
                            data-element={`project-progress-fill-${project.id}`}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Project Metadata */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-apple-gray-2" data-element={`project-metadata-${project.id}`}>
                    <div className="flex items-center gap-2 text-xs text-apple-gray-4" data-element={`project-created-${project.id}`}>
                      <Calendar className="w-3 h-3" />
                      <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-apple-gray-4" data-element={`project-updated-${project.id}`}>
                      <span>Updated {new Date(project.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                </Card>
              );
            })}
          </div>
        )}

      {/* Summary Stats */}
      {filteredProjects.length > 0 && (
        <div className="mt-8" data-element="projects-summary">
          <Card elevation="sm" data-element="projects-summary-card">
            <div className="flex items-center justify-between" data-element="projects-summary-content">
              <div className="flex items-center gap-6" data-element="projects-summary-stats">
                <div className="text-center" data-element="projects-summary-total">
                  <p className="text-2xl font-sf font-bold text-apple-gray-7" data-element="projects-summary-total-count">
                    {filteredProjects.length}
                  </p>
                  <p className="text-sm text-apple-gray-5" data-element="projects-summary-total-label">
                    Projects
                  </p>
                </div>
                <div className="text-center" data-element="projects-summary-active">
                  <p className="text-2xl font-sf font-bold text-success" data-element="projects-summary-active-count">
                    {filteredProjects.filter(p => getProjectStats(p.name).total > 0).length}
                  </p>
                  <p className="text-sm text-apple-gray-5" data-element="projects-summary-active-label">
                    Active
                  </p>
                </div>
                <div className="text-center" data-element="projects-summary-total-tests">
                  <p className="text-2xl font-sf font-bold text-apple-blue" data-element="projects-summary-total-tests-count">
                    {filteredProjects.reduce((sum, p) => sum + getProjectStats(p.name).total, 0)}
                  </p>
                  <p className="text-sm text-apple-gray-5" data-element="projects-summary-total-tests-label">
                    Total Tests
                  </p>
                </div>
              </div>
            </div>
          </Card>
      </div>
      )}
    </Layout>
  );
};

export default Projects;