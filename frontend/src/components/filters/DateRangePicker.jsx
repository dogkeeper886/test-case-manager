import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { Button } from '../ui';

const DateRangePicker = ({
  startDate,
  endDate,
  onDateChange,
  placeholder = "Select date range",
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate || '');
  const [tempEndDate, setTempEndDate] = useState(endDate || '');
  
  const containerRef = useRef(null);
  const presetsRef = useRef(null);

  const quickPresets = [
    { label: 'Today', value: 'today', start: new Date(), end: new Date() },
    { label: 'Yesterday', value: 'yesterday', start: new Date(Date.now() - 24 * 60 * 60 * 1000), end: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    { label: 'Last 7 days', value: 'last7days', start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), end: new Date() },
    { label: 'Last 30 days', value: 'last30days', start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
    { label: 'This month', value: 'thisMonth', start: new Date(new Date().getFullYear(), new Date().getMonth(), 1), end: new Date() },
    { label: 'Last month', value: 'lastMonth', start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), end: new Date(new Date().getFullYear(), new Date().getMonth(), 0) }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowPresets(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handlePresetClick = (preset) => {
    const start = formatDateForInput(preset.start);
    const end = formatDateForInput(preset.end);
    
    setTempStartDate(start);
    setTempEndDate(end);
    
    if (onDateChange) {
      onDateChange(start, end);
    }
    
    setShowPresets(false);
    setIsOpen(false);
  };

  const handleApplyCustomDates = () => {
    if (onDateChange) {
      onDateChange(tempStartDate, tempEndDate);
    }
    setIsOpen(false);
  };

  const handleClearDates = () => {
    setTempStartDate('');
    setTempEndDate('');
    if (onDateChange) {
      onDateChange('', '');
    }
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (startDate && endDate) {
      if (startDate === endDate) {
        return formatDate(startDate);
      }
      return `${formatDate(startDate)} - ${formatDate(endDate)}`;
    }
    return placeholder;
  };

  const hasActiveDates = startDate || endDate;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Date Range Button */}
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full justify-between ${hasActiveDates ? 'border-apple-blue/30 bg-apple-blue/5' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-apple-gray-5" />
          <span className={hasActiveDates ? 'text-apple-gray-7' : 'text-apple-gray-5'}>
            {getDisplayText()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasActiveDates && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClearDates();
              }}
              className="h-6 w-6 p-0 text-apple-gray-4 hover:text-apple-gray-6"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </Button>

      {/* Date Picker Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50"
          >
            <div className="p-4">
              {/* Quick Presets */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-apple-gray-7">Quick Presets</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPresets(!showPresets)}
                    className="text-xs text-apple-gray-5 hover:text-apple-gray-7"
                  >
                    {showPresets ? 'Hide' : 'Show'} All
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {quickPresets.slice(0, 4).map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-2 text-xs font-sf text-apple-gray-7 hover:bg-apple-gray-1 rounded-apple-md text-left"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {showPresets && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 pt-2 border-t border-apple-gray-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {quickPresets.slice(4).map((preset) => (
                          <button
                            key={preset.value}
                            onClick={() => handlePresetClick(preset)}
                            className="px-3 py-2 text-xs font-sf text-apple-gray-7 hover:bg-apple-gray-1 rounded-apple-md text-left"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Custom Date Range */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-apple-gray-7">Custom Range</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-apple-gray-6 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      min={tempStartDate}
                      className="w-full px-3 py-2 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleApplyCustomDates}
                    disabled={!tempStartDate || !tempEndDate}
                    className="flex-1"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateRangePicker; 