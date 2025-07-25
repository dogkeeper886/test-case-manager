import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Trash2, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';
import { importAPI } from '../services/api';
import { showSuccess, showError } from '../utils/toast';

const Import = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Removed uploadError and uploadSuccess state - now using toast notifications
  const [importHistory, setImportHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch import history on component mount
  useEffect(() => {
    const fetchImportHistory = async () => {
      try {
        setLoadingHistory(true);
        setHistoryError(null);
        
        // Fetch import logs for project 1 (sample project)
        const response = await importAPI.getLogs(1);
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
          projects: 1, // Always 1 for now
          duration: log.duration || '--',
          error: log.errors?.[0] || null,
          strategy: log.strategy || 'unknown'
        }));
        
        setImportHistory(transformedHistory);
      } catch (error) {
        console.error('Failed to fetch import history:', error);
        setHistoryError('Failed to load import history');
        // Fallback to empty array
        setImportHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchImportHistory();
  }, []);

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

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('xmlFile', file);
      formData.append('projectId', '1'); // Use the sample project

      // First, preview the import to show user what will be imported
      const previewResponse = await importAPI.previewFile(formData);
      console.log('Preview response:', previewResponse.data);
      
      // Show preview information to user
      const previewData = previewResponse.data.data;
      const duplicateCount = previewData.duplicates.summary.duplicateTestCases;
      const totalCount = previewData.statistics.totalTestCases;
      
      if (duplicateCount > 0) {
        const confirmMessage = `Found ${duplicateCount} duplicate test cases out of ${totalCount} total. Do you want to proceed with the import?`;
        if (!window.confirm(confirmMessage)) {
          setUploading(false);
          return;
        }
      }

      // Proceed with import using the recommended strategy
      const importFormData = new FormData();
      importFormData.append('xmlFile', file);
      importFormData.append('projectId', '1');
      importFormData.append('strategy', previewData.recommendations.suggestedStrategy);

      const response = await importAPI.importFile(importFormData);

      showSuccess(`Successfully imported ${file.name} with ${response.data.data.importedCases} new cases and ${response.data.data.updatedCases} updated cases`);
      console.log('Import response:', response.data);
      
      // Refresh import history after successful import
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

      {/* Import Area */}
      <div className="mb-8" data-element="import-upload-section">
        <Card elevation="sm" data-element="import-upload-card">
          <Card.Body className="p-8" data-element="import-upload-body">
            <div
              className={`relative border-2 border-dashed rounded-apple p-8 text-center transition-all duration-200 ${
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
              <Upload className="w-12 h-12 text-apple-gray-4 mx-auto mb-4" data-element="import-upload-icon" />
              <div className="text-sm text-apple-gray-6" data-element="import-upload-text">
                <label htmlFor="import-file-upload" className="cursor-pointer" data-element="import-upload-label">
                  <span className="font-medium text-apple-blue hover:text-apple-blue/80" data-element="import-upload-link">
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
                <p className="pl-1" data-element="import-drag-text">or drag and drop</p>
              </div>
              <p className="text-xs text-apple-gray-4 mt-2" data-element="import-file-types">
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
            <div className="mt-6 p-4 bg-apple-gray-1 rounded-apple" data-element="import-help-section">
              <div className="flex items-start space-x-3" data-element="import-help-content">
                <FileText className="w-5 h-5 text-apple-blue mt-0.5" data-element="import-help-icon" />
                <div data-element="import-help-text">
                  <h4 className="text-sm font-medium text-apple-gray-7 mb-1" data-element="import-help-title">
                    How to export from TestLink
                  </h4>
                  <p className="text-xs text-apple-gray-5 mb-2" data-element="import-help-description">
                    In TestLink, go to Test Specification → Export → XML. Select your test project and export the XML file.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleDownloadTemplate}
                    data-element="import-download-template"
                  >
                    Download Template
                  </Button>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Import History */}
      <div className="mb-8" data-element="import-history-section">
        <Card elevation="sm" data-element="import-history-card">
          <Card.Header data-element="import-history-header">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="import-history-title">
              Import History
            </h3>
          </Card.Header>
          <Card.Body className="p-0" data-element="import-history-body">
            <div className="overflow-x-auto" data-element="import-table-container">
              <table className="min-w-full divide-y divide-apple-gray-2" data-element="import-table">
                <thead className="bg-apple-gray-1" data-element="import-table-header">
                  <tr data-element="import-table-header-row">
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="import-header-file">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="import-header-size">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="import-header-status">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="import-header-results">
                      Results
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="import-header-duration">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="import-header-uploaded">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="import-header-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-apple-gray-2" data-element="import-table-body">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Clock className="w-5 h-5 text-apple-gray-4 animate-spin" />
                          <span className="text-apple-gray-5">Loading import history...</span>
                        </div>
                      </td>
                    </tr>
                  ) : historyError ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <AlertCircle className="w-5 h-5 text-apple-red" />
                          <span className="text-apple-red">{historyError}</span>
                        </div>
                      </td>
                    </tr>
                  ) : importHistory.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="w-5 h-5 text-apple-gray-4" />
                          <span className="text-apple-gray-5">No import history found</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    importHistory.map((importItem, index) => (
                    <tr key={importItem.id} className="hover:bg-apple-gray-1/50 transition-colors" data-element={`import-row-${index + 1}`}>
                      <td className="px-6 py-4 whitespace-nowrap" data-element={`import-file-${index + 1}`}>
                        <div className="flex items-center" data-element={`import-file-info-${index + 1}`}>
                          <div data-element={`import-file-icon-${index + 1}`}>
                            <FileText className="w-5 h-5 text-apple-blue" />
                          </div>
                          <div className="ml-3" data-element={`import-file-details-${index + 1}`}>
                            <div className="text-sm font-medium text-apple-gray-7" data-element={`import-filename-${index + 1}`}>
                              {importItem.filename}
                            </div>
                            <div className="text-sm text-apple-gray-5" data-element={`import-filesize-${index + 1}`}>
                              {importItem.size}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`import-size-${index + 1}`}>
                        {importItem.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-element={`import-status-${index + 1}`}>
                        <div className="flex items-center space-x-2" data-element={`import-status-content-${index + 1}`}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`import-results-${index + 1}`}>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`import-duration-${index + 1}`}>
                        {importItem.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`import-uploaded-${index + 1}`}>
                        {importItem.uploaded}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-element={`import-actions-${index + 1}`}>
                        <div className="flex items-center space-x-2" data-element={`import-action-buttons-${index + 1}`}>
                          {importItem.status === 'Failed' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRetryImport(importItem.id)}
                              data-element={`import-retry-${index + 1}`}
                            >
                              Retry
                            </Button>
                          )}
                          <button 
                            className="text-apple-red hover:text-apple-red/80 transition-colors" 
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