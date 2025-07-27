import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Play,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button, Card, Badge } from '../ui';

const TestCasesTimeline = ({ 
  testCases, 
  onView, 
  onEdit, 
  onDelete,
  onSelect,
  selectedIds = [],
  className = '' 
}) => {
  const [groupBy, setGroupBy] = useState('date'); // 'date', 'project', 'suite'

  // Helper functions
  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Pass';
      case 2: return 'Fail';
      case 3: return 'Block';
      case 4: return 'Draft';
      case 5: return 'In Progress';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <CheckCircle className="w-4 h-4" />;
      case 2: return <XCircle className="w-4 h-4" />;
      case 3: return <AlertCircle className="w-4 h-4" />;
      case 4: return <FileText className="w-4 h-4" />;
      case 5: return <Clock className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 1: return 'text-green-500';
      case 2: return 'text-red-500';
      case 3: return 'text-yellow-500';
      case 4: return 'text-apple-gray-4';
      case 5: return 'text-apple-blue';
      default: return 'text-apple-gray-4';
    }
  };

  // Generate timeline events from test cases
  const timelineEvents = useMemo(() => {
    const events = [];
    
    testCases.forEach(testCase => {
      // Creation event
      events.push({
        id: `create-${testCase.id}`,
        type: 'create',
        title: 'Test Case Created',
        description: `Created test case "${testCase.title}"`,
        timestamp: new Date(testCase.created_at),
        testCase,
        user: 'System',
        icon: <FileText className="w-4 h-4" />,
        color: 'text-apple-blue'
      });

      // Status change event (if status is not draft)
      if (testCase.status !== 4) {
        events.push({
          id: `status-${testCase.id}`,
          type: 'status',
          title: 'Status Updated',
          description: `Status changed to ${getStatusText(testCase.status)}`,
          timestamp: new Date(testCase.updated_at),
          testCase,
          user: 'System',
          icon: getStatusIcon(testCase.status),
          color: getStatusColor(testCase.status)
        });
      }

      // Add mock execution events for demonstration
      if (testCase.status === 1 || testCase.status === 2) {
        events.push({
          id: `execute-${testCase.id}`,
          type: 'execute',
          title: 'Test Executed',
          description: `Test case executed with result: ${getStatusText(testCase.status)}`,
          timestamp: new Date(testCase.updated_at),
          testCase,
          user: 'Test Runner',
          icon: <Play className="w-4 h-4" />,
          color: testCase.status === 1 ? 'text-green-500' : 'text-red-500'
        });
      }
    });

    // Sort by timestamp (newest first)
    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [testCases]);

  // Group events
  const groupedEvents = useMemo(() => {
    const grouped = {};
    
    timelineEvents.forEach(event => {
      let key;
      switch (groupBy) {
        case 'date':
          key = event.timestamp.toDateString();
          break;
        case 'project':
          key = event.testCase.project_name || 'Unknown Project';
          break;
        case 'suite':
          key = event.testCase.test_suite_name || 'Unknown Suite';
          break;
        default:
          key = event.timestamp.toDateString();
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(event);
    });

    return grouped;
  }, [timelineEvents, groupBy]);

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 1: return 'danger';   // High
      case 2: return 'warning';  // Medium
      case 3: return 'success';  // Low
      default: return 'secondary';
    }
  };

  // Get priority text
  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'High';
      case 2: return 'Medium';
      case 3: return 'Low';
      default: return 'Unknown';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7">Test Case Timeline</h3>
          <Badge variant="secondary">{timelineEvents.length} events</Badge>
        </div>
        
        {/* Group By Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-sf text-apple-gray-5">Group by:</span>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-1 text-sm border border-apple-gray-2 rounded-apple-md focus:outline-none focus:ring-2 focus:ring-apple-blue/50"
          >
            <option value="date">Date</option>
            <option value="project">Project</option>
            <option value="suite">Test Suite</option>
          </select>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="space-y-8">
        {Object.entries(groupedEvents).map(([groupKey, events]) => (
          <div key={groupKey} className="relative">
            {/* Group Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-apple-blue rounded-full"></div>
              <h4 className="font-sf font-medium text-apple-gray-7">
                {groupBy === 'date' ? new Date(groupKey).toLocaleDateString() : groupKey}
              </h4>
              <Badge variant="secondary" size="sm">{events.length} events</Badge>
            </div>

            {/* Timeline Line */}
            <div className="absolute left-1.5 top-8 bottom-0 w-px bg-apple-gray-2"></div>

            {/* Events */}
            <div className="space-y-4 ml-8">
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute -left-8 top-2 w-4 h-4 rounded-full border-3 border-white shadow-sm ${event.color.replace('text-', 'bg-')}`}></div>

                    {/* Event Card */}
                    <Card 
                      elevation="sm" 
                      padding="md" 
                      hover={false}
                      className={`hover:shadow-apple-md hover:-translate-y-1 transition-all duration-200 cursor-pointer group ${
                        selectedIds.includes(event.testCase.id) ? 'border-apple-blue bg-apple-blue/5 shadow-apple-md' : 'border-apple-gray-2'
                      }`}
                      onClick={(e) => {
                        // Don't trigger card click if clicking on action buttons or selection checkbox
                        if (e.target.closest('button')) {
                          return;
                        }
                        onView(event.testCase);
                      }}
                      data-testid={`test-case-timeline-card-${event.testCase.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {/* Event Icon */}
                          <div className={`p-2.5 rounded-apple-lg ${event.color.replace('text-', 'bg-')} bg-opacity-10 ${event.color} shadow-sm`}>
                            {event.icon}
                          </div>

                          {/* Event Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              {/* Selection Checkbox */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelect?.(event.testCase.id);
                                }}
                                className="flex items-center justify-center w-4 h-4 rounded border-2 border-apple-gray-3 hover:border-apple-blue transition-colors duration-200"
                                data-testid={`select-checkbox-${event.testCase.id}`}
                                aria-label={`Select test case ${event.testCase.id}`}
                              >
                                {selectedIds.includes(event.testCase.id) ? (
                                  <CheckSquare className="w-3 h-3 text-apple-blue" />
                                ) : (
                                  <Square className="w-3 h-3 text-apple-gray-5" />
                                )}
                              </button>
                              
                              <h5 className="font-sf font-semibold text-apple-gray-8">{event.title}</h5>
                              <Badge variant={getPriorityBadgeVariant(event.testCase.priority)} size="xs">
                                {getPriorityText(event.testCase.priority)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-apple-gray-6 mb-3 leading-relaxed">{event.description}</p>
                            
                            {/* Test Case Info */}
                            <div className="bg-gradient-to-r from-apple-gray-1/50 to-apple-gray-1/30 rounded-apple-lg p-4 mb-3 border border-apple-gray-2/50">
                              <div className="flex items-center justify-between mb-2">
                                <h6 className="font-sf font-semibold text-apple-gray-8 text-sm">
                                  {event.testCase.title}
                                </h6>
                                <span className="text-xs font-medium text-apple-blue bg-apple-blue/10 px-2 py-1 rounded-full">#{event.testCase.id}</span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                {event.testCase.project_name && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-apple-gray-5">Project:</span>
                                    <span className="font-medium text-apple-gray-7">{event.testCase.project_name}</span>
                                  </div>
                                )}
                                {event.testCase.test_suite_name && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-apple-gray-5">Suite:</span>
                                    <span className="font-medium text-apple-gray-7">{event.testCase.test_suite_name}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Event Metadata */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-apple-gray-5">
                                  <User className="w-3 h-3" />
                                  <span>{event.user}</span>
                                </div>
                                <div className="flex items-center gap-1 text-apple-gray-5">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimestamp(event.timestamp)}</span>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => onView(event.testCase)}
                                  className="h-6 w-6 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => onEdit(event.testCase)}
                                  className="h-6 w-6 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => onDelete(event.testCase)}
                                  className="h-6 w-6 p-0 text-apple-gray-5 hover:text-error hover:bg-error/10 transition-all duration-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {timelineEvents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2">No Timeline Events</h3>
          <p className="text-apple-gray-5">No test case events to display in the timeline.</p>
        </div>
      )}
    </div>
  );
};

export default TestCasesTimeline; 