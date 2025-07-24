import React, { useState } from 'react';
import { Upload, File, FileText, Download, Trash2, Plus } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';

const Documents = () => {
  const [dragActive, setDragActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const documents = [
    {
      id: 1,
      name: 'requirements.pdf',
      type: 'PDF',
      size: '2.3 MB',
      uploaded: '2024-01-20',
      testCases: 15,
      status: 'Processed',
    },
    {
      id: 2,
      name: 'user-stories.docx',
      type: 'Word',
      size: '1.8 MB',
      uploaded: '2024-01-22',
      testCases: 8,
      status: 'Processing',
    },
    {
      id: 3,
      name: 'api-specification.md',
      type: 'Markdown',
      size: '0.5 MB',
      uploaded: '2024-01-25',
      testCases: 0,
      status: 'Pending',
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

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF':
        return <File className="w-5 h-5 text-red-500" />;
      case 'Word':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'Markdown':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-apple-gray-4" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Processed':
        return 'success';
      case 'Processing':
        return 'warning';
      case 'Pending':
        return 'default';
      default:
        return 'default';
    }
  };

  const handleLayoutSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement document search
  };

  const handleUploadDocument = () => {
    console.log('Upload document');
  };

  const handleGenerateTests = (docId) => {
    console.log('Generate tests for document:', docId);
  };

  const handleDownloadDocument = (docId) => {
    console.log('Download document:', docId);
  };

  const handleDeleteDocument = (docId) => {
    console.log('Delete document:', docId);
  };

  return (
    <Layout
      onSearch={handleLayoutSearch}
      breadcrumbs={[
        { label: 'Documents', href: '/documents' }
      ]}
      actions={[
        {
          label: 'Upload Document',
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
          onClick: handleUploadDocument
        }
      ]}
    >
      {/* Page Header */}
      <div className="mb-6" data-element="documents-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7" data-element="documents-page-title">
              Documents
            </h1>
            <p className="text-apple-gray-5 mt-1" data-element="documents-page-description">
              Upload and manage design documents for test case generation
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-8" data-element="documents-upload-section">
        <Card elevation="sm" data-element="documents-upload-card">
          <Card.Body className="p-8" data-element="documents-upload-body">
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
              data-element="documents-drop-zone"
            >
              <Upload className="w-12 h-12 text-apple-gray-4 mx-auto mb-4" data-element="documents-upload-icon" />
              <div className="text-sm text-apple-gray-6" data-element="documents-upload-text">
                <label htmlFor="file-upload" className="cursor-pointer" data-element="documents-upload-label">
                  <span className="font-medium text-apple-blue hover:text-apple-blue/80" data-element="documents-upload-link">
                    Upload a file
                  </span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" data-element="documents-file-input" />
                </label>
                <p className="pl-1" data-element="documents-drag-text">or drag and drop</p>
              </div>
              <p className="text-xs text-apple-gray-4 mt-2" data-element="documents-file-types">
                PDF, Word, or Markdown files up to 10MB
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Documents List */}
      <div className="mb-8" data-element="documents-list-section">
        <Card elevation="sm" data-element="documents-list-card">
          <Card.Header data-element="documents-list-header">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="documents-list-title">
              Uploaded Documents
            </h3>
          </Card.Header>
          <Card.Body className="p-0" data-element="documents-list-body">
            <div className="overflow-x-auto" data-element="documents-table-container">
              <table className="min-w-full divide-y divide-apple-gray-2" data-element="documents-table">
                <thead className="bg-apple-gray-1" data-element="documents-table-header">
                  <tr data-element="documents-table-header-row">
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="documents-header-document">
                      Document
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="documents-header-size">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="documents-header-testcases">
                      Test Cases
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="documents-header-status">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="documents-header-uploaded">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-5 uppercase tracking-wider" data-element="documents-header-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-apple-gray-2" data-element="documents-table-body">
                  {documents.map((doc, index) => (
                    <tr key={doc.id} className="hover:bg-apple-gray-1/50 transition-colors" data-element={`documents-row-${index + 1}`}>
                      <td className="px-6 py-4 whitespace-nowrap" data-element={`documents-document-${index + 1}`}>
                        <div className="flex items-center" data-element={`documents-document-info-${index + 1}`}>
                          <div data-element={`documents-document-icon-${index + 1}`}>
                            {getFileIcon(doc.type)}
                          </div>
                          <div className="ml-3" data-element={`documents-document-details-${index + 1}`}>
                            <div className="text-sm font-medium text-apple-gray-7" data-element={`documents-document-name-${index + 1}`}>
                              {doc.name}
                            </div>
                            <div className="text-sm text-apple-gray-5" data-element={`documents-document-type-${index + 1}`}>
                              {doc.type}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`documents-size-${index + 1}`}>
                        {doc.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`documents-testcases-${index + 1}`}>
                        {doc.testCases}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" data-element={`documents-status-${index + 1}`}>
                        <Badge 
                          variant={getStatusBadgeVariant(doc.status)} 
                          size="sm"
                          data-element={`documents-status-badge-${index + 1}`}
                        >
                          {doc.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`documents-uploaded-${index + 1}`}>
                        {doc.uploaded}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-element={`documents-actions-${index + 1}`}>
                        <div className="flex items-center space-x-2" data-element={`documents-action-buttons-${index + 1}`}>
                          <button 
                            className="text-apple-blue hover:text-apple-blue/80 transition-colors" 
                            onClick={() => handleDownloadDocument(doc.id)}
                            data-element={`documents-download-${index + 1}`}
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleGenerateTests(doc.id)}
                            data-element={`documents-generate-${index + 1}`}
                          >
                            Generate Tests
                          </Button>
                          <button 
                            className="text-apple-red hover:text-apple-red/80 transition-colors" 
                            onClick={() => handleDeleteDocument(doc.id)}
                            data-element={`documents-delete-${index + 1}`}
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

export default Documents;