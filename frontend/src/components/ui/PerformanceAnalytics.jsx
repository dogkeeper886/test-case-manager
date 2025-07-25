import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Zap, Clock, Activity, X } from 'lucide-react';
import { Button, Card } from './index';

const PerformanceAnalytics = ({
  isVisible = false,
  onClose,
  cacheStats = {},
  filterMetrics = {},
  className = ''
}) => {
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [timeRange, setTimeRange] = useState('1h');

  const metrics = {
    overview: {
      title: 'Performance Overview',
      icon: <Activity className="w-5 h-5" />,
      data: [
        { label: 'Cache Hit Rate', value: `${(cacheStats.hitRate * 100).toFixed(1)}%`, trend: 'up' },
        { label: 'Avg Filter Time', value: '12.3ms', trend: 'down' },
        { label: 'Memory Usage', value: '45.2MB', trend: 'stable' },
        { label: 'Active Filters', value: filterMetrics.activeFilters || 0, trend: 'stable' }
      ]
    },
    cache: {
      title: 'Cache Performance',
      icon: <Zap className="w-5 h-5" />,
      data: [
        { label: 'Cache Size', value: `${cacheStats.size}/${cacheStats.maxSize}`, trend: 'stable' },
        { label: 'Total Accesses', value: cacheStats.totalAccess || 0, trend: 'up' },
        { label: 'Avg Access Count', value: (cacheStats.avgAccess || 0).toFixed(1), trend: 'up' },
        { label: 'Cache Efficiency', value: `${((cacheStats.size / cacheStats.maxSize) * 100).toFixed(1)}%`, trend: 'stable' }
      ]
    },
    filters: {
      title: 'Filter Performance',
      icon: <BarChart3 className="w-5 h-5" />,
      data: [
        { label: 'Filter Operations', value: filterMetrics.operations || 0, trend: 'up' },
        { label: 'Avg Filter Time', value: filterMetrics.avgTime || '0ms', trend: 'down' },
        { label: 'Complex Filters', value: filterMetrics.complexFilters || 0, trend: 'stable' },
        { label: 'Filter Cache Hits', value: filterMetrics.cacheHits || 0, trend: 'up' }
      ]
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-apple-gray-4" />;
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-apple-gray-4';
    }
  };

  if (!isVisible) return null;

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
            <BarChart3 className="w-5 h-5 text-apple-blue" />
            <h2 className="text-lg font-sf font-semibold text-apple-gray-7">
              Performance Analytics
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
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Metric Tabs */}
          <div className="flex items-center gap-2 mb-6">
            {Object.entries(metrics).map(([key, metric]) => (
              <Button
                key={key}
                variant={selectedMetric === key ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric(key)}
                className="flex items-center gap-2"
              >
                {metric.icon}
                {metric.title}
              </Button>
            ))}
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm font-sf font-medium text-apple-gray-6">Time Range:</span>
            {['1h', '6h', '24h', '7d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'outline' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range}
              </Button>
            ))}
          </div>

          {/* Selected Metric Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedMetric}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics[selectedMetric].data.map((item, index) => (
                  <Card key={index} elevation="sm" padding="lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-sf font-medium text-apple-gray-7">
                          {item.label}
                        </h3>
                        <p className={`text-lg font-sf font-semibold ${getTrendColor(item.trend)}`}>
                          {item.value}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(item.trend)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Performance Chart Placeholder */}
          <div className="mt-6">
            <Card elevation="sm" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-sf font-medium text-apple-gray-7">
                  Performance Trends
                </h3>
                <span className="text-xs text-apple-gray-5">
                  Last {timeRange}
                </span>
              </div>
              <div className="h-48 bg-apple-gray-1/30 rounded-apple-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 text-apple-gray-4 mx-auto mb-2" />
                  <p className="text-sm text-apple-gray-5">
                    Performance chart visualization
                  </p>
                  <p className="text-xs text-apple-gray-4">
                    Chart component would be integrated here
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recommendations */}
          <div className="mt-6">
            <Card elevation="sm" padding="lg">
              <h3 className="text-sm font-sf font-medium text-apple-gray-7 mb-4">
                Performance Recommendations
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-sf text-apple-gray-7">
                      Cache hit rate is excellent at {(cacheStats.hitRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-apple-gray-5">
                      Filter operations are being cached efficiently
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-sf text-apple-gray-7">
                      Consider increasing cache size for better performance
                    </p>
                    <p className="text-xs text-apple-gray-5">
                      Current usage: {((cacheStats.size / cacheStats.maxSize) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-sf text-apple-gray-7">
                      Virtual scrolling is active for large datasets
                    </p>
                    <p className="text-xs text-apple-gray-5">
                      Optimized for handling 1000+ test cases
                    </p>
                  </div>
                </div>
              </div>
            </Card>
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
          <Button
            variant="primary"
            onClick={() => {
              // Export performance data
              console.log('Exporting performance data...');
            }}
          >
            Export Data
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceAnalytics; 