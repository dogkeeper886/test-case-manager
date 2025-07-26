import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  BookOpen, 
  AlertCircle, 
  List, 
  Target, 
  Settings, 
  Hash, 
  Tag, 
  Layers,
  Calendar,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { Button, Card, Badge, Input, RichTextEditor } from '../ui';

const TestCaseEditForm = React.memo(forwardRef(({ 
  testCase = null, 
  onSave, 
  onCancel, 
  loading = false,
  className = '',
  projects = [],
  testSuites = []
}, ref) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prerequisites: '',
    priority: 2,
    importance: 2,
    execution_type: 1,
    project_id: null,
    test_suite_id: null,
    external_id: '',
    internal_id: '',
    version: '',
    steps: []
  });
  const [errors, setErrors] = useState({});

  // Expose handleSave function to parent component
  useImperativeHandle(ref, () => ({
    handleSave
  }));

  // Initialize form data when testCase changes
  useEffect(() => {
    if (testCase) {
      setFormData({
        title: testCase.title || '',
        description: testCase.description || '',
        prerequisites: testCase.prerequisites || '',
        priority: testCase.priority || 2,
        importance: testCase.importance || 2,
        execution_type: testCase.execution_type || 1,
        project_id: testCase.project_id || null,
        test_suite_id: testCase.test_suite_id || null,
        external_id: testCase.external_id || '',
        internal_id: testCase.internal_id || '',
        version: testCase.version || '',
        steps: testCase.steps || []
      });
      setErrors({});
    }
  }, [testCase]);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  const handleStepChange = useCallback((index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  }, [formData.steps]);

  const addStep = useCallback(() => {
    const newStep = {
      step_number: formData.steps.length + 1,
      action: '',
      expected_result: '',
      execution_type: 1
    };
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }));
  }, [formData.steps.length]);

  const removeStep = useCallback((index) => {
    const newSteps = formData.steps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({
      ...step,
      step_number: i + 1
    }));
    setFormData(prev => ({
      ...prev,
      steps: renumberedSteps
    }));
  }, [formData.steps]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.steps.length === 0) {
      newErrors.steps = 'At least one test step is required';
    } else {
      formData.steps.forEach((step, index) => {
        if (!step.action.trim()) {
          newErrors[`step_${index}_action`] = 'Action is required';
        }
        if (!step.expected_result.trim()) {
          newErrors[`step_${index}_expected`] = 'Expected result is required';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving test case:', error);
    }
  }, [formData, validateForm, onSave]);

  const getPriorityText = useCallback((priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Medium';
    }
  }, []);

  const getImportanceText = useCallback((importance) => {
    switch (importance) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      default: return 'Medium';
    }
  }, []);

  const getPriorityBadgeVariant = useCallback((priority) => {
    switch (priority) {
      case 1: return 'error';
      case 2: return 'warning';
      case 3: return 'success';
      default: return 'warning';
    }
  }, []);

  const getImportanceBadgeVariant = useCallback((importance) => {
    switch (importance) {
      case 1: return 'default';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'warning';
    }
  }, []);

  const getExecutionTypeText = useCallback((executionType) => {
    switch (executionType) {
      case 1: return 'Manual';
      case 2: return 'Automated';
      default: return 'Manual';
    }
  }, []);

  const handleSuiteSelect = useCallback((suiteId) => {
    setFormData(prev => ({
      ...prev,
      test_suite_id: suiteId
    }));
  }, []);

  const handleTestCaseSelect = useCallback((testCaseId) => {
    // Handle test case selection if needed
  }, []);

  const handleLayoutSearch = useCallback((query) => {
    // Handle layout search if needed
  }, []);

  return (
    <div className={`space-y-8 ${className}`} data-element="test-case-edit-form">
      {/* Enhanced Header Section */}
      <div className="bg-white rounded-apple-lg shadow-apple-sm border border-apple-gray-2 p-6" data-element="test-case-edit-header">
        <div className="flex items-center gap-4 mb-4" data-element="test-case-edit-header-top">
          <div className="w-12 h-12 bg-apple-blue/10 rounded-full flex items-center justify-center" data-element="test-case-edit-header-icon">
            <FileText className="w-6 h-6 text-apple-blue" />
          </div>
          <div className="flex-1" data-element="test-case-edit-header-content">
            <h2 className="text-2xl font-sf font-bold text-apple-gray-7 mb-1" data-element="test-case-edit-title">
              {testCase ? 'Edit Test Case' : 'Create New Test Case'}
            </h2>
            <p className="text-apple-gray-5" data-element="test-case-edit-subtitle">
              {testCase ? `Editing: ${testCase.title}` : 'Fill in the details below to create a new test case'}
            </p>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-4" data-element="test-case-edit-status">
          <div className="flex items-center gap-2" data-element="test-case-edit-priority">
            <span className="text-sm font-medium text-apple-gray-6">Priority:</span>
            <Badge 
              variant={getPriorityBadgeVariant(formData.priority)} 
              size="sm"
              className="font-semibold"
            >
              {getPriorityText(formData.priority)}
            </Badge>
          </div>
          <div className="flex items-center gap-2" data-element="test-case-edit-importance">
            <span className="text-sm font-medium text-apple-gray-6">Importance:</span>
            <Badge 
              variant={getImportanceBadgeVariant(formData.importance)} 
              size="sm"
              className="font-semibold"
            >
              {getImportanceText(formData.importance)}
            </Badge>
          </div>
          <div className="flex items-center gap-2" data-element="test-case-edit-execution">
            <span className="text-sm font-medium text-apple-gray-6">Execution:</span>
            <Badge 
              variant={formData.execution_type === 1 ? 'default' : 'success'} 
              size="sm"
              className="font-semibold"
            >
              {getExecutionTypeText(formData.execution_type)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Basic Information Section */}
      <Card elevation="lg" className="border-l-4 border-l-apple-blue" data-element="test-case-basic-info-card">
        <Card.Header>
          <div className="flex items-center gap-3" data-element="test-case-basic-info-header">
            <div className="w-10 h-10 bg-apple-blue/10 rounded-full flex items-center justify-center" data-element="test-case-basic-info-icon">
              <BookOpen className="w-5 h-5 text-apple-blue" />
            </div>
            <div>
              <h3 className="text-xl font-sf font-bold text-apple-gray-7" data-element="test-case-basic-info-title">
                Basic Information
              </h3>
              <p className="text-sm text-apple-gray-5" data-element="test-case-basic-info-subtitle">
                Core details and metadata for the test case
              </p>
            </div>
          </div>
        </Card.Header>
        <Card.Body data-element="test-case-basic-info-content">
          <div className="space-y-6" data-element="test-case-basic-info-fields">
            {/* Title Field */}
            <div data-element="test-case-title-field">
              <Input
                label="Test Case Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                placeholder="Enter a descriptive title for the test case"
                required
                className="text-lg font-semibold"
              />
            </div>

            {/* Description Field - Enhanced Rich Text Editor */}
            <div data-element="test-case-description-field">
              <RichTextEditor
                key="test-case-description"
                label="Test Case Summary"
                value={formData.description}
                onChange={(value) => handleInputChange('description', value)}
                placeholder="Provide a comprehensive description of what this test case covers..."
                maxHeight="200px"
                showPreview={true}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1" data-element="test-case-description-error">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Prerequisites Field */}
            <div data-element="test-case-prerequisites-field">
              <RichTextEditor
                key="test-case-prerequisites"
                label="Prerequisites"
                value={formData.prerequisites}
                onChange={(value) => handleInputChange('prerequisites', value)}
                placeholder="List any requirements or conditions that must be met before executing this test..."
                maxHeight="150px"
                showPreview={true}
              />
            </div>

            {/* Configuration Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-element="test-case-config-fields">
              {/* Priority and Importance */}
              <div className="space-y-4" data-element="test-case-priority-importance">
                <div data-element="test-case-priority-field">
                  <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200"
                  >
                    <option value={1}>High Priority</option>
                    <option value={2}>Medium Priority</option>
                    <option value={3}>Low Priority</option>
                  </select>
                </div>

                <div data-element="test-case-importance-field">
                  <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Importance Level
                  </label>
                  <select
                    value={formData.importance}
                    onChange={(e) => handleInputChange('importance', parseInt(e.target.value))}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200"
                  >
                    <option value={1}>Low Importance</option>
                    <option value={2}>Medium Importance</option>
                    <option value={3}>High Importance</option>
                  </select>
                </div>
              </div>

              {/* Execution Type and Project */}
              <div className="space-y-4" data-element="test-case-execution-project">
                <div data-element="test-case-execution-field">
                  <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-apple-blue" />
                    Execution Type
                  </label>
                  <select
                    value={formData.execution_type}
                    onChange={(e) => handleInputChange('execution_type', parseInt(e.target.value))}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200"
                  >
                    <option value={1}>Manual Execution</option>
                    <option value={2}>Automated Execution</option>
                  </select>
                </div>

                <div data-element="test-case-project-field">
                  <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-apple-gray-5" />
                    Project
                  </label>
                  <select
                    value={formData.project_id || ''}
                    onChange={(e) => handleInputChange('project_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200"
                  >
                    <option value="">Select a Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Test Suite and Version */}
              <div className="space-y-4" data-element="test-case-suite-version">
                <div data-element="test-case-suite-field">
                  <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-apple-gray-5" />
                    Test Suite
                  </label>
                  <select
                    value={formData.test_suite_id || ''}
                    onChange={(e) => handleInputChange('test_suite_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200"
                  >
                    <option value="">Select a Test Suite</option>
                    {testSuites.map(suite => (
                      <option key={suite.id} value={suite.id}>
                        {suite.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div data-element="test-case-version-field">
                  <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-apple-gray-5" />
                    Version
                  </label>
                  <Input
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    placeholder="e.g., 1.0, 2.1"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            {/* ID Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-element="test-case-id-fields">
              <div data-element="test-case-external-id-field">
                <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-apple-gray-5" />
                  External ID
                </label>
                <Input
                  value={formData.external_id}
                  onChange={(e) => handleInputChange('external_id', e.target.value)}
                  placeholder="External reference ID"
                  className="font-mono"
                />
              </div>
              <div data-element="test-case-internal-id-field">
                <label className="block text-sm font-semibold text-apple-gray-7 mb-2 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-apple-gray-5" />
                  Internal ID
                </label>
                <Input
                  value={formData.internal_id}
                  onChange={(e) => handleInputChange('internal_id', e.target.value)}
                  placeholder="Internal reference ID"
                  className="font-mono"
                />
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Enhanced Test Steps Section */}
      <Card elevation="lg" className="border-l-4 border-l-success" data-element="test-case-steps-card">
        <Card.Header>
          <div className="flex items-center justify-between" data-element="test-case-steps-header">
            <div className="flex items-center gap-3" data-element="test-case-steps-header-left">
              <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center" data-element="test-case-steps-icon">
                <List className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="text-xl font-sf font-bold text-apple-gray-7" data-element="test-case-steps-title">
                  Test Steps
                </h3>
                <p className="text-sm text-apple-gray-5" data-element="test-case-steps-subtitle">
                  Define the step-by-step actions and expected results
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3" data-element="test-case-steps-header-right">
              <Badge variant="default" size="lg" className="font-semibold" data-element="test-case-steps-count">
                {formData.steps.length} Steps
              </Badge>
              <Button
                variant="secondary"
                icon={<Plus className="w-4 h-4" />}
                onClick={addStep}
                size="sm"
                className="bg-success text-white hover:bg-success/90"
                data-element="test-case-add-step-button"
              >
                Add Step
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body data-element="test-case-steps-content">
          {errors.steps && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-apple" data-element="test-case-steps-error">
              <p className="text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.steps}
              </p>
            </div>
          )}

          {formData.steps.length === 0 ? (
            <div className="text-center py-12" data-element="test-case-no-steps">
              <div className="w-20 h-20 bg-apple-gray-2 rounded-full flex items-center justify-center mx-auto mb-6" data-element="test-case-no-steps-icon">
                <List className="w-10 h-10 text-apple-gray-4" />
              </div>
              <h3 className="text-xl font-sf font-bold text-apple-gray-6 mb-3" data-element="test-case-no-steps-title">
                No test steps defined
              </h3>
              <p className="text-apple-gray-5 max-w-md mx-auto mb-6" data-element="test-case-no-steps-description">
                Add test steps to define the actions and expected results for this test case.
              </p>
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={addStep}
                data-element="test-case-add-first-step-button"
              >
                Add Your First Step
              </Button>
            </div>
          ) : (
            <div className="space-y-6" data-element="test-case-steps-list">
              {formData.steps.map((step, index) => (
                <div 
                  key={index}
                  className="bg-white border border-apple-gray-2 rounded-apple-lg p-6 hover:border-apple-gray-3 hover:shadow-apple-sm transition-all duration-200"
                  data-element={`test-case-step-${index + 1}`}
                >
                  <div className="flex items-center justify-between mb-6" data-element={`test-case-step-header-${index + 1}`}>
                    <div className="flex items-center gap-4" data-element={`test-case-step-info-${index + 1}`}>
                      <div className="w-12 h-12 bg-apple-blue text-white rounded-full flex items-center justify-center text-sm font-bold shadow-apple-sm" data-element={`test-case-step-number-${index + 1}`}>
                        {step.step_number}
                      </div>
                      <div data-element={`test-case-step-title-${index + 1}`}>
                        <h4 className="font-bold text-apple-gray-7 text-lg" data-element={`test-case-step-title-text-${index + 1}`}>
                          Step {step.step_number}
                        </h4>
                        <p className="text-sm text-apple-gray-5" data-element={`test-case-step-subtitle-${index + 1}`}>
                          Define the action and expected result
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      size="sm"
                      data-element={`test-case-step-remove-${index + 1}`}
                    >
                      Remove Step
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-element={`test-case-step-content-${index + 1}`}>
                    <div data-element={`test-case-step-action-${index + 1}`}>
                      <RichTextEditor
                        key={`step-${index}-action`}
                        label="Action"
                        value={step.action}
                        onChange={(value) => handleStepChange(index, 'action', value)}
                        placeholder="Describe the action to perform in this step..."
                        maxHeight="150px"
                        showPreview={true}
                      />
                      {errors[`step_${index}_action`] && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1" data-element={`test-case-step-action-error-${index + 1}`}>
                          <AlertCircle className="w-4 h-4" />
                          {errors[`step_${index}_action`]}
                        </p>
                      )}
                    </div>

                    <div data-element={`test-case-step-expected-${index + 1}`}>
                      <RichTextEditor
                        key={`step-${index}-expected`}
                        label="Expected Result"
                        value={step.expected_result}
                        onChange={(value) => handleStepChange(index, 'expected_result', value)}
                        placeholder="Describe what should happen when this step is executed..."
                        maxHeight="150px"
                        showPreview={true}
                      />
                      {errors[`step_${index}_expected`] && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1" data-element={`test-case-step-expected-error-${index + 1}`}>
                          <AlertCircle className="w-4 h-4" />
                          {errors[`step_${index}_expected`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}));

export default TestCaseEditForm; 