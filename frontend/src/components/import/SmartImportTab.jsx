import React, { useState, useRef, useCallback } from 'react';
import { Upload, FileText, Brain, CheckCircle, AlertCircle, Clock, Eye, Edit3, Trash2 } from 'lucide-react';
import { Button, Card, Badge, Input } from '../ui';
import { importAPI } from '../../services/api';
import { showSuccess, showError, showInfo } from '../../utils/toast';

const SmartImportTab = ({ projects, selectedProjectId, onImportComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const fileInputRef = useRef(null);

  const supportedFormats = [
    { ext: '.md', type: 'Markdown', desc: 'Markdown test plans' },
    { ext: '.txt', type: 'Plain Text', desc: 'Text-based test documents' },
    { ext: '.pdf', type: 'PDF', desc: 'PDF test specifications' },
    { ext: '.docx', type: 'Word Doc', desc: 'Microsoft Word documents' }
  ];

  // Handle drag and drop events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!selectedProjectId) {
      showError('Please select a project first');
      return;
    }

    // Validate file format
    const supportedExtensions = supportedFormats.map(f => f.ext);
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!supportedExtensions.includes(fileExtension)) {
      showError(`Unsupported file format. Please use: ${supportedExtensions.join(', ')}`);
      return;
    }

    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      showError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setProcessing(true);
    
    try {
      // Generate preview first
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', selectedProjectId);

      const response = await importAPI.smartImportPreview(formData);
      const previewData = response.data.data;
      
      if (previewData.testCases.length === 0) {
        showInfo('No test cases were detected in this document. Please ensure your document contains clear test scenarios with steps and expected results.');
        return;
      }

      setPreview(previewData);
      setShowPreview(true);
      showSuccess(`Generated ${previewData.testCases.length} test cases from ${file.name}`);
      
    } catch (error) {
      console.error('Smart import preview failed:', error);
      const errorMessage = error.response?.data?.details || error.message;
      showError(`Failed to process document: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleImportConfirm = async (strategy = 'update_existing') => {
    if (!selectedFile || !preview) {
      showError('No preview data available');
      return;
    }

    setProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', selectedProjectId);
      formData.append('strategy', strategy);

      const response = await importAPI.smartImport(formData);
      const result = response.data.data;
      
      showSuccess(`Successfully imported ${result.generatedCount} test cases!`);
      setShowPreview(false);
      setPreview(null);
      setSelectedFile(null);
      onImportComplete();
      
    } catch (error) {
      console.error('Smart import failed:', error);
      const errorMessage = error.response?.data?.details || error.message;
      showError(`Import failed: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleEditTestCase = (testCase, index) => {
    setEditingTestCase({ ...testCase, index });
  };

  const handleSaveEdit = () => {
    if (editingTestCase && preview) {
      const updatedTestCases = [...preview.testCases];
      updatedTestCases[editingTestCase.index] = { ...editingTestCase };
      setPreview({ ...preview, testCases: updatedTestCases });
      setEditingTestCase(null);
      showSuccess('Test case updated');
    }
  };

  const handleRemoveTestCase = (index) => {
    if (preview) {
      const updatedTestCases = preview.testCases.filter((_, i) => i !== index);
      setPreview({ ...preview, testCases: updatedTestCases });
      showSuccess('Test case removed');
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.6) return <AlertCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-all duration-200 ${
        dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
      }`}>
        <div 
          className="p-8 text-center"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Brain className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Smart Test Case Generation</h3>
          <p className="text-gray-600 mb-6">
            Upload test plan documents in any format. AI will extract and structure test cases automatically.
          </p>
          
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="mb-6"
          >
            {processing ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Choose Document
              </>
            )}
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats.map(f => f.ext).join(',')}
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          
          {/* Supported Formats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {supportedFormats.map((format) => (
              <div key={format.ext} className="text-center p-3 bg-gray-50 rounded-lg">
                <FileText className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                <div className="text-sm font-medium text-gray-700">{format.type}</div>
                <div className="text-xs text-gray-500">{format.ext}</div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-500">
            Maximum file size: 50MB • Drag and drop supported
          </div>
        </div>
      </Card>

      {/* Preview Section */}
      {showPreview && preview && (
        <PreviewSection 
          preview={preview}
          onConfirm={handleImportConfirm}
          onCancel={() => {
            setShowPreview(false);
            setPreview(null);
            setSelectedFile(null);
          }}
          onEdit={handleEditTestCase}
          onRemove={handleRemoveTestCase}
          processing={processing}
        />
      )}

      {/* Edit Modal */}
      {editingTestCase && (
        <EditTestCaseModal
          testCase={editingTestCase}
          onChange={setEditingTestCase}
          onSave={handleSaveEdit}
          onCancel={() => setEditingTestCase(null)}
        />
      )}
    </div>
  );
};

const PreviewSection = ({ preview, onConfirm, onCancel, onEdit, onRemove, processing }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('update_existing');

  const strategies = [
    { value: 'update_existing', label: 'Update Existing', desc: 'Update existing test cases with new data' },
    { value: 'create_new', label: 'Create New', desc: 'Create new test cases even if duplicates exist' },
    { value: 'skip_duplicates', label: 'Skip Duplicates', desc: 'Skip importing if test case already exists' }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Generated Test Cases Preview</h3>
          <p className="text-sm text-gray-600 mt-1">
            Review and edit the generated test cases before importing
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="success">
            {preview.testCases.length} test cases
          </Badge>
          {preview.statistics?.averageConfidence && (
            <Badge variant="outline">
              Avg. confidence: {Math.round(preview.statistics.averageConfidence * 100)}%
            </Badge>
          )}
        </div>
      </div>
      
      {/* Test Cases List */}
      <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
        {preview.testCases.map((testCase, index) => (
          <TestCasePreviewCard
            key={index}
            testCase={testCase}
            index={index}
            onEdit={() => onEdit(testCase, index)}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
      
      {/* Import Strategy Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Import Strategy
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {strategies.map((strategy) => (
            <label key={strategy.value} className="cursor-pointer">
              <input
                type="radio"
                name="strategy"
                value={strategy.value}
                checked={selectedStrategy === strategy.value}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="sr-only"
              />
              <div className={`p-3 border rounded-lg transition-colors ${
                selectedStrategy === strategy.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="font-medium text-sm">{strategy.label}</div>
                <div className="text-xs text-gray-500 mt-1">{strategy.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button 
          onClick={() => onConfirm(selectedStrategy)} 
          className="flex-1"
          disabled={processing}
        >
          {processing ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            'Import Test Cases'
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={processing}>
          Cancel
        </Button>
      </div>
    </Card>
  );
};

const TestCasePreviewCard = ({ testCase, index, onEdit, onRemove }) => {
  const [expanded, setExpanded] = useState(false);
  
  const confidence = testCase.confidence || 0.5;
  const confidenceColor = confidence >= 0.8 ? 'text-green-600 bg-green-100' : 
                         confidence >= 0.6 ? 'text-yellow-600 bg-yellow-100' : 
                         'text-red-600 bg-red-100';

  return (
    <div className="border rounded-lg bg-gray-50">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium text-gray-900">{testCase.title}</h4>
              <Badge className={`text-xs ${confidenceColor}`}>
                {Math.round(confidence * 100)}%
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{testCase.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>{testCase.steps?.length || 0} steps</span>
              <span>Priority: {testCase.priority}</span>
              <span>Type: {testCase.testType}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {testCase.preconditions && (
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700">Preconditions:</span>
                <p className="text-sm text-gray-600 mt-1">{testCase.preconditions}</p>
              </div>
            )}
            
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Test Steps:</span>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                {testCase.steps?.map((step, stepIndex) => (
                  <li key={stepIndex} className="text-sm text-gray-600">
                    <span className="font-medium">Action:</span> {step.action}
                    {step.expectedResult && (
                      <div className="ml-4 mt-1">
                        <span className="font-medium">Expected:</span> {step.expectedResult}
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </div>
            
            {testCase.tags && testCase.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {testCase.tags.map((tag, tagIndex) => (
                  <Badge key={tagIndex} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const EditTestCaseModal = ({ testCase, onChange, onSave, onCancel }) => {
  const handleStepChange = (stepIndex, field, value) => {
    const updatedSteps = [...testCase.steps];
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value };
    onChange({ ...testCase, steps: updatedSteps });
  };

  const addStep = () => {
    const newStep = {
      stepNumber: testCase.steps.length + 1,
      action: '',
      expectedResult: ''
    };
    onChange({ ...testCase, steps: [...testCase.steps, newStep] });
  };

  const removeStep = (stepIndex) => {
    const updatedSteps = testCase.steps.filter((_, index) => index !== stepIndex);
    onChange({ ...testCase, steps: updatedSteps });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Edit Test Case</h3>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                value={testCase.title}
                onChange={(e) => onChange({ ...testCase, title: e.target.value })}
                placeholder="Test case title"
              />
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                value={testCase.description}
                onChange={(e) => onChange({ ...testCase, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>
            
            {/* Preconditions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preconditions</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                value={testCase.preconditions}
                onChange={(e) => onChange({ ...testCase, preconditions: e.target.value })}
                placeholder="Prerequisites or setup requirements"
              />
            </div>
            
            {/* Priority and Test Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={testCase.priority}
                  onChange={(e) => onChange({ ...testCase, priority: e.target.value })}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={testCase.testType}
                  onChange={(e) => onChange({ ...testCase, testType: e.target.value })}
                >
                  <option value="functional">Functional</option>
                  <option value="integration">Integration</option>
                  <option value="regression">Regression</option>
                  <option value="performance">Performance</option>
                  <option value="security">Security</option>
                </select>
              </div>
            </div>
            
            {/* Test Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Test Steps</label>
                <Button variant="outline" size="sm" onClick={addStep}>
                  Add Step
                </Button>
              </div>
              
              <div className="space-y-3">
                {testCase.steps.map((step, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
                      {testCase.steps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStep(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Action</label>
                        <textarea
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          value={step.action}
                          onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                          placeholder="What action should be performed?"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Expected Result</label>
                        <textarea
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                          rows={2}
                          value={step.expectedResult}
                          onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                          placeholder="What should happen?"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t flex space-x-3">
          <Button onClick={onSave} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SmartImportTab;