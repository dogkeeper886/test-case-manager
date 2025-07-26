import React, { useState, useEffect, useRef } from 'react';
import { Check, X, ChevronDown } from 'lucide-react';
import { Button } from '../ui';

const InlineEditSelect = ({
  value = '',
  options = [],
  onSave,
  onCancel,
  placeholder = 'Select option...',
  className = '',
  disabled = false,
  required = false,
  autoFocus = true,
  dataTestId = 'inline-edit-select',
  getOptionLabel = (option) => option.label || option,
  getOptionValue = (option) => option.value || option
}) => {
  const [selectedValue, setSelectedValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && autoFocus && selectRef.current) {
      selectRef.current.focus();
    }
  }, [isEditing, autoFocus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStartEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setSelectedValue(value);
    setIsEditing(false);
    setIsOpen(false);
    setError('');
    onCancel?.();
  };

  const handleSave = async () => {
    // Validation
    if (required && !selectedValue) {
      setError('This field is required');
      return;
    }

    try {
      await onSave(selectedValue);
      setIsEditing(false);
      setIsOpen(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to save changes');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen) {
        handleSave();
      } else {
        setIsOpen(true);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (isOpen) {
        setIsOpen(false);
      } else {
        handleCancel();
      }
    }
  };

  const handleOptionSelect = (optionValue) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
  };

  const getSelectedLabel = () => {
    const selectedOption = options.find(option => getOptionValue(option) === selectedValue);
    return selectedOption ? getOptionLabel(selectedOption) : placeholder;
  };

  const getCurrentLabel = () => {
    const currentOption = options.find(option => getOptionValue(option) === value);
    return currentOption ? getOptionLabel(currentOption) : placeholder;
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
          {getCurrentLabel()}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`} data-testid={dataTestId} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <button
            ref={selectRef}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onKeyDown={handleKeyDown}
            className={`w-full px-3 py-2 text-sm font-sf border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue transition-all duration-200 ease-out text-left flex items-center justify-between ${
              error ? 'border-red-500 focus:ring-red-500/50' : ''
            }`}
            data-testid={`${dataTestId}-field`}
          >
            <span className={selectedValue ? 'text-apple-gray-7' : 'text-apple-gray-4'}>
              {getSelectedLabel()}
            </span>
            <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </button>
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-apple-gray-2 rounded-apple shadow-apple-lg z-50 max-h-48 overflow-y-auto">
              {options.map((option, index) => {
                const optionValue = getOptionValue(option);
                const optionLabel = getOptionLabel(option);
                const isSelected = optionValue === selectedValue;
                
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleOptionSelect(optionValue)}
                    className={`w-full px-3 py-2 text-sm font-sf text-left hover:bg-apple-gray-1 transition-colors duration-200 ${
                      isSelected ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-gray-7'
                    }`}
                    data-testid={`${dataTestId}-option-${optionValue}`}
                  >
                    {optionLabel}
                  </button>
                );
              })}
            </div>
          )}
          
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
    </div>
  );
};

export default InlineEditSelect; 