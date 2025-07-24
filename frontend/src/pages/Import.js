import React, { useState } from 'react';
import { Upload, FileText, Download, Trash2, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';

const Import = () => {
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const importHistory = [
    {
      id: 1,
      filename: 'testlink-export-2024-01.xml',
      size: '15.2 MB',
      uploaded: '2024-01-20',
      status: 'Completed',
      testCases: 245,
      testSuites: 12,
      projects: 3,
      duration: '2m 34s',
    },
    {
      id: 2,
      filename: 'legacy-tests.xml',
      size: '8.7 MB',
      uploaded: '2024-01-18',
      status: 'Failed',
      testCases: 0,
      testSuites: 0,
      projects: 0,
      duration: '0m 12s',
      error: 'Invalid XML format',
    },
    {
      id: 3,
      filename: 'regression-suite.xml',
      size: '22.1 MB',
      uploaded: '2024-01-15',
      status: 'Processing',
      testCases: 0,
      testSuites: 0,
      projects: 0,
      duration: '--',
    },
  ];

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
      // Handle file upload
      console.log('File dropped:', e.dataTransfer.files[0]);
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
    setSearchQuery(query);
    // TODO: Implement import history search
  };

  const handleImportFile = () => {
    console.log('Import file');
  };

  const handleDownloadTemplate = () => {
    console.log('Download template');
  };

  const handleRetryImport = (importId) => {
    console.log('Retry import:', importId);
  };

  const handleDeleteImport = (importId) => {
    console.log('Delete import:', importId);
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
                  <input id="import-file-upload" name="import-file-upload" type="file" accept=".xml" className="sr-only" data-element="import-file-input" />
                </label>
                <p className="pl-1" data-element="import-drag-text">or drag and drop</p>
              </div>
              <p className="text-xs text-apple-gray-4 mt-2" data-element="import-file-types">
                TestLink XML export files only
              </p>
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
                  {importHistory.map((importItem, index) => (
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
                  ))}
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