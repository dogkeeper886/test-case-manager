import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, Clock, AlertTriangle, CheckCircle, XCircle, Pause } from 'lucide-react';
import { Button } from '../ui';

const QuickPresetSelector = ({
  onPresetSelect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickPresets = [
    {
      id: 'recent-failed',
      name: 'Recently Failed',
      description: 'Test cases that failed in the last 7 days',
      icon: <XCircle className="w-4 h-4" />,
      filters: {
        status: '2', // Fail
        dates: {
          executed: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0], enabled: true }
        }
      }
    },
    {
      id: 'high-priority',
      name: 'High Priority',
      description: 'All high priority test cases',
      icon: <AlertTriangle className="w-4 h-4" />,
      filters: {
        priority: '1' // High
      }
    },
    {
      id: 'blocked-tests',
      name: 'Blocked Tests',
      description: 'All blocked test cases',
      icon: <Pause className="w-4 h-4" />,
      filters: {
        status: '3' // Block
      }
    },
    {
      id: 'recent-passed',
      name: 'Recently Passed',
      description: 'Test cases that passed in the last 7 days',
      icon: <CheckCircle className="w-4 h-4" />,
      filters: {
        status: '1', // Pass
        dates: {
          executed: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0], enabled: true }
        }
      }
    },
    {
      id: 'draft-tests',
      name: 'Draft Tests',
      description: 'All draft test cases',
      icon: <Clock className="w-4 h-4" />,
      filters: {
        status: '4' // Draft
      }
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      description: 'Test cases currently in progress',
      icon: <Clock className="w-4 h-4" />,
      filters: {
        status: '5' // In Progress
      }
    },
    {
      id: 'this-week',
      name: 'This Week',
      description: 'Test cases created this week',
      icon: <Clock className="w-4 h-4" />,
      filters: {
        dates: {
          created: { 
            start: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString().split('T')[0], 
            end: new Date().toISOString().split('T')[0], 
            enabled: true 
          }
        }
      }
    },
    {
      id: 'last-month',
      name: 'Last Month',
      description: 'Test cases created last month',
      icon: <Clock className="w-4 h-4" />,
      filters: {
        dates: {
          created: { 
            start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0], 
            end: new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0], 
            enabled: true 
          }
        }
      }
    }
  ];

  const handlePresetSelect = (preset) => {
    onPresetSelect(preset.filters);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-apple-gray-5" />
          <span className="text-apple-gray-7">Quick Presets</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-apple-gray-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg z-50"
          >
            <div className="p-2">
              <div className="px-2 py-1 text-xs font-medium text-apple-gray-5 mb-2">
                Common Filter Combinations
              </div>
              <div className="space-y-1">
                {quickPresets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full px-3 py-2 text-left text-sm font-sf text-apple-gray-7 hover:bg-apple-gray-1 rounded-apple-md flex items-start gap-3"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {preset.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-apple-gray-5 truncate">
                        {preset.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuickPresetSelector; 