import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
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
    // For now, show a placeholder alert
    alert('Create Project functionality will be implemented here');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-gray-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue mx-auto mb-4"></div>
          <p className="text-apple-gray-5">Loading projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-apple-gray-1 flex items-center justify-center">
        <Card className="max-w-md">
          <Card.Body className="text-center">
            <p className="text-error mb-4">{error}</p>
            <Button onClick={fetchData}>Try Again</Button>
          </Card.Body>
        </Card>
      </div>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        { label: 'Projects', href: '/projects' }
      ]}
      actions={[
        {
          label: 'Create Project',
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => handleCreateProject()
        }
      ]}
    >
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7">
              Projects
            </h1>
            <p className="text-apple-gray-5 mt-1">
              {filteredProjects.length} of {projects.length} projects
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card elevation="sm" padding="lg" className="mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Search projects..."
              icon={<Search className="w-4 h-4" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-0">
            <select
              className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="no-tests">No Tests</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Projects Grid */}
      <div className="mt-6">
        {filteredProjects.length === 0 ? (
          <Card elevation="sm" padding="xl">
            <Card.Body className="text-center py-12">
              <div className="text-apple-gray-4 mb-4">
                <Search className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-2">
                No projects found
              </h3>
              <p className="text-apple-gray-5">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating your first project'}
              </p>
            </Card.Body>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => {
              const stats = getProjectStats(project.name);
              return (
                <Card 
                  key={project.id} 
                  elevation="md" 
                  hover={true}
                  className="cursor-pointer transition-all duration-200 hover:shadow-apple-md"
                  onClick={() => handleViewProject(project)}
                >
                  <Card.Header>
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-sf font-semibold text-apple-gray-7 line-clamp-2">
                        {project.name}
                      </h3>
                      <div className="flex gap-1 ml-2">
                        <Badge 
                          variant={stats.total > 0 ? 'success' : 'default'} 
                          size="sm"
                        >
                          {stats.status}
                        </Badge>
                      </div>
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    <p className="text-apple-gray-5 text-sm mb-3 line-clamp-3">
                      {project.description || 'No description available'}
                    </p>
                    
                    <div className="space-y-2 text-xs text-apple-gray-4">
                      <div className="flex items-center justify-between">
                        <span>Total Tests:</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Pending:</span>
                        <span className="font-medium">{stats.pending}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Passed:</span>
                        <span className="font-medium">{stats.passed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Failed:</span>
                        <span className="font-medium">{stats.failed}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Created:</span>
                        <span className="font-medium">
                          {new Date(project.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Card.Body>
                  
                  <Card.Footer>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-apple-gray-4">
                        ID: #{project.id}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Eye className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProject(project);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Edit className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-3 h-3" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                        />
                      </div>
                    </div>
                  </Card.Footer>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Projects;