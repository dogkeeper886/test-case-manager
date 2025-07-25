import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Bookmark, Trash2, Edit, Plus, X, ChevronDown } from 'lucide-react';
import { Button, Input, Card } from '../ui';

const FilterPresetManager = ({
  isOpen,
  onClose,
  currentFilters,
  savedPresets = [],
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  className = ''
}) => {
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [editingPreset, setEditingPreset] = useState(null);
  const [showPresetMenu, setShowPresetMenu] = useState(null);
  
  const modalRef = useRef(null);
  const presetMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
      if (presetMenuRef.current && !presetMenuRef.current.contains(event.target)) {
        setShowPresetMenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    
    const presetData = {
      name: presetName.trim(),
      filters: currentFilters,
      createdAt: new Date().toISOString()
    };
    
    onSavePreset(presetData);
    setPresetName('');
    setShowSaveForm(false);
    setEditingPreset(null);
  };

  const handleLoadPreset = (preset) => {
    onLoadPreset(preset);
    onClose();
  };

  const handleDeletePreset = (presetId) => {
    onDeletePreset(presetId);
    setShowPresetMenu(null);
  };

  const handleEditPreset = (preset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setShowSaveForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilterSummary = (filters) => {
    const summary = [];
    
    if (filters.search?.query) {
      summary.push(`Search: "${filters.search.query}"`);
    }
    if (filters.project) summary.push(`Project: ${filters.project}`);
    if (filters.suite) summary.push(`Suite: ${filters.suite}`);
    if (filters.status) summary.push(`Status: ${filters.status}`);
    if (filters.priority) summary.push(`Priority: ${filters.priority}`);
    
    // Count date filters
    let dateCount = 0;
    Object.values(filters.dates || {}).forEach(filter => {
      if (filter.enabled && (filter.start || filter.end)) dateCount++;
    });
    if (dateCount > 0) summary.push(`${dateCount} date filter${dateCount > 1 ? 's' : ''}`);
    
    return summary.slice(0, 3).join(', ') + (summary.length > 3 ? '...' : '');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`bg-white rounded-apple-xl shadow-apple-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-apple-gray-2">
          <div className="flex items-center gap-3">
            <Bookmark className="w-5 h-5 text-apple-blue" />
            <h2 className="text-lg font-sf font-semibold text-apple-gray-7">
              Filter Presets
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Save Current Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-sf font-medium text-apple-gray-7">
                Save Current Filters
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveForm(!showSaveForm)}
                className="text-xs"
              >
                {showSaveForm ? 'Cancel' : 'Save Preset'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showSaveForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <Input
                    placeholder="Enter preset name..."
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="w-full"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSavePreset}
                      disabled={!presetName.trim()}
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {editingPreset ? 'Update Preset' : 'Save Preset'}
                    </Button>
                    {editingPreset && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowSaveForm(false);
                          setEditingPreset(null);
                          setPresetName('');
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Saved Presets */}
          <div>
            <h3 className="text-sm font-sf font-medium text-apple-gray-7 mb-3">
              Saved Presets ({savedPresets.length})
            </h3>
            
            {savedPresets.length === 0 ? (
              <div className="text-center py-8 text-apple-gray-5">
                <Bookmark className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No saved presets yet</p>
                <p className="text-xs">Save your current filters to create your first preset</p>
              </div>
            ) : (
              <div className="space-y-2">
                {savedPresets.map((preset) => (
                  <div
                    key={preset.id}
                    className="group relative p-3 border border-apple-gray-2 rounded-apple-lg hover:border-apple-gray-3 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-sf font-medium text-apple-gray-7 truncate">
                            {preset.name}
                          </h4>
                          <span className="text-xs text-apple-gray-4">
                            {formatDate(preset.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-apple-gray-5 truncate">
                          {getFilterSummary(preset.filters)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadPreset(preset)}
                          className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Load
                        </Button>
                        
                        <div className="relative" ref={presetMenuRef}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPresetMenu(showPresetMenu === preset.id ? null : preset.id)}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </Button>
                          
                          <AnimatePresence>
                            {showPresetMenu === preset.id && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full right-0 mt-1 w-32 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-10"
                              >
                                <button
                                  onClick={() => handleEditPreset(preset)}
                                  className="w-full px-3 py-2 text-left text-xs font-sf text-apple-gray-7 hover:bg-apple-gray-1 first:rounded-t-apple-lg flex items-center gap-2"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePreset(preset.id)}
                                  className="w-full px-3 py-2 text-left text-xs font-sf text-red-600 hover:bg-red-50 last:rounded-b-apple-lg flex items-center gap-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t border-apple-gray-2">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default FilterPresetManager; 