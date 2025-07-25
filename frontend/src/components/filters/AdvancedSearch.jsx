import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, History, Filter } from 'lucide-react';
import { Button, Input } from '../ui';

const AdvancedSearch = ({ 
  onSearch, 
  placeholder = "Search test cases...",
  className = '' 
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

  // Close dropdowns when clicking outside
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
    inputRef.current?.focus();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchField('all');
    setSearchOperator('AND');
    inputRef.current?.focus();
  };

  const getFieldLabel = (value) => {
    return searchFields.find(field => field.value === value)?.label || 'All Fields';
  };

  const getOperatorLabel = (value) => {
    return searchOperators.find(op => op.value === value)?.label || 'AND';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          className="w-full pr-20"
          onFocus={() => setShowHistory(true)}
        />
        
        {/* Search Controls */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Field Selector */}
          <div className="relative" ref={fieldRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFieldSelector(!showFieldSelector)}
              className="h-7 px-2 text-xs font-medium text-apple-gray-6 hover:text-apple-gray-7"
            >
              {getFieldLabel(searchField)}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            <AnimatePresence>
              {showFieldSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-1 w-40 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50"
                >
                  {searchFields.map((field) => (
                    <button
                      key={field.value}
                      onClick={() => {
                        setSearchField(field.value);
                        setShowFieldSelector(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm font-sf hover:bg-apple-gray-1 first:rounded-t-apple-lg last:rounded-b-apple-lg ${
                        searchField === field.value ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-gray-7'
                      }`}
                    >
                      {field.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Operator Selector */}
          <div className="relative" ref={operatorRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOperatorSelector(!showOperatorSelector)}
              className="h-7 px-2 text-xs font-medium text-apple-gray-6 hover:text-apple-gray-7"
            >
              {getOperatorLabel(searchOperator)}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            <AnimatePresence>
              {showOperatorSelector && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-48 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50"
                >
                  {searchOperators.map((operator) => (
                    <button
                      key={operator.value}
                      onClick={() => {
                        setSearchOperator(operator.value);
                        setShowOperatorSelector(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm font-sf hover:bg-apple-gray-1 first:rounded-t-apple-lg last:rounded-b-apple-lg ${
                        searchOperator === operator.value ? 'bg-apple-blue/10 text-apple-blue' : 'text-apple-gray-7'
                      }`}
                    >
                      <div className="font-medium">{operator.label}</div>
                      <div className="text-xs text-apple-gray-5">{operator.description}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Clear Button */}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-7 w-7 p-0 text-apple-gray-4 hover:text-apple-gray-6"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search History Dropdown */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div
            ref={historyRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-40"
          >
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-apple-gray-5">
                <History className="w-3 h-3" />
                Recent Searches
              </div>
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchHistoryClick(item)}
                  className="w-full px-2 py-2 text-left text-sm font-sf text-apple-gray-7 hover:bg-apple-gray-1 rounded-apple-md"
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Search Toggle */}
      <div className="mt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-apple-gray-5 hover:text-apple-gray-7"
        >
          <Filter className="w-3 h-3 mr-1" />
          Advanced Search
          <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {/* Advanced Search Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-3 p-4 bg-apple-gray-1/50 border border-apple-gray-2 rounded-apple-lg"
          >
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-apple-gray-7 mb-1">
                  Search Field
                </label>
                <select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                >
                  {searchFields.map((field) => (
                    <option key={field.value} value={field.value}>
                      {field.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-apple-gray-7 mb-1">
                  Search Operator
                </label>
                <select
                  value={searchOperator}
                  onChange={(e) => setSearchOperator(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                >
                  {searchOperators.map((operator) => (
                    <option key={operator.value} value={operator.value}>
                      {operator.label} - {operator.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-xs text-apple-gray-5">
                <p><strong>Search Tips:</strong></p>
                <ul className="mt-1 space-y-1">
                  <li>• Use quotes for exact phrases: "user login"</li>
                  <li>• Use wildcards: test* for test, testing, etc.</li>
                  <li>• Use AND/OR/NOT operators for complex queries</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch; 