import React, { useState, useEffect } from 'react';
import { Save, X, Plus, Trash2 } from 'lucide-react';
import { Button, Card, Badge, Input, HtmlEditor } from '../ui';

const TestCaseEditForm = ({
  testCase,
  onSave,
  onCancel,
  projects = [],
  testSuites = [],
  className = ''
}) => {
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
        steps: testCase.steps ? [...testCase.steps] : []
      });
    }
  }, [testCase]);

  const handleInputChange = (field, value) => {
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
  };

  const handleStepChange = (index, field, value) => {
    const newSteps = [...formData.steps];
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      steps: newSteps
    }));
  };

  const addStep = () => {
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
  };

  const removeStep = (index) => {
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
  };

  const validateForm = () => {
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
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving test case:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Medium';
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-sf font-semibold text-apple-gray-7">
          {testCase ? 'Edit Test Case' : 'Create Test Case'}
        </h2>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            icon={<X className="w-4 h-4" />}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={handleSave}
            loading={loading}
          >
            Save Test Case
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card elevation="sm">
        <Card.Header>
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
            Basic Information
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  error={errors.title}
                  placeholder="Enter test case title"
                  required
                />
              </div>

              <div>
                <HtmlEditor
                  label="Description"
                  value={formData.description}
                  onChange={(value) => handleInputChange('description', value)}
                  placeholder="Enter test case description..."
                  maxHeight="200px"
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              <div>
                <HtmlEditor
                  label="Prerequisites"
                  value={formData.prerequisites}
                  onChange={(value) => handleInputChange('prerequisites', value)}
                  placeholder="Enter prerequisites..."
                  maxHeight="150px"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                  >
                    <option value={1}>High</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Importance
                  </label>
                  <select
                    value={formData.importance}
                    onChange={(e) => handleInputChange('importance', parseInt(e.target.value))}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                  >
                    <option value={1}>Low</option>
                    <option value={2}>Medium</option>
                    <option value={3}>High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                  Execution Type
                </label>
                <select
                  value={formData.execution_type}
                  onChange={(e) => handleInputChange('execution_type', parseInt(e.target.value))}
                  className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                >
                  <option value={1}>Manual</option>
                  <option value={2}>Automated</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Project
                  </label>
                  <select
                    value={formData.project_id || ''}
                    onChange={(e) => handleInputChange('project_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-apple-gray-7 mb-2">
                    Test Suite
                  </label>
                  <select
                    value={formData.test_suite_id || ''}
                    onChange={(e) => handleInputChange('test_suite_id', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full p-3 border border-apple-gray-2 rounded-apple font-sf text-sm text-apple-gray-7 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                  >
                    <option value="">Select Test Suite</option>
                    {testSuites.map(suite => (
                      <option key={suite.id} value={suite.id}>
                        {suite.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Input
                    label="External ID"
                    value={formData.external_id}
                    onChange={(e) => handleInputChange('external_id', e.target.value)}
                    placeholder="External ID"
                  />
                </div>
                <div>
                  <Input
                    label="Internal ID"
                    value={formData.internal_id}
                    onChange={(e) => handleInputChange('internal_id', e.target.value)}
                    placeholder="Internal ID"
                  />
                </div>
                <div>
                  <Input
                    label="Version"
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    placeholder="1.0"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Test Steps */}
      <Card elevation="sm">
        <Card.Header>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
              Test Steps
            </h3>
            <Button
              variant="secondary"
              icon={<Plus className="w-4 h-4" />}
              onClick={addStep}
              size="sm"
            >
              Add Step
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {errors.steps && (
            <p className="text-red-600 text-sm mb-4">{errors.steps}</p>
          )}

          {formData.steps.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-apple-gray-5">No test steps defined. Click "Add Step" to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {formData.steps.map((step, index) => (
                <div 
                  key={index}
                  className="border border-apple-gray-2 rounded-apple p-6 bg-apple-gray-1/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-apple-blue text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {step.step_number}
                      </div>
                      <h4 className="font-medium text-apple-gray-7">
                        Step {step.step_number}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => removeStep(index)}
                      className="text-red-600 hover:text-red-700"
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <HtmlEditor
                        label="Action"
                        value={step.action}
                        onChange={(value) => handleStepChange(index, 'action', value)}
                        placeholder="Enter the action to perform..."
                        maxHeight="150px"
                      />
                      {errors[`step_${index}_action`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`step_${index}_action`]}</p>
                      )}
                    </div>

                    <div>
                      <HtmlEditor
                        label="Expected Result"
                        value={step.expected_result}
                        onChange={(value) => handleStepChange(index, 'expected_result', value)}
                        placeholder="Enter the expected result..."
                        maxHeight="150px"
                      />
                      {errors[`step_${index}_expected`] && (
                        <p className="text-red-600 text-sm mt-1">{errors[`step_${index}_expected`]}</p>
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
};

export default TestCaseEditForm; 