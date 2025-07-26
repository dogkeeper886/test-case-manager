import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../ui';

const InlineEditTextarea = ({
  value = '',
  onSave,
  onCancel,
  placeholder = 'Enter text...',
  className = '',
  disabled = false,
  required = false,
  maxLength,
  rows = 3,
  autoFocus = true,
  dataTestId = 'inline-edit-textarea',
  showPreview = true,
  previewLength = 100
}) => {
  const [textareaValue, setTextareaValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    setTextareaValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing, autoFocus]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setTextareaValue(value);
    setIsEditing(false);
    setError('');
    onCancel?.();
  };

  const handleSave = async () => {
    // Validation
    if (required && !textareaValue.trim()) {
      setError('This field is required');
      return;
    }

    if (maxLength && textareaValue.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
      return;
    }

    try {
      await onSave(textareaValue.trim());
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const getPreviewText = () => {
    if (!value) return placeholder;
    const text = value.replace(/<[^>]*>/g, ''); // Strip HTML tags
    return text.length > previewLength 
      ? text.substring(0, previewLength) + '...' 
      : text;
  };

  if (!isEditing) {
    return (
      <div
        className={`inline-block cursor-pointer hover:bg-apple-gray-1/50 rounded-apple px-2 py-1 transition-all duration-200 ease-out ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${className}`}
        onClick={handleStartEdit}
        data-testid={`${dataTestId}-display`}
      >
        <div className="font-sf text-sm text-apple-gray-7">
          {showPreview ? getPreviewText() : (value || placeholder)}
        </div>
        {showPreview && value && value.length > previewLength && (
          <div className="text-xs text-apple-gray-4 mt-1">
            Click to edit full content
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-block w-full ${className}`} data-testid={dataTestId}>
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={rows}
          className={`w-full px-3 py-2 text-sm font-sf border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200 ease-out resize-none ${
            error ? 'border-red-500 focus:ring-red-500/50' : ''
          }`}
          data-testid={`${dataTestId}-field`}
        />
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-apple-gray-4">
            {textareaValue.length}/{maxLength}
          </div>
        )}
        {error && (
          <div className="absolute -bottom-6 left-0 text-xs text-red-500 font-sf" data-testid={`${dataTestId}-error`}>
            {error}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-apple-gray-4 font-sf">
          Press Ctrl+Enter to save, Escape to cancel
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="p-1 h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
            data-testid={`${dataTestId}-save`}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            data-testid={`${dataTestId}-cancel`}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InlineEditTextarea; 