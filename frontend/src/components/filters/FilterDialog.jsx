import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Save, Bookmark, ChevronDown } from 'lucide-react';
import { Button, Card } from '../ui';
import AdvancedSearch from './AdvancedSearch';
import DateRangePicker from './DateRangePicker';
import FilterChip from './FilterChip';
import FilterPresetManager from './FilterPresetManager';
import QuickPresetSelector from './QuickPresetSelector';

const FilterDialog = ({
  isVisible = false,
  onClose,
  filters = {},
  onFilterChange,
  onClearFilters,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  onApplyPreset,
  savedPresets = [],
  projects = [],
  testSuites = [],
  className = ''
}) => {
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    basic: true,
    dates: true,
    advanced: false
  });
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showSuiteDropdown, setShowSuiteDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  
  const projectDropdownRef = useRef(null);
  const suiteDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);
  const priorityDropdownRef = useRef(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close dropdowns
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target)) {
        setShowProjectDropdown(false);
      }
      if (suiteDropdownRef.current && !suiteDropdownRef.current.contains(event.target)) {
        setShowSuiteDropdown(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setShowStatusDropdown(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(event.target)) {
        setShowPriorityDropdown(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible]);

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isVisible) {
        handleCloseDialog();
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isVisible]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearchChange = (searchData) => {
    onFilterChange('search', searchData);
  };

  const handleDateChange = (type, startDate, endDate, enabled = true) => {
    onFilterChange('dates', { type, startDate, endDate, enabled });
  };

  const handleBasicFilterChange = (filterType, value) => {
    onFilterChange('basic', { [filterType]: value });
  };

  const handleRemoveFilter = (filterType, value) => {
    onFilterChange('remove', { filterType, value });
  };

  const handleCloseDialog = () => {
    // Close all dropdowns
    setShowProjectDropdown(false);
    setShowSuiteDropdown(false);
    setShowStatusDropdown(false);
    setShowPriorityDropdown(false);
    setShowPresetManager(false);
    
    // Close dialog
    onClose();
  };

  const getActiveFilters = () => {
    const activeFilters = [];
    
    // Search filters
    if (filters.search?.query) {
      activeFilters.push({
        type: 'search',
        label: `Search: "${filters.search.query}"`,
        value: filters.search.query,
        onRemove: () => handleRemoveFilter('search', 'query')
      });
    }
    
    // Basic filters
    if (filters.project) {
      activeFilters.push({
        type: 'project',
        label: `Project: ${filters.project}`,
        value: filters.project,
        onRemove: () => handleRemoveFilter('project', filters.project)
      });
    }
    
    if (filters.suite) {
      activeFilters.push({
        type: 'suite',
        label: `Test Suite: ${filters.suite}`,
        value: filters.suite,
        onRemove: () => handleRemoveFilter('suite', filters.suite)
      });
    }
    
    if (filters.status) {
      activeFilters.push({
        type: 'status',
        label: `Status: ${filters.status}`,
        value: filters.status,
        onRemove: () => handleRemoveFilter('status', filters.status)
      });
    }
    
    if (filters.priority) {
      activeFilters.push({
        type: 'priority',
        label: `Priority: ${filters.priority}`,
        value: filters.priority,
        onRemove: () => handleRemoveFilter('priority', filters.priority)
      });
    }
    
    // Date filters
    Object.entries(filters.dates || {}).forEach(([type, dateFilter]) => {
      if (dateFilter.enabled && (dateFilter.start || dateFilter.end)) {
        const startDate = dateFilter.start ? new Date(dateFilter.start).toLocaleDateString() : '';
        const endDate = dateFilter.end ? new Date(dateFilter.end).toLocaleDateString() : '';
        const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate;
        
        activeFilters.push({
          type: 'date',
          label: `${type.charAt(0).toUpperCase() + type.slice(1)}: ${dateRange}`,
          value: dateFilter,
          onRemove: () => handleRemoveFilter('dates', type)
        });
      }
    });
    
    return activeFilters;
  };

  const CustomDropdown = ({ 
    label, 
    value, 
    options, 
    onChange, 
    placeholder = "Select option...",
    isOpen,
    onToggle,
    dataTestId
  }) => {
    const selectedOption = options.find(option => option.value === value);
    const dropdownRef = useRef(null);
    
    // Check if dropdown should open upward
    const [openUpward, setOpenUpward] = useState(false);
    
    useEffect(() => {
      if (isOpen && dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const dropdownHeight = Math.min(options.length * 48, 240); // 48px per option, max 240px
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        setOpenUpward(spaceBelow < dropdownHeight && spaceAbove > dropdownHeight);
      }
    }, [isOpen, options.length]);
    
    return (
      <div className="space-y-2">
        <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid={`${dataTestId}-label`}>
          {label}
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={onToggle}
            className="w-full px-4 py-3 text-sm font-sf border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue hover:border-apple-gray-3 transition-[border-color,box-shadow] duration-200 bg-white text-left flex items-center justify-between"
            data-testid={`${dataTestId}-button`}
          >
            <span className={selectedOption ? 'text-apple-gray-7' : 'text-apple-gray-4'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown 
              className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            />
          </button>
          
          <div 
            className={`absolute left-0 right-0 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-[100] max-h-60 overflow-y-auto transition-[opacity,transform] duration-200 ${
              openUpward 
                ? 'bottom-full mb-1' 
                : 'top-full mt-1'
            } ${
              isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
            }`}
            data-testid={`${dataTestId}-dropdown`}
          >
            {options.map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                onClick={() => {
                  onChange(option.value);
                  onToggle();
                }}
                className={`w-full px-4 py-3 text-left text-sm font-sf first:rounded-t-apple-lg last:rounded-b-apple-lg transition-colors duration-150 ${
                  value === option.value 
                    ? 'bg-apple-blue/10 text-apple-blue hover:bg-apple-blue/15' 
                    : 'text-apple-gray-7 hover:bg-apple-gray-1'
                }`}
                data-testid={`${dataTestId}-option-${option.value}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  const activeFilters = getActiveFilters();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`bg-white rounded-apple-xl shadow-apple-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-apple-gray-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-apple-blue/10 rounded-full flex items-center justify-center">
              <Filter className="w-4 h-4 text-apple-blue" />
            </div>
            <div>
              <h2 className="text-lg font-sf font-semibold text-apple-gray-7">
                Advanced Filters
              </h2>
              <p className="text-sm text-apple-gray-5">Refine your test case search</p>
            </div>
            {activeFilters.length > 0 && (
              <div className="ml-3 px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-sm font-semibold">
                {activeFilters.length}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseDialog}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="mb-6 p-4 bg-apple-gray-1/50 rounded-apple-lg border border-apple-gray-2/50">
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter, index) => (
                  <FilterChip
                    key={`${filter.type}-${index}`}
                    label={filter.label}
                    onRemove={filter.onRemove}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Filter Sections */}
          <div className="space-y-6" data-testid="filter-sections">
            {/* Search Section */}
            <div data-testid="search-section">
              <button
                onClick={() => toggleSection('search')}
                className="w-full flex items-center justify-between p-4 bg-apple-gray-1/30 rounded-apple-lg hover:bg-apple-gray-1/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center">
                    <Filter className="w-3 h-3 text-apple-blue" />
                  </div>
                  <h3 className="text-sm font-sf font-semibold text-apple-gray-7">Search</h3>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.search ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
                  expandedSections.search ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                data-testid="search-content"
              >
                <div className="pt-4" data-testid="search-inner">
                                  <AdvancedSearch
                  searchData={filters.search || {}}
                  onChange={handleSearchChange}
                />
                </div>
              </div>
            </div>

            {/* Basic Filters Section */}
            <div data-testid="basic-filters-section">
              <button
                onClick={() => toggleSection('basic')}
                className="w-full flex items-center justify-between p-4 bg-apple-gray-1/30 rounded-apple-lg hover:bg-apple-gray-1/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center">
                    <Filter className="w-3 h-3 text-apple-blue" />
                  </div>
                  <h3 className="text-sm font-sf font-semibold text-apple-gray-7">Basic Filters</h3>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.basic ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
                  expandedSections.basic ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                data-testid="basic-filters-content"
              >
                <div className="pt-4 space-y-4" data-testid="basic-filters-inner">
                  <CustomDropdown
                    label="Project"
                    value={filters.project}
                    options={[
                      { value: '', label: 'All Projects' },
                      ...projects.map(project => ({ value: project.name, label: project.name }))
                    ]}
                    onChange={(value) => handleBasicFilterChange('project', value)}
                    isOpen={showProjectDropdown}
                    onToggle={() => setShowProjectDropdown(!showProjectDropdown)}
                    dataTestId="project-dropdown"
                  />
                  
                  <CustomDropdown
                    label="Test Suite"
                    value={filters.suite}
                    options={[
                      { value: '', label: 'All Test Suites' },
                      ...testSuites.map(suite => ({ value: suite.name, label: suite.name }))
                    ]}
                    onChange={(value) => handleBasicFilterChange('suite', value)}
                    isOpen={showSuiteDropdown}
                    onToggle={() => setShowSuiteDropdown(!showSuiteDropdown)}
                    dataTestId="suite-dropdown"
                  />
                  
                  <CustomDropdown
                    label="Status"
                    value={filters.status}
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: '1', label: 'Pass' },
                      { value: '2', label: 'Fail' },
                      { value: '3', label: 'Block' },
                      { value: '4', label: 'Draft' }
                    ]}
                    onChange={(value) => handleBasicFilterChange('status', value)}
                    isOpen={showStatusDropdown}
                    onToggle={() => setShowStatusDropdown(!showStatusDropdown)}
                    dataTestId="status-dropdown"
                  />
                  
                  <CustomDropdown
                    label="Priority"
                    value={filters.priority}
                    options={[
                      { value: '', label: 'All Priorities' },
                      { value: '1', label: 'High' },
                      { value: '2', label: 'Medium' },
                      { value: '3', label: 'Low' }
                    ]}
                    onChange={(value) => handleBasicFilterChange('priority', value)}
                    isOpen={showPriorityDropdown}
                    onToggle={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    dataTestId="priority-dropdown"
                  />
                </div>
              </div>
            </div>

            {/* Date Filters Section */}
            <div data-testid="date-filters-section">
              <button
                onClick={() => toggleSection('dates')}
                className="w-full flex items-center justify-between p-4 bg-apple-gray-1/30 rounded-apple-lg hover:bg-apple-gray-1/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center">
                    <Filter className="w-3 h-3 text-apple-blue" />
                  </div>
                  <h3 className="text-sm font-sf font-semibold text-apple-gray-7">Date Filters</h3>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.dates ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
                  expandedSections.dates ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                data-testid="date-filters-content"
              >
                <div className="pt-4 space-y-4" data-testid="date-filters-inner">
                  <div className="space-y-2">
                    <label className="block text-sm font-sf font-semibold text-apple-gray-6">
                      Created Date
                    </label>
                    <DateRangePicker
                      startDate={filters.dates?.created?.start}
                      endDate={filters.dates?.created?.end}
                      onDateChange={(start, end) => handleDateChange('created', start, end)}
                      placeholder="Select created date range"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-sf font-semibold text-apple-gray-6">
                      Updated Date
                    </label>
                    <DateRangePicker
                      startDate={filters.dates?.updated?.start}
                      endDate={filters.dates?.updated?.end}
                      onDateChange={(start, end) => handleDateChange('updated', start, end)}
                      placeholder="Select updated date range"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-sf font-semibold text-apple-gray-6">
                      Execution Date
                    </label>
                    <DateRangePicker
                      startDate={filters.dates?.execution?.start}
                      endDate={filters.dates?.execution?.end}
                      onDateChange={(start, end) => handleDateChange('execution', start, end)}
                      placeholder="Select execution date range"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filters Section */}
            <div data-testid="advanced-filters-section">
              <button
                onClick={() => toggleSection('advanced')}
                className="w-full flex items-center justify-between p-4 bg-apple-gray-1/30 rounded-apple-lg hover:bg-apple-gray-1/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center">
                    <Filter className="w-3 h-3 text-apple-blue" />
                  </div>
                  <h3 className="text-sm font-sf font-semibold text-apple-gray-7">Advanced Filters</h3>
                </div>
                <ChevronDown 
                  className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.advanced ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-out ${
                  expandedSections.advanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
                data-testid="advanced-filters-content"
              >
                <div className="pt-4 space-y-4" data-testid="advanced-filters-inner">
                  <p className="text-sm text-apple-gray-5">
                    Advanced filters including custom fields, execution types, and more will be available here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-apple-gray-2">
          <div className="flex items-center gap-2">
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                onClick={onClearFilters}
                className="text-sm text-apple-gray-5 hover:text-apple-gray-7"
              >
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => setShowPresetManager(true)}
              className="text-sm text-apple-gray-5 hover:text-apple-gray-7"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Presets
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleCloseDialog}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCloseDialog}
            >
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Preset Manager Modal */}
        {showPresetManager && (
          <FilterPresetManager
            isOpen={showPresetManager}
            onClose={() => setShowPresetManager(false)}
            currentFilters={filters}
            savedPresets={savedPresets}
            onSavePreset={onSavePreset}
            onLoadPreset={onLoadPreset}
            onDeletePreset={onDeletePreset}
          />
        )}
      </motion.div>
    </div>
  );
};

export default FilterDialog; 