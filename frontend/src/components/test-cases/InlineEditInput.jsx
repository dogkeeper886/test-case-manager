import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '../ui';

const InlineEditInput = ({
  value = '',
  onSave,
  onCancel,
  placeholder = 'Enter value...',
  className = '',
  disabled = false,
  required = false,
  maxLength,
  autoFocus = true,
  dataTestId = 'inline-edit-input'
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && autoFocus && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing, autoFocus]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setInputValue(value);
    setIsEditing(false);
    setError('');
    onCancel?.();
  };

  const handleSave = async () => {
    // Validation
    if (required && !inputValue.trim()) {
      setError('This field is required');
      return;
    }

    if (maxLength && inputValue.length > maxLength) {
      setError(`Maximum ${maxLength} characters allowed`);
      return;
    }

    try {
      await onSave(inputValue.trim());
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Small delay to allow button clicks to register
    setTimeout(() => {
      if (isEditing) {
        handleCancel();
      }
    }, 100);
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
        <span className="font-sf text-sm text-apple-gray-7">
          {value || placeholder}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} data-testid={dataTestId}>
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-3 py-2 text-sm font-sf border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200 ease-out ${
            error ? 'border-red-500 focus:ring-red-500/50' : ''
          }`}
          data-testid={`${dataTestId}-field`}
        />
        {error && (
          <div className="absolute -bottom-6 left-0 text-xs text-red-500 font-sf" data-testid={`${dataTestId}-error`}>
            {error}
          </div>
        )}
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
  );
};

export default InlineEditInput; 