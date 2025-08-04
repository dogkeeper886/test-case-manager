import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus, AlertCircle, CheckCircle, Clock, Brain } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import SmartImportTab from '../components/import/SmartImportTab';
import { importAPI, projectsAPI } from '../services/api';
import { showSuccess, showError, showWarning, showInfo } from '../utils/toast';

const Import = () => {
  const [activeTab, setActiveTab] = useState('testlink');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importHistory, setImportHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const fileInputRef = useRef(null);

  // Fetch projects and import history on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        setLoadingProjects(true);
        const projectsResponse = await projectsAPI.getAll();
        const projectsData = projectsResponse.data.data || [];
        setProjects(projectsData);
        
        // Set first project as default if available
        if (projectsData.length > 0 && !selectedProjectId) {
          setSelectedProjectId(projectsData[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        showError('Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchData();
  }, []);

  // Function to fetch import history
  const fetchImportHistory = async () => {
    // Show all projects if:
    // 1. showAllProjects is true, OR
    // 2. No project is selected AND not creating new project, OR
    // 3. Creating new project (showAllProjects should be true)
    const shouldShowAllProjects = showAllProjects || 
                                 (!selectedProjectId && !showNewProjectForm) ||
                                 showNewProjectForm;
    
    if (!selectedProjectId && !shouldShowAllProjects) return;
    
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      
      let response;
      if (shouldShowAllProjects) {
        response = await importAPI.getAllLogs();
      } else {
        response = await importAPI.getLogs(selectedProjectId);
      }
      
      const logs = response.data.data || [];
      
      // Transform API data to match UI format
      const transformedHistory = logs.map(log => ({
        id: log.id,
        filename: log.file_name || 'Unknown file',
        size: log.file_size ? `${(log.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
        uploaded: new Date(log.started_at).toLocaleDateString(),
        status: log.status === 'completed' ? 'Completed' : 
                log.status === 'failed' ? 'Failed' : 
                log.status === 'processing' ? 'Processing' : 'Unknown',
        testCases: log.imported_test_cases || 0,
        testSuites: log.imported_test_suites || 0,
        projects: 1,
        duration: log.duration || '--',
        error: log.errors?.[0] || null,
        strategy: log.strategy || 'unknown',
        projectId: log.project_id,
        projectName: log.project_name || `Project ${log.project_id}`
      }));
      
      setImportHistory(transformedHistory);
    } catch (error) {
      console.error('Failed to fetch import history:', error);
      setHistoryError('Failed to load import history');
      setImportHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Fetch import history when selected project changes or view mode changes
  useEffect(() => {
    fetchImportHistory();
  }, [selectedProjectId, showAllProjects, showNewProjectForm]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Processing':
        return 'warning';
      case 'Failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-apple-green" />;
      case 'Processing':
        return <Clock className="w-4 h-4 text-apple-orange" />;
      case 'Failed':
        return <AlertCircle className="w-4 h-4 text-apple-red" />;
      default:
        return <Clock className="w-4 h-4 text-apple-gray-4" />;
    }
  };

  const handleLayoutSearch = (query) => {
    // TODO: Implement import history search
    console.log('Search query:', query);
  };

  const handleImportFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.name.endsWith('.xml')) {
      showError('Please select a valid XML file');
      return;
    }

    // Validate project selection
    if (!showNewProjectForm && !selectedProjectId) {
      showError('Please select an existing project or choose to create a new one');
      return;
    }

    if (showNewProjectForm && !newProjectName.trim()) {
      showError('Please enter a project name for the new project');
      return;
    }

    if (showNewProjectForm && newProjectName.trim().length < 2) {
      showError('Project name must be at least 2 characters long');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('xmlFile', file);
      
      // Add project information
      if (showNewProjectForm) {
        formData.append('newProjectName', newProjectName.trim());
        formData.append('newProjectDescription', newProjectDescription.trim());
      } else {
        formData.append('projectId', selectedProjectId);
      }

      // First, preview the import to show user what will be imported
      showInfo('Analyzing import file...');
      const previewResponse = await importAPI.previewFile(formData);
      console.log('Preview response:', previewResponse.data);
      
      // Show preview information to user
      const previewData = previewResponse.data.data;
      const duplicateCount = previewData.duplicates.summary.duplicateTestCases;
      const totalCount = previewData.statistics.totalTestCases;
      
      if (duplicateCount > 0) {
        showWarning(`Found ${duplicateCount} duplicate test cases out of ${totalCount} total. You can proceed with the import or review the duplicates first.`);
        const confirmMessage = `Found ${duplicateCount} duplicate test cases out of ${totalCount} total. Do you want to proceed with the import?`;
        if (!window.confirm(confirmMessage)) {
          setUploading(false);
          return;
        }
      }

      // Proceed with import using the recommended strategy
      showInfo('Importing test cases...');
      const importFormData = new FormData();
      importFormData.append('xmlFile', file);
      
      // Add project information
      if (showNewProjectForm) {
        importFormData.append('newProjectName', newProjectName.trim());
        importFormData.append('newProjectDescription', newProjectDescription.trim());
      } else {
        importFormData.append('projectId', selectedProjectId);
      }
      
      importFormData.append('strategy', previewData.recommendations.suggestedStrategy);

      const response = await importAPI.importFile(importFormData);

      const successMessage = showNewProjectForm 
        ? `Successfully imported ${file.name} into new project "${newProjectName}" with ${response.data.data.importedCases} new cases and ${response.data.data.updatedCases} updated cases`
        : `Successfully imported ${file.name} with ${response.data.data.importedCases} new cases and ${response.data.data.updatedCases} updated cases`;
      
      showSuccess(successMessage);
      console.log('Import response:', response.data);
      
      // If new project was created, refresh projects list and select it
      let newProjectId = null;
      if (showNewProjectForm && response.data.data.projectCreated) {
        const projectsResponse = await projectsAPI.getAll();
        const projectsData = projectsResponse.data.data || [];
        setProjects(projectsData);
        
        // Find the newly created project and select it
        const newProject = projectsData.find(p => p.name === newProjectName.trim());
        if (newProject) {
          newProjectId = newProject.id;
          setSelectedProjectId(newProject.id.toString());
        }
        
        // Reset new project form
        setShowNewProjectForm(false);
        setNewProjectName('');
        setNewProjectDescription('');
      }
      
      // Refresh import history after successful import
      const currentProjectId = newProjectId || selectedProjectId;
      const historyResponse = await importAPI.getLogs(currentProjectId);
      const logs = historyResponse.data.data || [];
      const transformedHistory = logs.map(log => ({
        id: log.id,
        filename: log.file_name || 'Unknown file',
        size: log.file_size ? `${(log.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
        uploaded: new Date(log.started_at).toLocaleDateString(),
        status: log.status === 'completed' ? 'Completed' : 
                log.status === 'failed' ? 'Failed' : 
                log.status === 'processing' ? 'Processing' : 'Unknown',
        testCases: log.imported_test_cases || 0,
        testSuites: log.imported_test_suites || 0,
        projects: 1,
        duration: log.duration || '--',
        error: log.errors?.[0] || null,
        strategy: log.strategy || 'unknown'
      }));
      setImportHistory(transformedHistory);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      showError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    try {
      // Create a link element to trigger download
      const link = document.createElement('a');
      link.href = 'http://localhost:3001/api/import/template';
      link.download = 'testlink-template.xml';
      link.target = '_blank';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download template:', error);
      // Fallback: open in new tab
      window.open('http://localhost:3001/api/import/template', '_blank');
    }
  };

  const handleRetryImport = async (importId) => {
    try {
      setUploading(true);
      
      // Retry the import with the same strategy
      const response = await importAPI.retryImport(importId);
      
      showSuccess(`Successfully retried import with ${response.data.data.importedCases} new cases and ${response.data.data.updatedCases} updated cases`);
      console.log('Retry response:', response.data);
      
      // Refresh import history after successful retry
      const historyResponse = await importAPI.getLogs(1);
      const logs = historyResponse.data.data || [];
      const transformedHistory = logs.map(log => ({
        id: log.id,
        filename: log.file_name || 'Unknown file',
        size: log.file_size ? `${(log.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
        uploaded: new Date(log.started_at).toLocaleDateString(),
        status: log.status === 'completed' ? 'Completed' : 
                log.status === 'failed' ? 'Failed' : 
                log.status === 'processing' ? 'Processing' : 'Unknown',
        testCases: log.imported_test_cases || 0,
        testSuites: log.imported_test_suites || 0,
        projects: 1,
        duration: log.duration || '--',
        error: log.errors?.[0] || null,
        strategy: log.strategy || 'unknown'
      }));
      setImportHistory(transformedHistory);
      
    } catch (error) {
      console.error('Retry error:', error);
      showError(error.response?.data?.error || 'Failed to retry import');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImport = async (importId) => {
    if (!window.confirm('Are you sure you want to delete this import record? This action cannot be undone.')) {
      return;
    }
    
    try {
      setUploading(true);
      
      // Delete the import log
      await importAPI.deleteImportLog(importId);
      
      showSuccess('Import record deleted successfully');
      
      // Refresh import history after successful deletion
      const historyResponse = await importAPI.getLogs(1);
      const logs = historyResponse.data.data || [];
      const transformedHistory = logs.map(log => ({
        id: log.id,
        filename: log.file_name || 'Unknown file',
        size: log.file_size ? `${(log.file_size / 1024 / 1024).toFixed(1)} MB` : 'Unknown',
        uploaded: new Date(log.started_at).toLocaleDateString(),
        status: log.status === 'completed' ? 'Completed' : 
                log.status === 'failed' ? 'Failed' : 
                log.status === 'processing' ? 'Processing' : 'Unknown',
        testCases: log.imported_test_cases || 0,
        testSuites: log.imported_test_suites || 0,
        projects: 1,
        duration: log.duration || '--',
        error: log.errors?.[0] || null,
        strategy: log.strategy || 'unknown'
      }));
      setImportHistory(transformedHistory);
      
    } catch (error) {
      console.error('Delete error:', error);
      showError(error.response?.data?.error || 'Failed to delete import record');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout
      onSearch={handleLayoutSearch}
      showSearch={false}
      breadcrumbs={[
        { label: 'Import', href: '/import' }
      ]}
      actions={[
        {
          label: 'Import File',
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
          onClick: handleImportFile
        }
      ]}
    >
      {/* Page Header */}
      <div className="mb-6" data-element="import-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7" data-element="import-page-title">
              Import
            </h1>
            <p className="text-apple-gray-5 mt-1" data-element="import-page-description">
              Import TestLink XML files to migrate your test cases and test suites
            </p>
          </div>
        </div>
      </div>

      {/* Project Selection */}
      <div className="mb-6" data-element="project-selection-section">
        <Card elevation="sm" hover={false} data-element="project-selection-card">
          <Card.Header data-element="project-selection-header">
            <h3 className="text-lg font-sf-display font-semibold text-apple-gray-7" data-element="project-selection-title">
              Project Selection
            </h3>
          </Card.Header>
          <Card.Body className="p-6" data-element="project-selection-body">
            {loadingProjects ? (
              <div className="flex items-center justify-center space-x-3 py-6">
                <Clock className="w-5 h-5 text-apple-gray-4 animate-spin" />
                <span className="text-sm font-medium text-apple-gray-5">Loading projects...</span>
              </div>
            ) : (
              <div className="space-y-6" data-element="project-selection-content">
                {/* Existing Project Selection */}
                <div className="space-y-3" data-element="existing-project-section">
                  <label className="text-sm font-sf font-semibold text-apple-gray-7" data-element="project-selection-label">
                    Select Existing Project
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    disabled={showNewProjectForm}
                    className="w-full px-4 py-3 border border-apple-gray-3 rounded-apple-lg text-sm font-sf focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200 disabled:bg-apple-gray-1 disabled:text-apple-gray-4"
                    data-element="project-select"
                  >
                    <option value="">Choose a project...</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-apple-gray-2"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-apple-gray-4 font-medium">or</span>
                  </div>
                </div>

                {/* New Project Creation */}
                <div className="space-y-3" data-element="new-project-section">
                  <div className="flex items-center space-x-3" data-element="new-project-toggle">
                    <input
                      type="checkbox"
                      id="create-new-project"
                      checked={showNewProjectForm}
                      onChange={(e) => {
                        setShowNewProjectForm(e.target.checked);
                        if (e.target.checked) {
                          setSelectedProjectId('');
                        }
                      }}
                      className="w-5 h-5 text-apple-blue border-apple-gray-3 rounded-md focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-0 transition-colors duration-200"
                      data-element="new-project-checkbox"
                    />
                    <label htmlFor="create-new-project" className="text-sm font-sf font-semibold text-apple-gray-7 cursor-pointer" data-element="new-project-label">
                      Create New Project
                    </label>
                  </div>

                  {showNewProjectForm && (
                    <div className="space-y-4 pl-8" data-element="new-project-form">
                      <div data-element="new-project-name">
                        <label className="text-sm font-sf font-semibold text-apple-gray-7" data-element="new-project-name-label">
                          Project Name *
                        </label>
                        <Input
                          type="text"
                          value={newProjectName}
                          onChange={(e) => setNewProjectName(e.target.value)}
                          placeholder="Enter project name"
                          className="mt-2"
                          data-element="new-project-name-input"
                        />
                      </div>
                      <div data-element="new-project-description">
                        <label className="text-sm font-sf font-semibold text-apple-gray-7" data-element="new-project-description-label">
                          Description (Optional)
                        </label>
                        <textarea
                          value={newProjectDescription}
                          onChange={(e) => setNewProjectDescription(e.target.value)}
                          placeholder="Enter project description"
                          rows={3}
                          className="w-full px-4 py-3 mt-2 border border-apple-gray-3 rounded-apple-lg text-sm font-sf focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200 resize-none"
                          data-element="new-project-description-input"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>

      {/* Import Tabs */}
      <div className="mb-8" data-element="import-tabs-section">
        <Card elevation="sm" hover={false} data-element="import-tabs-card">
          <Card.Header className="border-b border-apple-gray-2" data-element="import-tabs-header">
            <nav className="flex space-x-8" data-element="import-tabs-nav">
              <button
                onClick={() => setActiveTab('testlink')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'testlink'
                    ? 'border-apple-blue text-apple-blue'
                    : 'border-transparent text-apple-gray-5 hover:text-apple-gray-7 hover:border-apple-gray-3'
                }`}
                data-element="testlink-tab"
              >
                TestLink Import
              </button>
              <button
                onClick={() => setActiveTab('smart')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                  activeTab === 'smart'
                    ? 'border-apple-blue text-apple-blue'
                    : 'border-transparent text-apple-gray-5 hover:text-apple-gray-7 hover:border-apple-gray-3'
                }`}
                data-element="smart-tab"
              >
                <Brain className="w-4 h-4" />
                <span>Smart Import</span>
              </button>
            </nav>
          </Card.Header>
          
          {/* TestLink Import Tab Content */}
          {activeTab === 'testlink' && (
            <Card.Body className="p-8" data-element="testlink-import-body">
            <div
              className={`relative border-2 border-dashed rounded-apple-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-apple-blue bg-apple-blue/5'
                  : 'border-apple-gray-3 hover:border-apple-gray-4'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              data-element="import-drop-zone"
            >
              <Upload className="w-16 h-16 text-apple-gray-4 mx-auto mb-6" data-element="import-upload-icon" />
              <div className="space-y-2" data-element="import-upload-text">
                <label htmlFor="import-file-upload" className="cursor-pointer" data-element="import-upload-label">
                  <span className="text-lg font-sf font-semibold text-apple-blue hover:text-apple-blue/80 transition-colors duration-200" data-element="import-upload-link">
                    Upload TestLink XML file
                  </span>
                  <input 
                    ref={fileInputRef}
                    id="import-file-upload" 
                    name="import-file-upload" 
                    type="file" 
                    accept=".xml" 
                    className="sr-only" 
                    data-element="import-file-input"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="text-sm text-apple-gray-5" data-element="import-drag-text">or drag and drop</p>
              </div>
              <p className="text-xs text-apple-gray-4 mt-4" data-element="import-file-types">
                TestLink XML export files only
              </p>
              
              {/* Upload Status */}
              {uploading && (
                <div className="mt-4 p-3 bg-apple-blue/10 border border-apple-blue/20 rounded-apple">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-apple-blue animate-spin" />
                    <span className="text-sm text-apple-blue">Uploading and processing file...</span>
                  </div>
                </div>
              )}
              
              {/* Toast notifications now handle success/error messages */}
            </div>
            
            {/* Help Section */}
            <div className="mt-6 p-6 bg-apple-gray-1 rounded-apple-lg" data-element="import-help-section">
              <div className="flex items-start space-x-4" data-element="import-help-content">
                <FileText className="w-6 h-6 text-apple-blue mt-0.5 flex-shrink-0" data-element="import-help-icon" />
                <div className="space-y-3" data-element="import-help-text">
                  <h4 className="text-sm font-sf font-semibold text-apple-gray-7" data-element="import-help-title">
                    How to export from TestLink
                  </h4>
                  <p className="text-sm text-apple-gray-5 leading-relaxed" data-element="import-help-description">
                    In TestLink, go to Test Specification → Export → XML. Select your test project and export the XML file.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    className="font-sf font-medium"
                    data-element="import-download-template"
                  >
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
            </Card.Body>
          )}
          
          {/* Smart Import Tab Content */}
          {activeTab === 'smart' && (
            <Card.Body className="p-8" data-element="smart-import-body">
              <SmartImportTab
                projects={projects}
                selectedProjectId={selectedProjectId}
                onImportComplete={fetchImportHistory}
              />
            </Card.Body>
          )}
        </Card>
      </div>

      {/* Import History */}
      <div className="mb-8" data-element="import-history-section">
        <Card elevation="sm" hover={false} data-element="import-history-card">
          <Card.Header data-element="import-history-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-sf-display font-semibold text-apple-gray-7" data-element="import-history-title">
                Import History
              </h3>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-sf text-apple-gray-5">
                  {showAllProjects || showNewProjectForm || !selectedProjectId ? 'All Projects' : 'Current Project Only'}
                </span>
                {!showNewProjectForm && selectedProjectId && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAllProjects(!showAllProjects)}
                    className="font-sf font-medium"
                    data-element="import-history-toggle"
                  >
                    {showAllProjects ? 'Show Current Project' : 'Show All Projects'}
                  </Button>
                )}
              </div>
            </div>
          </Card.Header>
          <Card.Body className="p-0" data-element="import-history-body">
            <div className="overflow-x-auto" data-element="import-table-container">
              <table className="min-w-full divide-y divide-apple-gray-2" data-element="import-table">
                <thead className="bg-apple-gray-1" data-element="import-table-header">
                  <tr data-element="import-table-header-row">
                    <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-file">
                      File
                    </th>
                    {(showAllProjects || showNewProjectForm || !selectedProjectId) && (
                      <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-project">
                        Project
                      </th>
                    )}
                    <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-size">
                      Size
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-status">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-results">
                      Results
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-duration">
                      Duration
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-uploaded">
                      Uploaded
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-sf font-semibold text-apple-gray-5 uppercase tracking-wider" data-element="import-header-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-apple-gray-2" data-element="import-table-body">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={(showAllProjects || showNewProjectForm || !selectedProjectId) ? 8 : 7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <Clock className="w-6 h-6 text-apple-gray-4 animate-spin" />
                          <span className="text-sm font-sf font-medium text-apple-gray-5">Loading import history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : historyError ? (
                    <tr>
                      <td colSpan={(showAllProjects || showNewProjectForm || !selectedProjectId) ? 8 : 7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <AlertCircle className="w-6 h-6 text-apple-red" />
                          <span className="text-sm font-sf font-medium text-apple-red">{historyError}</span>
                        </div>
                      </td>
                    </tr>
                  ) : importHistory.length === 0 ? (
                    <tr>
                      <td colSpan={(showAllProjects || showNewProjectForm || !selectedProjectId) ? 8 : 7} className="px-6 py-12 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <FileText className="w-6 h-6 text-apple-gray-4" />
                          <span className="text-sm font-sf font-medium text-apple-gray-5">No import history found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    importHistory.map((importItem, index) => (
                    <tr key={importItem.id} className="hover:bg-apple-gray-1/30 transition-colors duration-200" data-element={`import-row-${index + 1}`}>
                      <td className="px-6 py-5 whitespace-nowrap" data-element={`import-file-${index + 1}`}>
                        <div className="flex items-center" data-element={`import-file-info-${index + 1}`}>
                          <div data-element={`import-file-icon-${index + 1}`}>
                            <FileText className="w-5 h-5 text-apple-blue" />
                          </div>
                          <div className="ml-4" data-element={`import-file-details-${index + 1}`}>
                            <div className="text-sm font-sf font-semibold text-apple-gray-7" data-element={`import-filename-${index + 1}`}>
                              {importItem.filename}
                            </div>
                            <div className="text-sm text-apple-gray-5 mt-1" data-element={`import-filesize-${index + 1}`}>
                              {importItem.size}
                            </div>
                          </div>
                        </div>
                      </td>
                      {(showAllProjects || showNewProjectForm || !selectedProjectId) && (
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-sf text-apple-gray-7" data-element={`import-project-${index + 1}`}>
                          <div className="flex items-center space-x-2">
                            <Badge variant="default" size="sm" className="bg-apple-blue/10 text-apple-blue border-apple-blue/20">
                              {importItem.projectName}
                            </Badge>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-sf text-apple-gray-7" data-element={`import-size-${index + 1}`}>
                        {importItem.size}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap" data-element={`import-status-${index + 1}`}>
                        <div className="flex items-center space-x-3" data-element={`import-status-content-${index + 1}`}>
                          <div data-element={`import-status-icon-${index + 1}`}>
                            {getStatusIcon(importItem.status)}
                          </div>
                          <Badge 
                            variant={getStatusBadgeVariant(importItem.status)} 
                            size="sm"
                            data-element={`import-status-badge-${index + 1}`}
                          >
                            {importItem.status}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-sf text-apple-gray-7" data-element={`import-results-${index + 1}`}>
                        <div className="space-y-1" data-element={`import-results-details-${index + 1}`}>
                          <div data-element={`import-testcases-${index + 1}`}>
                            {importItem.testCases} test cases
                          </div>
                          <div data-element={`import-testsuites-${index + 1}`}>
                            {importItem.testSuites} test suites
                          </div>
                          <div data-element={`import-projects-${index + 1}`}>
                            {importItem.projects} projects
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-sf text-apple-gray-7" data-element={`import-duration-${index + 1}`}>
                        {importItem.duration}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-sf text-apple-gray-7" data-element={`import-uploaded-${index + 1}`}>
                        {importItem.uploaded}
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-sf font-medium" data-element={`import-actions-${index + 1}`}>
                        <div className="flex items-center space-x-3" data-element={`import-action-buttons-${index + 1}`}>
                          {importItem.status === 'Failed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRetryImport(importItem.id)}
                              className="font-sf font-medium"
                              data-element={`import-retry-${index + 1}`}
                            >
                              Retry
                            </Button>
                          )}
                          <button 
                            className="text-apple-red hover:text-apple-red/80 transition-colors duration-200 p-1 rounded-md hover:bg-apple-red/5" 
                            onClick={() => handleDeleteImport(importItem.id)}
                            data-element={`import-delete-${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                  )}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
};

export default Import; 