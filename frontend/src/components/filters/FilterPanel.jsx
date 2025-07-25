import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    <Card elevation="sm" padding="lg" className={className}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-apple-gray-5" />
          <h3 className="text-sm font-sf font-semibold text-apple-gray-7">Filters</h3>
          {activeFilters.length > 0 && (
            <span className="px-2 py-1 text-xs font-sf font-medium bg-apple-blue/10 text-apple-blue rounded-full">
              {activeFilters.length}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {activeFilters.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs text-apple-gray-5 hover:text-apple-gray-7"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPresetManager(true)}
            className="text-xs text-apple-gray-5 hover:text-apple-gray-7"
          >
            <Bookmark className="w-3 h-3 mr-1" />
            Presets
          </Button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilters.length > 0 && (
        <div className="mb-4 p-3 bg-apple-gray-1/50 rounded-apple-lg">
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {activeFilters.map((filter) => (
                <FilterChip
                  key={filter.type}
                  label={filter.label}
                  value={filter.value}
                  variant={filter.variant}
                  onRemove={() => handleRemoveFilter(filter.type, filter.value)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="mb-4">
        <QuickPresetSelector
          onPresetSelect={onApplyPreset}
        />
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {/* Search Section */}
        <div>
          <button
            onClick={() => toggleSection('search')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-sf font-medium text-apple-gray-7">Search</h4>
            <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform ${expandedSections.search ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.search && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3"
              >
                <AdvancedSearch
                  onSearch={handleSearchChange}
                  placeholder="Search test cases..."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Basic Filters Section */}
        <div>
          <button
            onClick={() => toggleSection('basic')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-sf font-medium text-apple-gray-7">Basic Filters</h4>
            <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform ${expandedSections.basic ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.basic && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-3"
              >
                {/* Project Filter */}
                <div>
                  <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                    Project
                  </label>
                  <select
                    value={filters.project || ''}
                    onChange={(e) => handleBasicFilterChange('project', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                  >
                    <option value="">All Projects</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Test Suite Filter */}
                <div>
                  <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                    Test Suite
                  </label>
                  <select
                    value={filters.suite || ''}
                    onChange={(e) => handleBasicFilterChange('suite', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                  >
                    <option value="">All Test Suites</option>
                    {testSuites.map(suite => (
                      <option key={suite.id} value={suite.name}>
                        {suite.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleBasicFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                  >
                    <option value="">All Statuses</option>
                    <option value="1">Pass</option>
                    <option value="2">Fail</option>
                    <option value="3">Block</option>
                    <option value="4">Draft</option>
                    <option value="5">In Progress</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                    Priority
                  </label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => handleBasicFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                  >
                    <option value="">All Priorities</option>
                    <option value="1">High</option>
                    <option value="2">Medium</option>
                    <option value="3">Low</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Date Filters Section */}
        <div>
          <button
            onClick={() => toggleSection('dates')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-sf font-medium text-apple-gray-7">Date Filters</h4>
            <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform ${expandedSections.dates ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.dates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-3"
              >
                {/* Created Date Filter */}
                <div>
                  <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                    Created Date
                  </label>
                  <DateRangePicker
                    startDate={filters.dates?.created?.start}
                    endDate={filters.dates?.created?.end}
                    onDateChange={(start, end) => handleDateChange('created', start, end)}
                    placeholder="Select created date range"
                  />
                </div>

                {/* Updated Date Filter */}
                <div>
                  <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                    Updated Date
                  </label>
                  <DateRangePicker
                    startDate={filters.dates?.updated?.start}
                    endDate={filters.dates?.updated?.end}
                    onDateChange={(start, end) => handleDateChange('updated', start, end)}
                    placeholder="Select updated date range"
                  />
                </div>

                {/* Execution Date Filter */}
                <div>
                  <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                    Execution Date
                  </label>
                  <DateRangePicker
                    startDate={filters.dates?.executed?.start}
                    endDate={filters.dates?.executed?.end}
                    onDateChange={(start, end) => handleDateChange('executed', start, end)}
                    placeholder="Select execution date range"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Advanced Filters Section */}
        <div>
          <button
            onClick={() => toggleSection('advanced')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-sf font-medium text-apple-gray-7">Advanced Filters</h4>
            <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform ${expandedSections.advanced ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.advanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 p-3 bg-apple-gray-1/30 rounded-apple-lg"
              >
                <p className="text-xs text-apple-gray-5">
                  Advanced filters including custom fields, execution types, and more will be available here.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
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
      />
    </Card>
  );
};

export default FilterPanel; 