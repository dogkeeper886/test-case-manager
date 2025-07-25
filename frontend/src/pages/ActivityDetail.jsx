import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  User, 
  FileText, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  BarChart3,
  Upload,
  Download
} from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import Layout from '../components/layout/Layout';
import { activitiesAPI } from '../services/api';

const ActivityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActivityDetail();
  }, [id]);

  const fetchActivityDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await activitiesAPI.getById(id);
      const activityData = response.data.data;
      
      if (activityData) {
        setActivity(activityData);
      } else {
        setError('Activity not found');
      }
    } catch (error) {
      console.error('Error fetching activity detail:', error);
      setError('Failed to load activity details');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (iconName, size = 'w-6 h-6') => {
    const iconClass = `${size} text-apple-gray-5`;
    
    switch (iconName) {
      case 'FileText':
        return <FileText className={iconClass} />;
      case 'FolderOpen':
        return <FolderOpen className={iconClass} />;
      case 'CheckCircle':
        return <CheckCircle className={iconClass} />;
      case 'BarChart3':
        return <BarChart3 className={iconClass} />;
      case 'Upload':
        return <Upload className={iconClass} />;
      case 'Download':
        return <Download className={iconClass} />;
      default:
        return <Activity className={iconClass} />;
    }
  };

  const getStatusBadge = (actionType) => {
    switch (actionType) {
      case 'project_create':
      case 'test_case_create':
      case 'test_suite_create':
      case 'import_complete':
        return <Badge variant="success">Created</Badge>;
      case 'project_update':
      case 'test_case_update':
      case 'test_suite_update':
        return <Badge variant="default">Updated</Badge>;
      case 'project_delete':
      case 'test_case_delete':
      case 'test_suite_delete':
        return <Badge variant="error">Deleted</Badge>;
      case 'import_start':
        return <Badge variant="warning">In Progress</Badge>;
      case 'import_failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="default">Action</Badge>;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return {
      full: date.toLocaleString(),
      relative: getRelativeTime(date),
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleViewEntity = () => {
    if (!activity) return;
    
    switch (activity.entity_type) {
      case 'project':
        navigate(`/projects/${activity.entity_id}`);
        break;
      case 'test_case':
        navigate(`/testcases/${activity.entity_id}`);
        break;
      case 'test_suite':
        navigate(`/test-suites/${activity.entity_id}`);
        break;
      default:
        // For import activities, go back to import page
        navigate('/import');
    }
  };

  if (loading) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Activities', href: '/activities' },
          { label: 'Loading...', href: '#' }
        ]}
        showSearch={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue mx-auto mb-4"></div>
            <p className="text-apple-gray-5">Loading activity details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !activity) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Activities', href: '/activities' },
          { label: 'Error', href: '#' }
        ]}
        showSearch={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
            <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-2">
              {error || 'Activity not found'}
            </h2>
            <p className="text-apple-gray-5 mb-4">
              The activity you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="primary" onClick={handleBackClick}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const timestamp = formatTimestamp(activity.created_at);

  return (
    <Layout
      breadcrumbs={[
        { label: 'Activities', href: '/activities' },
        { label: activity.display_name || activity.action_type, href: '#' }
      ]}
      showSearch={false}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="activity-detail-header">
        <div className="flex items-center justify-between" data-element="activity-detail-header-content">
          <div className="flex items-center space-x-4" data-element="activity-detail-title-section">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              data-element="activity-detail-back-button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div data-element="activity-detail-title">
              <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7" data-element="activity-detail-title-text">
                {activity.display_name || activity.action_type}
              </h1>
              <p className="text-apple-gray-5 mt-2" data-element="activity-detail-subtitle">
                Activity details and information
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3" data-element="activity-detail-actions">
            {getStatusBadge(activity.action_type)}
            {activity.entity_id && (
              <Button
                variant="primary"
                onClick={handleViewEntity}
                data-element="activity-detail-view-entity"
              >
                View {activity.entity_type.replace('_', ' ')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Activity Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" data-element="activity-detail-content">
        {/* Main Activity Information */}
        <div className="lg:col-span-2" data-element="activity-detail-main">
          <Card elevation="sm" data-element="activity-detail-card">
            <div className="flex items-start space-x-4 p-6" data-element="activity-detail-content">
              <div className="flex-shrink-0" data-element="activity-detail-icon">
                {getActivityIcon(activity.icon, 'w-12 h-12')}
              </div>
              <div className="flex-1 min-w-0" data-element="activity-detail-info">
                <div className="flex items-center space-x-3 mb-4" data-element="activity-detail-header">
                  <h2 className="text-xl font-sf font-semibold text-apple-gray-7" data-element="activity-detail-name">
                    {activity.display_name || activity.action_type}
                  </h2>
                  {getStatusBadge(activity.action_type)}
                </div>
                
                <p className="text-apple-gray-6 mb-4" data-element="activity-detail-description">
                  {activity.description}
                </p>

                {activity.entity_name && (
                  <div className="mb-4" data-element="activity-detail-entity">
                    <h3 className="text-sm font-sf font-medium text-apple-gray-5 mb-2">
                      Related {activity.entity_type.replace('_', ' ')}:
                    </h3>
                    <p className="text-apple-gray-7 font-sf font-medium">
                      {activity.entity_name}
                    </p>
                  </div>
                )}

                {activity.metadata && (
                  <div className="mb-4" data-element="activity-detail-metadata">
                    <h3 className="text-sm font-sf font-medium text-apple-gray-5 mb-2">
                      Additional Information:
                    </h3>
                    <pre className="text-xs bg-apple-gray-1 p-3 rounded-apple overflow-x-auto">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Metadata */}
        <div data-element="activity-detail-sidebar">
          <Card elevation="sm" data-element="activity-detail-metadata-card">
            <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-4" data-element="activity-detail-metadata-title">
              Activity Information
            </h3>
            
            <div className="space-y-4" data-element="activity-detail-metadata-list">
              <div className="flex items-center space-x-3" data-element="activity-detail-timestamp">
                <Clock className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {timestamp.relative}
                  </p>
                  <p className="text-xs text-apple-gray-4">
                    {timestamp.full}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3" data-element="activity-detail-user">
                <User className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {activity.user_id}
                  </p>
                  <p className="text-xs text-apple-gray-4">
                    User
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3" data-element="activity-detail-type">
                <Activity className="w-4 h-4 text-apple-gray-4" />
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {activity.action_type}
                  </p>
                  <p className="text-xs text-apple-gray-4">
                    Action Type
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3" data-element="activity-detail-entity-type">
                {getActivityIcon(activity.icon, 'w-4 h-4')}
                <div>
                  <p className="text-sm font-sf font-medium text-apple-gray-7">
                    {activity.entity_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-apple-gray-4">
                    Entity Type
                  </p>
                </div>
              </div>

              {activity.entity_id && (
                <div className="flex items-center space-x-3" data-element="activity-detail-entity-id">
                  <div className="w-4 h-4 bg-apple-gray-3 rounded-full flex items-center justify-center">
                    <span className="text-xs text-apple-gray-6 font-sf font-medium">
                      #
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-sf font-medium text-apple-gray-7">
                      {activity.entity_id}
                    </p>
                    <p className="text-xs text-apple-gray-4">
                      Entity ID
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityDetail; 