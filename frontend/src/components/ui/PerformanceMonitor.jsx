import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Clock, Zap, X } from 'lucide-react';
import { Button } from './index';
import { PerformanceMonitor as PerfMonitor } from '../../utils/filterCache';

const PerformanceMonitor = ({
  isVisible = false,
  onClose,
  className = ''
}) => {
  const [metrics, setMetrics] = useState({});
  const [isExpanded, setIsExpanded] = useState(false);
  const monitorRef = useRef(new PerfMonitor());
  const intervalRef = useRef(null);

  // Update metrics every second
  useEffect(() => {
    if (isVisible) {
      intervalRef.current = setInterval(() => {
        setMetrics(monitorRef.current.getMetrics());
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isVisible]);

  const formatDuration = (duration) => {
    if (!duration) return '0ms';
    return duration < 1 ? '<1ms' : `${duration.toFixed(1)}ms`;
  };

  const getPerformanceColor = (duration) => {
    if (!duration) return 'text-apple-gray-4';
    if (duration < 16) return 'text-green-600'; // 60fps
    if (duration < 33) return 'text-yellow-600'; // 30fps
    return 'text-red-600';
  };

  const getPerformanceIcon = (duration) => {
    if (!duration) return <Clock className="w-3 h-3" />;
    if (duration < 16) return <Zap className="w-3 h-3" />;
    if (duration < 33) return <TrendingUp className="w-3 h-3" />;
    return <TrendingDown className="w-3 h-3" />;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-4 right-4 z-50 ${className}`}
    >
      <div className="bg-white border border-apple-gray-2 rounded-apple-lg shadow-apple-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-apple-gray-1/50 border-b border-apple-gray-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-apple-blue" />
            <span className="text-sm font-sf font-medium text-apple-gray-7">
              Performance Monitor
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? '−' : '+'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-3"
            >
              {/* Filter Operations */}
              <div>
                <h4 className="text-xs font-sf font-medium text-apple-gray-6 mb-2">
                  Filter Operations
                </h4>
                <div className="space-y-2">
                  {Object.entries(metrics).map(([operation, metric]) => (
                    <div
                      key={operation}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-apple-gray-7 capitalize">
                        {operation.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <div className="flex items-center gap-1">
                        {getPerformanceIcon(metric.duration)}
                        <span className={getPerformanceColor(metric.duration)}>
                          {formatDuration(metric.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Metrics */}
              <div className="pt-3 border-t border-apple-gray-2">
                <h4 className="text-xs font-sf font-medium text-apple-gray-6 mb-2">
                  System Metrics
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-apple-gray-7">Memory Usage</span>
                    <span className="text-apple-gray-6">
                      {performance.memory ? 
                        `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-apple-gray-7">FPS</span>
                    <span className="text-apple-gray-6">
                      {metrics.fps ? `${metrics.fps.toFixed(1)}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-apple-gray-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => monitorRef.current.logMetrics()}
                    className="text-xs"
                  >
                    Log Metrics
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      monitorRef.current = new PerfMonitor();
                      setMetrics({});
                    }}
                    className="text-xs"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed View */}
        {!isExpanded && (
          <div className="px-4 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-apple-gray-6">Operations</span>
              <span className="text-apple-gray-7">
                {Object.keys(metrics).length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-apple-gray-6">Avg Duration</span>
              <span className="text-apple-gray-7">
                {Object.values(metrics).length > 0 ? 
                  formatDuration(
                    Object.values(metrics).reduce((sum, m) => sum + (m.duration || 0), 0) / 
                    Object.values(metrics).length
                  ) : 
                  '0ms'
                }
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PerformanceMonitor; 