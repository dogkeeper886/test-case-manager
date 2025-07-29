import React, { useState, useEffect } from 'react';
import { 
  X, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  SkipForward,
  FileText,
  Info,
  Calendar,
  Hash,
  BookOpen,
  Layers,
  Target,
  List
} from 'lucide-react';
import { Badge, Button, Card } from '../ui';
import { testCasesAPI } from '../../services/api';
import { showError } from '../../utils/toast';

const TestCaseDetailModal = ({ testCaseId, isOpen, onClose }) => {
  const [testCase, setTestCase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Only fetch data when modal is open and testCaseId is provided
  useEffect(() => {
    if (isOpen && testCaseId) {
      fetchTestCase();
    }
  }, [isOpen, testCaseId]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTestCase(null);
      setLoading(true);
      setError(null);
      setActiveTab('overview');
    }
  }, [isOpen]);

  const fetchTestCase = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testCasesAPI.getById(testCaseId);
      // Handle nested data structure - API returns {success: true, data: actualTestCase}
      const testCaseData = response.data?.data || response.data;
      
      setTestCase(testCaseData);
    } catch (err) {
      console.error('Error fetching test case:', err);
      setError('Failed to load test case details');
      showError('Failed to load test case details');
    } finally {
      setLoading(false);
    }
  };

  // Status and priority helper functions (same as TestCaseDetail)
  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Pending';
      case 2: return 'Passed';
      case 3: return 'Failed';
      case 4: return 'Blocked';
      case 5: return 'Skipped';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <Clock className="w-4 h-4" />;
      case 2: return <CheckCircle className="w-4 h-4" />;
      case 3: return <XCircle className="w-4 h-4" />;
      case 4: return <AlertTriangle className="w-4 h-4" />;
      case 5: return <SkipForward className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 1: return 'default';
      case 2: return 'success';
      case 3: return 'error';
      case 4: return 'warning';
      case 5: return 'info';
      default: return 'default';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Unknown';
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 1: return 'default';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const getImportanceText = (importance) => {
    switch (importance) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Medium';
    }
  };

  const getImportanceBadgeVariant = (importance) => {
    switch (importance) {
      case 1: return 'default';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'warning';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const tabs = [
    { id: 'overview', label: 'Content', icon: <FileText className="w-4 h-4" /> },
    { id: 'details', label: 'Meta Data', icon: <Info className="w-4 h-4" /> },
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      data-element="testcase-detail-modal-backdrop"
    >
      <div 
        className="bg-white rounded-apple-xl shadow-apple-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/5"
        data-element="testcase-detail-modal-container"
      >
        {/* Modal Header - Enhanced Apple Design */}
        <div 
          className="flex items-center justify-between px-8 py-6 border-b border-apple-gray-2/80 bg-gradient-to-b from-white to-apple-gray-1/30"
          data-element="testcase-detail-modal-header"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-apple-blue/10 to-apple-blue/20 rounded-apple-xl flex items-center justify-center shadow-apple-sm ring-1 ring-apple-blue/10">
              <FileText className="w-6 h-6 text-apple-blue" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-sf-display font-semibold text-apple-gray-8 tracking-tight">
                Test Case Details
              </h2>
              <p className="text-sm text-apple-gray-5 font-sf tracking-wide">
                {testCase ? testCase.title : 'Loading test case...'}
              </p>
            </div>
          </div>
          
          {/* Action Buttons - Read-only with link to full page */}
          <div className="flex items-center gap-3" data-element="testcase-detail-modal-actions">
            {testCase && (
              <a
                href={`/testcases/${testCase.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-apple-blue/10 hover:bg-apple-blue/20 rounded-apple-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 hover:shadow-apple-sm text-apple-blue font-sf text-sm font-medium"
                title="Open full test case page for editing"
                data-element="testcase-detail-modal-edit-link"
              >
                <Edit className="w-4 h-4" />
                Edit in Full Page
              </a>
            )}
            
            <div className="w-px h-6 bg-apple-gray-3 mx-2"></div>
            
            <button
              onClick={onClose}
              className="w-10 h-10 bg-apple-gray-2/50 hover:bg-apple-gray-2/80 rounded-apple-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
              title="Close modal"
              data-element="testcase-detail-modal-close"
            >
              <X className="w-4 h-4 text-apple-gray-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="flex items-center justify-center p-12">
              <div className="text-apple-gray-5">Loading test case details...</div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <Card className="border-red-200 bg-red-50">
                <Card.Body className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Test Case</h3>
                  <p className="text-red-600">{error}</p>
                  <Button onClick={fetchTestCase} className="mt-4">
                    Try Again
                  </Button>
                </Card.Body>
              </Card>
            </div>
          )}

          {testCase && !loading && (
            <>
              {/* Test Case Header Info - Enhanced Apple Design */}
              <div className="px-8 py-6 border-b border-apple-gray-2/50 bg-gradient-to-b from-apple-gray-1/20 to-white">
                <div className="space-y-6">
                  {/* Title and Status Row */}
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-3xl font-sf-display font-bold text-apple-gray-8 tracking-tight leading-tight mb-2">
                        {testCase.title}
                      </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-apple-xl shadow-apple-sm ring-1 ring-apple-gray-2/50">
                        {getStatusIcon(testCase.status)}
                        <Badge variant={getStatusBadgeVariant(testCase.status)} size="sm" className="font-semibold">
                          {getStatusText(testCase.status)}
                        </Badge>
                      </div>
                      <Badge variant={getPriorityBadgeVariant(testCase.priority)} size="sm" className="px-3 py-2 font-semibold shadow-apple-sm">
                        {getPriorityText(testCase.priority)}
                      </Badge>
                      <Badge variant={getImportanceBadgeVariant(testCase.importance)} size="sm" className="px-3 py-2 font-semibold shadow-apple-sm">
                        {getImportanceText(testCase.importance)}
                      </Badge>
                    </div>
                  </div>

                </div>
              </div>

              {/* Tabs - Apple Segmented Control Style */}
              <div className="px-8 py-4 border-b border-apple-gray-2/50 bg-apple-gray-1/30">
                <div className="inline-flex items-center p-1 bg-apple-gray-2/50 rounded-apple-xl">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-apple-lg font-sf text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-apple-blue shadow-apple-sm ring-1 ring-apple-gray-2/30'
                          : 'text-apple-gray-6 hover:text-apple-gray-7 hover:bg-apple-gray-2/30'
                      }`}
                    >
                      <div className={`${activeTab === tab.id ? 'text-apple-blue' : 'text-apple-gray-5'}`}>
                        {tab.icon}
                      </div>
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8" data-element="testcase-detail-modal-content">
                {activeTab === 'overview' && (
                      <div className="space-y-6" data-element="testcase-modal-content-tab">
                        {/* Summary */}
                        <div data-element="testcase-modal-summary">
                          <div className="flex items-center gap-2 mb-3">
                            <Target className="w-5 h-5 text-apple-blue" />
                            <h3 className="text-lg font-sf font-semibold text-apple-gray-7">Test Case Summary</h3>
                            <p className="text-sm text-apple-gray-4">Overview and description of the test case</p>
                          </div>
                          <div className="prose prose-sm max-w-none">
                            {testCase.description ? (
                              <div dangerouslySetInnerHTML={{ __html: testCase.description }} />
                            ) : (
                              <p className="text-apple-gray-4 italic">No description available</p>
                            )}
                          </div>
                        </div>

                        {/* Preconditions */}
                        {testCase.prerequisites && (
                          <div data-element="testcase-modal-preconditions">
                            <div className="flex items-center gap-2 mb-3">
                              <CheckCircle className="w-5 h-5 text-apple-green" />
                              <h3 className="text-lg font-sf font-semibold text-apple-gray-7">Preconditions</h3>
                              <p className="text-sm text-apple-gray-4">Prerequisites that must be met before running this test</p>
                            </div>
                            <div className="prose prose-sm max-w-none p-4 bg-apple-gray-1/50 rounded-apple-lg border border-apple-gray-2">
                              <div dangerouslySetInnerHTML={{ __html: testCase.prerequisites }} />
                            </div>
                          </div>
                        )}

                        {/* Test Steps */}
                        <div data-element="testcase-modal-test-steps">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <List className="w-5 h-5 text-apple-blue" />
                              <h3 className="text-lg font-sf font-semibold text-apple-gray-7">Test Steps</h3>
                              <p className="text-sm text-apple-gray-4">Step-by-step instructions and expected results</p>
                            </div>
                            <Badge variant="outline" size="sm">
                              {testCase.steps?.length || 0} Steps
                            </Badge>
                          </div>

                          <div className="space-y-4">
                            {testCase.steps && testCase.steps.length > 0 ? (
                              testCase.steps.map((step, index) => (
                                <div key={index} className="border border-apple-gray-2 rounded-apple-lg p-4 hover:shadow-apple-sm transition-shadow">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-apple-blue/10 rounded-apple text-sm font-semibold text-apple-blue flex items-center justify-center">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                      <div>
                                        <h4 className="font-sf font-medium text-apple-gray-7 mb-1">Action</h4>
                                        <div className="prose prose-sm max-w-none text-apple-gray-6">
                                          {step.action ? (
                                            <div dangerouslySetInnerHTML={{ __html: step.action }} />
                                          ) : (
                                            <p className="italic">No action specified</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="border-t border-apple-gray-2 pt-3">
                                        <h4 className="font-sf font-medium text-apple-gray-7 mb-1">Expected Result</h4>
                                        <div className="prose prose-sm max-w-none text-apple-gray-6">
                                          {step.expected_result ? (
                                            <div dangerouslySetInnerHTML={{ __html: step.expected_result }} />
                                          ) : (
                                            <p className="italic">No expected result specified</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <List className="w-12 h-12 text-apple-gray-3 mx-auto mb-3" />
                                <p className="text-apple-gray-4">No test steps defined</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'details' && (
                      <div className="space-y-6" data-element="testcase-modal-metadata-tab">
                        {/* Meta Data */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-element="testcase-modal-metadata-grid">
                          <div data-element="testcase-modal-basic-info">
                            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">Basic Information</h3>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-sm font-medium text-apple-gray-5">Test Case ID</dt>
                                <dd className="text-sm text-apple-gray-7">#{testCase.id}</dd>
                              </div>
                              {testCase.external_id && (
                                <div>
                                  <dt className="text-sm font-medium text-apple-gray-5">External ID</dt>
                                  <dd className="text-sm text-apple-gray-7">{testCase.external_id}</dd>
                                </div>
                              )}
                              <div>
                                <dt className="text-sm font-medium text-apple-gray-5">Version</dt>
                                <dd className="text-sm text-apple-gray-7">v{testCase.version || 1}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-apple-gray-5">Created</dt>
                                <dd className="text-sm text-apple-gray-7">{formatDate(testCase.created_at)}</dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-apple-gray-5">Updated</dt>
                                <dd className="text-sm text-apple-gray-7">{formatDate(testCase.updated_at)}</dd>
                              </div>
                            </dl>
                          </div>

                          <div data-element="testcase-modal-test-properties">
                            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4">Test Properties</h3>
                            <dl className="space-y-3">
                              <div>
                                <dt className="text-sm font-medium text-apple-gray-5">Status</dt>
                                <dd>
                                  <Badge variant={getStatusBadgeVariant(testCase.status)} size="sm">
                                    {getStatusText(testCase.status)}
                                  </Badge>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-apple-gray-5">Priority</dt>
                                <dd>
                                  <Badge variant={getPriorityBadgeVariant(testCase.priority)} size="sm">
                                    {getPriorityText(testCase.priority)}
                                  </Badge>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-sm font-medium text-apple-gray-5">Importance</dt>
                                <dd>
                                  <Badge variant={getImportanceBadgeVariant(testCase.importance)} size="sm">
                                    {getImportanceText(testCase.importance)}
                                  </Badge>
                                </dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                      </div>
                    )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseDetailModal;