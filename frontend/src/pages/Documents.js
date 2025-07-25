import React, { useState } from 'react';
import { Upload, FileText, Search, Filter, Eye, Download, Trash2, Plus, FolderOpen, Calendar, User, File, FileImage, FileVideo } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';

const Documents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const documents = [
    {
      id: 1,
      name: 'E-commerce Platform Requirements',
      type: 'pdf',
      size: '2.4 MB',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-01-28',
      status: 'processed',
      description: 'Comprehensive requirements document for the e-commerce platform',
      dataElement: 'document-1'
    },
    {
      id: 2,
      name: 'Mobile App Design Specs',
      type: 'docx',
      size: '1.8 MB',
      uploadedBy: 'Jane Smith',
      uploadedAt: '2024-01-27',
      status: 'processing',
      description: 'Design specifications for the mobile banking application',
      dataElement: 'document-2'
    },
    {
      id: 3,
      name: 'API Documentation',
      type: 'md',
      size: '0.5 MB',
      uploadedBy: 'Mike Johnson',
      uploadedAt: '2024-01-26',
      status: 'processed',
      description: 'REST API documentation and endpoint specifications',
      dataElement: 'document-3'
    },
    {
      id: 4,
      name: 'User Interface Mockups',
      type: 'png',
      size: '3.2 MB',
      uploadedBy: 'Sarah Wilson',
      uploadedAt: '2024-01-25',
      status: 'processed',
      description: 'UI mockups and wireframes for the dashboard',
      dataElement: 'document-4'
    },
    {
      id: 5,
      name: 'Database Schema Design',
      type: 'sql',
      size: '0.8 MB',
      uploadedBy: 'David Brown',
      uploadedAt: '2024-01-24',
      status: 'processed',
      description: 'Database schema and relationship diagrams',
      dataElement: 'document-5'
    },
    {
      id: 6,
      name: 'Test Plan Overview',
      type: 'pdf',
      size: '1.1 MB',
      uploadedBy: 'Lisa Chen',
      uploadedAt: '2024-01-23',
      status: 'failed',
      description: 'Comprehensive test plan for the entire application',
      dataElement: 'document-6'
    }
  ];

  const handleUploadDocument = () => {
    console.log('Upload document clicked');
    // TODO: Open file upload modal
  };

  const handleViewDocument = (document) => {
    console.log('View document:', document);
    // TODO: Open document viewer
  };

  const handleDownloadDocument = (document) => {
    console.log('Download document:', document);
    // TODO: Implement download functionality
  };

  const handleDeleteDocument = (document) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      console.log('Delete document:', document);
      // TODO: Implement delete functionality
    }
  };

  const handleLayoutSearch = (query) => {
    setSearchQuery(query);
  };

  const getFileIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="w-6 h-6 text-blue-500" />;
      case 'md':
        return <FileText className="w-6 h-6 text-gray-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FileImage className="w-6 h-6 text-green-500" />;
      case 'mp4':
      case 'avi':
        return <FileVideo className="w-6 h-6 text-purple-500" />;
      case 'sql':
        return <FileText className="w-6 h-6 text-orange-500" />;
      default:
        return <File className="w-6 h-6 text-apple-gray-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processed':
        return <Badge variant="success" size="sm">Processed</Badge>;
      case 'processing':
        return <Badge variant="warning" size="sm">Processing</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>;
      default:
        return <Badge variant="default" size="sm">Unknown</Badge>;
    }
  };

  // Filter documents based on search and filters
  const filteredDocuments = documents.filter(doc => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        doc.name.toLowerCase().includes(query) ||
        doc.description.toLowerCase().includes(query) ||
        doc.uploadedBy.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    if (statusFilter && doc.status !== statusFilter) return false;
    if (typeFilter && doc.type !== typeFilter) return false;

    return true;
  });

  return (
    <Layout
      breadcrumbs={[
        { label: 'Documents', href: '/documents' }
      ]}
      showSearch={true}
      onSearch={handleLayoutSearch}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="documents-header">
        <div className="flex items-center justify-between" data-element="documents-header-content">
          <div data-element="documents-title-section">
            <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7" data-element="documents-title">
              Documents
            </h1>
            <p className="text-apple-gray-5 mt-2" data-element="documents-subtitle">
              Upload and manage design documents for test case generation
            </p>
          </div>
          <div className="flex items-center gap-3" data-element="documents-actions">
            <Button
              variant="primary"
              onClick={handleUploadDocument}
              data-element="documents-upload-button"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6" data-element="documents-filters">
        <div className="flex flex-col sm:flex-row gap-4" data-element="documents-filters-content">
          <div className="flex-1" data-element="documents-search">
            <div className="relative" data-element="documents-search-container">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-apple-gray-4" />
              <Input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-element="documents-search-input"
              />
            </div>
          </div>
          <div className="flex gap-2" data-element="documents-filter-buttons">
            <select
              className="px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              data-element="documents-status-filter"
            >
              <option value="">All Status</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
            <select
              className="px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              data-element="documents-type-filter"
            >
              <option value="">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="md">Markdown</option>
              <option value="png">Image</option>
              <option value="sql">SQL</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card elevation="sm" data-element="documents-empty-state">
          <div className="text-center py-12" data-element="documents-empty-content">
            <FolderOpen className="w-16 h-16 text-apple-gray-4 mx-auto mb-4" />
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2" data-element="documents-empty-title">
              No documents found
            </h3>
            <p className="text-apple-gray-5 mb-6" data-element="documents-empty-description">
              {searchQuery || statusFilter || typeFilter
                ? 'Try adjusting your search or filters'
                : 'Get started by uploading your first document'
              }
            </p>
            {!searchQuery && !statusFilter && !typeFilter && (
              <Button
                variant="primary"
                onClick={handleUploadDocument}
                data-element="documents-empty-upload"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-element="documents-grid">
          {filteredDocuments.map((document) => (
            <Card
              key={document.id}
              elevation="sm"
              hover="lift"
              className="cursor-pointer"
              data-element={document.dataElement}
            >
              <div className="p-6" data-element={`${document.dataElement}-content`}>
                {/* Document Header */}
                <div className="flex items-start justify-between mb-4" data-element={`${document.dataElement}-header`}>
                  <div className="flex items-center space-x-3" data-element={`${document.dataElement}-icon-section`}>
                    {getFileIcon(document.type)}
                    <div className="flex-1 min-w-0" data-element={`${document.dataElement}-title-section`}>
                      <h3 className="text-lg font-sf font-semibold text-apple-gray-7 truncate" data-element={`${document.dataElement}-name`}>
                        {document.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1" data-element={`${document.dataElement}-meta`}>
                        <span className="text-xs text-apple-gray-4 uppercase" data-element={`${document.dataElement}-type`}>
                          {document.type}
                        </span>
                        <span className="text-xs text-apple-gray-4" data-element={`${document.dataElement}-size`}>
                          {document.size}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1" data-element={`${document.dataElement}-actions`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(document);
                      }}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                      data-element={`${document.dataElement}-view`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(document);
                      }}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                      data-element={`${document.dataElement}-download`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(document);
                      }}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-error hover:bg-error/10 transition-all duration-200"
                      data-element={`${document.dataElement}-delete`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Document Description */}
                <p className="text-sm text-apple-gray-5 mb-4 line-clamp-2" data-element={`${document.dataElement}-description`}>
                  {document.description}
                </p>

                {/* Status Badge */}
                <div className="mb-4" data-element={`${document.dataElement}-status`}>
                  {getStatusBadge(document.status)}
                </div>

                {/* Document Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-apple-gray-2" data-element={`${document.dataElement}-metadata`}>
                  <div className="flex items-center space-x-4 text-xs text-apple-gray-4" data-element={`${document.dataElement}-info`}>
                    <div className="flex items-center space-x-1" data-element={`${document.dataElement}-uploaded-by`}>
                      <User className="w-3 h-3" />
                      <span>{document.uploadedBy}</span>
                    </div>
                    <div className="flex items-center space-x-1" data-element={`${document.dataElement}-uploaded-at`}>
                      <Calendar className="w-3 h-3" />
                      <span>{document.uploadedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredDocuments.length > 0 && (
        <div className="mt-8" data-element="documents-summary">
          <Card elevation="sm" data-element="documents-summary-card">
            <div className="flex items-center justify-between" data-element="documents-summary-content">
              <div className="flex items-center gap-6" data-element="documents-summary-stats">
                <div className="text-center" data-element="documents-summary-total">
                  <p className="text-2xl font-sf font-bold text-apple-gray-7" data-element="documents-summary-total-count">
                    {filteredDocuments.length}
                  </p>
                  <p className="text-sm text-apple-gray-5" data-element="documents-summary-total-label">
                    Documents
                  </p>
                </div>
                <div className="text-center" data-element="documents-summary-processed">
                  <p className="text-2xl font-sf font-bold text-success" data-element="documents-summary-processed-count">
                    {filteredDocuments.filter(d => d.status === 'processed').length}
                  </p>
                  <p className="text-sm text-apple-gray-5" data-element="documents-summary-processed-label">
                    Processed
                  </p>
                </div>
                <div className="text-center" data-element="documents-summary-processing">
                  <p className="text-2xl font-sf font-bold text-warning" data-element="documents-summary-processing-count">
                    {filteredDocuments.filter(d => d.status === 'processing').length}
                  </p>
                  <p className="text-sm text-apple-gray-5" data-element="documents-summary-processing-label">
                    Processing
                  </p>
                </div>
                <div className="text-center" data-element="documents-summary-failed">
                  <p className="text-2xl font-sf font-bold text-error" data-element="documents-summary-failed-count">
                    {filteredDocuments.filter(d => d.status === 'failed').length}
                  </p>
                  <p className="text-sm text-apple-gray-5" data-element="documents-summary-failed-label">
                    Failed
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

export default Documents;