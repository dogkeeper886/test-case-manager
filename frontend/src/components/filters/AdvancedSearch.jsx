import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, History, Filter } from 'lucide-react';
import { Button, Input } from '../ui';

const AdvancedSearch = ({ 
  onSearch, 
  placeholder = "Search test cases...",
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [searchOperator, setSearchOperator] = useState('AND');
  const [showHistory, setShowHistory] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [showOperatorSelector, setShowOperatorSelector] = useState(false);
  
  const inputRef = useRef(null);
  const historyRef = useRef(null);
  const fieldRef = useRef(null);
  const operatorRef = useRef(null);

  // Mock search history - in real app this would come from the store
  const searchHistory = [
    'login functionality',
    'user registration',
    'password reset',
    'email validation',
    'API endpoints'
  ];

  const searchFields = [
    { value: 'all', label: 'All Fields' },
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'id', label: 'ID' },
    { value: 'tags', label: 'Tags' }
  ];

  const searchOperators = [
    { value: 'AND', label: 'AND', description: 'All terms must match' },
    { value: 'OR', label: 'OR', description: 'Any term can match' },
    { value: 'NOT', label: 'NOT', description: 'Exclude matching terms' }
  ];

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch({
          query: searchQuery,
          field: searchField,
          operator: searchOperator
        });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchField, searchOperator, onSearch]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistory(false);
      }
      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        setShowFieldSelector(false);
      }
      if (operatorRef.current && !operatorRef.current.contains(event.target)) {
        setShowOperatorSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchHistoryClick = (historyItem) => {
    setSearchQuery(historyItem);
    setShowHistory(false);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchField('all');
    setSearchOperator('AND');
  };

  const getFieldLabel = (value) => {
    const field = searchFields.find(f => f.value === value);
    return field ? field.label : 'All Fields';
  };

  const getOperatorLabel = (value) => {
    const operator = searchOperators.find(o => o.value === value);
    return operator ? operator.label : 'AND';
  };

  return (
    <div className={`relative ${className}`} data-testid="advanced-search-container" {...props}>
      {/* Main Search Input */}
      <div className="relative" data-testid="search-input-container">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="w-full pr-20"
          onFocus={() => setShowHistory(true)}
          data-testid="search-input"
        />
        
        {/* Search Controls */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1" data-testid="search-controls">
          {/* Field Selector */}
          <div className="relative" ref={fieldRef} data-testid="field-selector-container">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFieldSelector(!showFieldSelector)}
              className="h-7 px-2 text-xs font-medium text-apple-gray-6 hover:text-apple-gray-7 hover:bg-apple-gray-2 transition-all duration-200"
              data-testid="field-selector-button"
            >
              {getFieldLabel(searchField)}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            <div 
              className={`absolute top-full left-0 mt-1 w-40 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50 transition-all duration-200 ${
                showFieldSelector ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
              data-testid="field-selector-dropdown"
            >
              {searchFields.map((field) => (
                <button
                  key={field.value}
                  onClick={() => {
                    setSearchField(field.value);
                    setShowFieldSelector(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm font-sf hover:bg-apple-gray-1 first:rounded-t-apple-lg last:rounded-b-apple-lg transition-colors duration-200 ${
                    searchField === field.value ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-gray-7'
                  }`}
                  data-testid={`field-option-${field.value}`}
                >
                  {field.label}
                </button>
              ))}
            </div>
          </div>

          {/* Operator Selector */}
          <div className="relative" ref={operatorRef} data-testid="operator-selector-container">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOperatorSelector(!showOperatorSelector)}
              className="h-7 px-2 text-xs font-medium text-apple-gray-6 hover:text-apple-gray-7 hover:bg-apple-gray-2 transition-all duration-200"
              data-testid="operator-selector-button"
            >
              {getOperatorLabel(searchOperator)}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            <div 
              className={`absolute top-full right-0 mt-1 w-48 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50 transition-all duration-200 ${
                showOperatorSelector ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
              data-testid="operator-selector-dropdown"
            >
              {searchOperators.map((operator) => (
                <button
                  key={operator.value}
                  onClick={() => {
                    setSearchOperator(operator.value);
                    setShowOperatorSelector(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm font-sf hover:bg-apple-gray-1 first:rounded-t-apple-lg last:rounded-b-apple-lg transition-colors duration-200 ${
                    searchOperator === operator.value ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-gray-7'
                  }`}
                  data-testid={`operator-option-${operator.value}`}
                >
                  <div className="font-medium">{operator.label}</div>
                  <div className="text-xs text-apple-gray-5">{operator.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Button */}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-7 w-7 p-0 text-apple-gray-4 hover:text-apple-gray-6 hover:bg-apple-gray-2 transition-all duration-200"
              data-testid="clear-search-button"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search History */}
      <div 
        ref={historyRef}
        className={`absolute top-full left-0 right-0 mt-1 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50 transition-all duration-200 ${
          showHistory && searchHistory.length > 0 ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
        data-testid="search-history-dropdown"
      >
        <div className="p-2 border-b border-apple-gray-1">
          <div className="flex items-center gap-2 text-xs font-medium text-apple-gray-5">
            <History className="w-3 h-3" />
            Recent Searches
          </div>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {searchHistory.map((historyItem, index) => (
            <button
              key={index}
              onClick={() => handleSearchHistoryClick(historyItem)}
              className="w-full px-3 py-2 text-left text-sm font-sf text-apple-gray-7 hover:bg-apple-gray-1 transition-colors duration-200"
              data-testid={`search-history-item-${index}`}
            >
              {historyItem}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Search Toggle */}
      <div className="mt-2" data-testid="advanced-search-toggle">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-apple-gray-5 hover:text-apple-gray-7 hover:bg-apple-gray-2 transition-all duration-200"
          data-testid="advanced-search-toggle-button"
        >
          <Filter className="w-3 h-3 mr-1" />
          Advanced Search
          <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Advanced Search Panel */}
      <div 
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
        data-testid="advanced-search-panel"
      >
        <div className="p-4 bg-apple-gray-1/50 border border-apple-gray-2 rounded-apple-lg" data-testid="advanced-search-content">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-sf font-semibold text-apple-gray-7 mb-2" data-testid="advanced-search-title">
                Search Options
              </h4>
              <p className="text-xs text-apple-gray-5" data-testid="advanced-search-description">
                Use advanced search operators to refine your search results.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="advanced-search-options">
              <div>
                <label className="block text-xs font-medium text-apple-gray-6 mb-1" data-testid="search-field-label">
                  Search Field
                </label>
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue hover:border-apple-gray-3 transition-all duration-200 bg-white"
                  data-testid="search-field-select"
                >
                  {searchFields.map(field => (
                    <option key={field.value} value={field.value} data-testid={`search-field-option-${field.value}`}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-apple-gray-6 mb-1" data-testid="search-operator-label">
                  Search Operator
                </label>
                <select
                  value={searchOperator}
                  onChange={(e) => setSearchOperator(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue hover:border-apple-gray-3 transition-all duration-200 bg-white"
                  data-testid="search-operator-select"
                >
                  {searchOperators.map(operator => (
                    <option key={operator.value} value={operator.value} data-testid={`search-operator-option-${operator.value}`}>
                      {operator.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearch; 