import React, { useState } from 'react';
import { Filter, ChevronDown, X, Save, Bookmark } from 'lucide-react';
import { Button, Card } from '../ui';
import AdvancedSearch from './AdvancedSearch';
import DateRangePicker from './DateRangePicker';
import FilterChip from './FilterChip';
import FilterPresetManager from './FilterPresetManager';
import QuickPresetSelector from './QuickPresetSelector';

const FilterPanel = ({
  filters,
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
    dates: false,
    advanced: false
  });
  const [showPresetManager, setShowPresetManager] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSearchChange = (searchData) => {
    onFilterChange('search', searchData);
  };

  const handleDateChange = (type, startDate, endDate) => {
    onFilterChange('dates', { type, startDate, endDate });
  };

  const handleBasicFilterChange = (filterType, value) => {
    onFilterChange('basic', { [filterType]: value });
  };

  const handleRemoveFilter = (filterType, value) => {
    onFilterChange('remove', { filterType, value });
  };

  const getActiveFilters = () => {
    const active = [];
    
    if (filters.search?.query) {
      active.push({
        type: 'search',
        label: 'Search',
        value: filters.search.query,
        variant: 'search'
      });
    }
    
    if (filters.project) {
      active.push({
        type: 'project',
        label: 'Project',
        value: filters.project,
        variant: 'project'
      });
    }
    
    if (filters.suite) {
      active.push({
        type: 'suite',
        label: 'Test Suite',
        value: filters.suite,
        variant: 'suite'
      });
    }
    
    if (filters.status) {
      active.push({
        type: 'status',
        label: 'Status',
        value: filters.status,
        variant: 'status'
      });
    }
    
    if (filters.priority) {
      active.push({
        type: 'priority',
        label: 'Priority',
        value: filters.priority,
        variant: 'priority'
      });
    }
    
    // Add date filters
    Object.entries(filters.dates || {}).forEach(([type, dateFilter]) => {
      if (dateFilter.start || dateFilter.end) {
        const dateRange = [];
        if (dateFilter.start) dateRange.push(dateFilter.start);
        if (dateFilter.end) dateRange.push(dateFilter.end);
        active.push({
          type: `date_${type}`,
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Date`,
          value: dateRange.join(' - '),
          variant: 'date'
        });
      }
    });
    
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <Card 
      elevation="sm" 
      padding="lg" 
      className={`bg-white rounded-apple-lg shadow-apple-sm border border-apple-gray-2 hover:shadow-apple-md hover:-translate-y-0.5 transition-all duration-200 ${className}`}
      data-testid="advanced-filter-panel"
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6" data-testid="filter-panel-header">
        <div className="flex items-center gap-3" data-testid="filter-panel-title">
          <div className="w-8 h-8 bg-apple-blue/10 rounded-full flex items-center justify-center hover:bg-apple-blue/20 transition-colors duration-200" data-testid="filter-panel-icon">
            <Filter className="w-4 h-4 text-apple-blue" />
          </div>
          <div>
            <h3 className="text-lg font-sf font-bold text-apple-gray-7" data-testid="filter-panel-title-text">Advanced Filters</h3>
            <p className="text-sm text-apple-gray-5" data-testid="filter-panel-subtitle">Refine your test case search</p>
          </div>
          {activeFilters.length > 0 && (
            <div className="ml-3 px-3 py-1 bg-apple-blue/10 text-apple-blue rounded-full text-sm font-semibold hover:bg-apple-blue/20 transition-colors duration-200" data-testid="active-filters-count">
              {activeFilters.length}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2" data-testid="filter-panel-actions">
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-sm text-apple-gray-5 hover:text-apple-gray-7 hover:bg-apple-gray-2 transition-all duration-200"
              data-testid="clear-all-filters-button"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPresetManager(true)}
            className="text-sm text-apple-gray-5 hover:text-apple-gray-7 hover:bg-apple-gray-2 transition-all duration-200"
            data-testid="preset-manager-button"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Presets
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="mb-6 p-4 bg-apple-gray-1/50 rounded-apple-lg border border-apple-gray-2/50 hover:bg-apple-gray-1/70 transition-colors duration-200" data-testid="active-filters-section">
          <div className="flex flex-wrap gap-2" data-testid="active-filters-chips">
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.type}
                label={filter.label}
                value={filter.value}
                variant={filter.variant}
                onRemove={() => handleRemoveFilter(filter.type, filter.value)}
                data-testid={`filter-chip-${filter.type}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="mb-6" data-testid="quick-presets-section">
        <QuickPresetSelector
          onPresetSelect={onApplyPreset}
          data-testid="quick-preset-selector"
        />
      </div>

      {/* Filter Sections */}
      <div className="space-y-6" data-testid="filter-sections">
        {/* Search Section */}
        <div className="bg-white border border-apple-gray-2 rounded-apple-lg p-4 hover:shadow-apple-sm hover:-translate-y-0.5 transition-all duration-200" data-testid="search-section">
          <button
            onClick={() => toggleSection('search')}
            className="flex items-center justify-between w-full text-left mb-3"
            data-testid="search-section-toggle"
          >
            <div className="flex items-center gap-3" data-testid="search-section-header">
              <div className="w-6 h-6 bg-apple-blue/10 rounded-full flex items-center justify-center" data-testid="search-section-icon">
                <Filter className="w-3 h-3 text-apple-blue" />
              </div>
              <h4 className="text-base font-sf font-semibold text-apple-gray-7" data-testid="search-section-title">Search</h4>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.search ? 'rotate-180' : ''}`} 
              data-testid="search-section-chevron"
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-200 ease-out ${
              expandedSections.search ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
            data-testid="search-section-content"
          >
            <div className="pt-2" data-testid="search-section-inner">
              <AdvancedSearch
                onSearch={handleSearchChange}
                placeholder="Search test cases..."
                data-testid="advanced-search-component"
              />
            </div>
          </div>
        </div>

        {/* Basic Filters Section */}
        <div className="bg-white border border-apple-gray-2 rounded-apple-lg p-4 hover:shadow-apple-sm hover:-translate-y-0.5 transition-all duration-200" data-testid="basic-filters-section">
          <button
            onClick={() => toggleSection('basic')}
            className="flex items-center justify-between w-full text-left mb-3"
            data-testid="basic-filters-toggle"
          >
            <div className="flex items-center gap-3" data-testid="basic-filters-header">
              <div className="w-6 h-6 bg-success/10 rounded-full flex items-center justify-center" data-testid="basic-filters-icon">
                <Filter className="w-3 h-3 text-success" />
              </div>
              <h4 className="text-base font-sf font-semibold text-apple-gray-7" data-testid="basic-filters-title">Basic Filters</h4>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.basic ? 'rotate-180' : ''}`} 
              data-testid="basic-filters-chevron"
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-200 ease-out ${
              expandedSections.basic ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
            data-testid="basic-filters-content"
          >
            <div className="pt-2 space-y-4" data-testid="basic-filters-inner">
              {/* Project Filter */}
              <div className="space-y-2" data-testid="project-filter-container">
                <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid="project-filter-label">
                  Project
                </label>
                <select
                  value={filters.project || ''}
                  onChange={(e) => handleBasicFilterChange('project', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-sf border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue hover:border-apple-gray-3 transition-all duration-200 bg-white"
                  data-testid="project-filter-select"
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.name} data-testid={`project-option-${project.id}`}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Test Suite Filter */}
              <div className="space-y-2" data-testid="suite-filter-container">
                <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid="suite-filter-label">
                  Test Suite
                </label>
                <select
                  value={filters.suite || ''}
                  onChange={(e) => handleBasicFilterChange('suite', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-sf border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue hover:border-apple-gray-3 transition-all duration-200 bg-white"
                  data-testid="suite-filter-select"
                >
                  <option value="">All Test Suites</option>
                  {testSuites.map(suite => (
                    <option key={suite.id} value={suite.name} data-testid={`suite-option-${suite.id}`}>
                      {suite.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2" data-testid="status-filter-container">
                <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid="status-filter-label">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleBasicFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-sf border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue hover:border-apple-gray-3 transition-all duration-200 bg-white"
                  data-testid="status-filter-select"
                >
                  <option value="">All Statuses</option>
                  <option value="1" data-testid="status-option-pass">Pass</option>
                  <option value="2" data-testid="status-option-fail">Fail</option>
                  <option value="3" data-testid="status-option-block">Block</option>
                  <option value="4" data-testid="status-option-draft">Draft</option>
                  <option value="5" data-testid="status-option-in-progress">In Progress</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2" data-testid="priority-filter-container">
                <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid="priority-filter-label">
                  Priority
                </label>
                <select
                  value={filters.priority || ''}
                  onChange={(e) => handleBasicFilterChange('priority', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-sf border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue hover:border-apple-gray-3 transition-all duration-200 bg-white"
                  data-testid="priority-filter-select"
                >
                  <option value="">All Priorities</option>
                  <option value="1" data-testid="priority-option-high">High</option>
                  <option value="2" data-testid="priority-option-medium">Medium</option>
                  <option value="3" data-testid="priority-option-low">Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filters Section */}
        <div className="bg-white border border-apple-gray-2 rounded-apple-lg p-4 hover:shadow-apple-sm hover:-translate-y-0.5 transition-all duration-200" data-testid="date-filters-section">
          <button
            onClick={() => toggleSection('dates')}
            className="flex items-center justify-between w-full text-left mb-3"
            data-testid="date-filters-toggle"
          >
            <div className="flex items-center gap-3" data-testid="date-filters-header">
              <div className="w-6 h-6 bg-warning/10 rounded-full flex items-center justify-center" data-testid="date-filters-icon">
                <Filter className="w-3 h-3 text-warning" />
              </div>
              <h4 className="text-base font-sf font-semibold text-apple-gray-7" data-testid="date-filters-title">Date Filters</h4>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.dates ? 'rotate-180' : ''}`} 
              data-testid="date-filters-chevron"
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-200 ease-out ${
              expandedSections.dates ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
            data-testid="date-filters-content"
          >
            <div className="pt-2 space-y-4" data-testid="date-filters-inner">
              {/* Created Date Filter */}
              <div className="space-y-2" data-testid="created-date-filter-container">
                <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid="created-date-filter-label">
                  Created Date
                </label>
                <DateRangePicker
                  startDate={filters.dates?.created?.start}
                  endDate={filters.dates?.created?.end}
                  onDateChange={(start, end) => handleDateChange('created', start, end)}
                  placeholder="Select created date range"
                  data-testid="created-date-picker"
                />
              </div>

              {/* Updated Date Filter */}
              <div className="space-y-2" data-testid="updated-date-filter-container">
                <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid="updated-date-filter-label">
                  Updated Date
                </label>
                <DateRangePicker
                  startDate={filters.dates?.updated?.start}
                  endDate={filters.dates?.updated?.end}
                  onDateChange={(start, end) => handleDateChange('updated', start, end)}
                  placeholder="Select updated date range"
                  data-testid="updated-date-picker"
                />
              </div>

              {/* Execution Date Filter */}
              <div className="space-y-2" data-testid="execution-date-filter-container">
                <label className="block text-sm font-sf font-semibold text-apple-gray-6" data-testid="execution-date-filter-label">
                  Execution Date
                </label>
                <DateRangePicker
                  startDate={filters.dates?.executed?.start}
                  endDate={filters.dates?.executed?.end}
                  onDateChange={(start, end) => handleDateChange('executed', start, end)}
                  placeholder="Select execution date range"
                  data-testid="execution-date-picker"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters Section */}
        <div className="bg-white border border-apple-gray-2 rounded-apple-lg p-4 hover:shadow-apple-sm hover:-translate-y-0.5 transition-all duration-200" data-testid="advanced-filters-section">
          <button
            onClick={() => toggleSection('advanced')}
            className="flex items-center justify-between w-full text-left mb-3"
            data-testid="advanced-filters-toggle"
          >
            <div className="flex items-center gap-3" data-testid="advanced-filters-header">
              <div className="w-6 h-6 bg-info/10 rounded-full flex items-center justify-center" data-testid="advanced-filters-icon">
                <Filter className="w-3 h-3 text-info" />
              </div>
              <h4 className="text-base font-sf font-semibold text-apple-gray-7" data-testid="advanced-filters-title">Advanced Filters</h4>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-apple-gray-4 transition-transform duration-200 ${expandedSections.advanced ? 'rotate-180' : ''}`} 
              data-testid="advanced-filters-chevron"
            />
          </button>
          
          <div 
            className={`overflow-hidden transition-all duration-200 ease-out ${
              expandedSections.advanced ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
            data-testid="advanced-filters-content"
          >
            <div className="pt-2 p-4 bg-apple-gray-1/30 rounded-apple-lg border border-apple-gray-2/50" data-testid="advanced-filters-inner">
              <p className="text-sm text-apple-gray-5 font-sf" data-testid="advanced-filters-placeholder">
                Advanced filters including custom fields, execution types, and more will be available here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Manager Modal */}
      <FilterPresetManager
        isOpen={showPresetManager}
        onClose={() => setShowPresetManager(false)}
        currentFilters={filters}
        savedPresets={savedPresets}
        onSavePreset={onSavePreset}
        onLoadPreset={onLoadPreset}
        onDeletePreset={onDeletePreset}
        data-testid="filter-preset-manager"
      />
    </Card>
  );
};

export default FilterPanel; 