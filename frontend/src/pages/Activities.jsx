import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  FileText, 
  FolderOpen, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Upload,
  Download,
  Filter,
  Search,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';
import { activitiesAPI } from '../services/api';

const Activities = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedEntity, setSelectedEntity] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 20;

  useEffect(() => {
    fetchActivities();
  }, [currentPage, searchQuery, selectedType, selectedEntity]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await activitiesAPI.getRecent(itemsPerPage, offset);
      const activitiesData = response.data.data || [];
      
      setActivities(activitiesData);
      setTotalActivities(response.data.pagination?.total || activitiesData.length);
      setTotalPages(Math.ceil((response.data.pagination?.total || activitiesData.length) / itemsPerPage));
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (iconName) => {
    switch (iconName) {
      case 'FileText':
        return <FileText className="w-4 h-4 text-apple-blue" />;
      case 'FolderOpen':
        return <FolderOpen className="w-4 h-4 text-success" />;
      case 'CheckCircle':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'BarChart3':
        return <BarChart3 className="w-4 h-4 text-apple-gray-5" />;
      case 'Upload':
        return <Upload className="w-4 h-4 text-warning" />;
      case 'Download':
        return <Download className="w-4 h-4 text-apple-blue" />;
      default:
        return <Activity className="w-4 h-4 text-apple-gray-4" />;
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

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const handleActivityClick = (activity) => {
    navigate(`/activities/${activity.id}`);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleEntityFilter = (entity) => {
    setSelectedEntity(entity);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !searchQuery || 
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.entity_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || activity.action_type.includes(selectedType);
    const matchesEntity = selectedEntity === 'all' || activity.entity_type === selectedEntity;
    
    return matchesSearch && matchesType && matchesEntity;
  });

  const activityTypes = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: 'Created' },
    { value: 'update', label: 'Updated' },
    { value: 'delete', label: 'Deleted' },
    { value: 'import', label: 'Import' }
  ];

  const entityTypes = [
    { value: 'all', label: 'All Entities' },
    { value: 'project', label: 'Projects' },
    { value: 'test_case', label: 'Test Cases' },
    { value: 'test_suite', label: 'Test Suites' },
    { value: 'import', label: 'Imports' }
  ];

  if (loading && activities.length === 0) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Activities', href: '/activities' }
        ]}
        showSearch={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue mx-auto mb-4"></div>
            <p className="text-apple-gray-5">Loading activities...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        { label: 'Activities', href: '/activities' }
      ]}
      showSearch={false}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="activities-header">
        <div className="flex items-center justify-between" data-element="activities-header-content">
          <div data-element="activities-title-section">
            <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7" data-element="activities-title">
              Activity Log
            </h1>
            <p className="text-apple-gray-5 mt-2" data-element="activities-subtitle">
              Track all system activities and user actions
            </p>
          </div>
          <div className="flex items-center space-x-3" data-element="activities-actions">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              data-element="activities-filter-toggle"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6" data-element="activities-search-filters">
        <div className="flex flex-col lg:flex-row gap-4" data-element="activities-search-row">
          <div className="flex-1" data-element="activities-search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-apple-gray-4" />
              <Input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
                data-element="activities-search-input"
              />
            </div>
          </div>
          
          {showFilters && (
            <div className="flex flex-col lg:flex-row gap-4" data-element="activities-filters">
              <div className="flex flex-wrap gap-2" data-element="activities-type-filters">
                {activityTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handleTypeFilter(type.value)}
                    data-element={`activities-filter-${type.value}`}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2" data-element="activities-entity-filters">
                {entityTypes.map((entity) => (
                  <Button
                    key={entity.value}
                    variant={selectedEntity === entity.value ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handleEntityFilter(entity.value)}
                    data-element={`activities-entity-${entity.value}`}
                  >
                    {entity.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4" data-element="activities-list">
        {filteredActivities.length === 0 ? (
          <Card elevation="sm" data-element="activities-empty">
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-apple-gray-4 mx-auto mb-4" />
              <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2">
                No activities found
              </h3>
              <p className="text-apple-gray-5">
                {searchQuery || selectedType !== 'all' || selectedEntity !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'No activities have been logged yet'
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredActivities.map((activity) => (
            <Card
              key={activity.id}
              elevation="sm"
              hover="lift"
              className="cursor-pointer transition-all duration-200"
              onClick={() => handleActivityClick(activity)}
              data-element={`activity-item-${activity.id}`}
            >
              <div className="flex items-start space-x-4 p-4" data-element={`activity-content-${activity.id}`}>
                <div className="flex-shrink-0 mt-1" data-element={`activity-icon-${activity.id}`}>
                  {getActivityIcon(activity.icon)}
                </div>
                
                <div className="flex-1 min-w-0" data-element={`activity-info-${activity.id}`}>
                  <div className="flex items-center justify-between mb-2" data-element={`activity-header-${activity.id}`}>
                    <div className="flex items-center space-x-3" data-element={`activity-title-${activity.id}`}>
                      <h3 className="text-sm font-sf font-medium text-apple-gray-7" data-element={`activity-name-${activity.id}`}>
                        {activity.display_name || activity.action_type}
                      </h3>
                      {getStatusBadge(activity.action_type)}
                    </div>
                    <div className="flex items-center space-x-2" data-element={`activity-meta-${activity.id}`}>
                      <span className="text-xs text-apple-gray-4" data-element={`activity-time-${activity.id}`}>
                        {formatTimeAgo(activity.created_at)}
                      </span>
                      <Eye className="w-3 h-3 text-apple-gray-4" />
                    </div>
                  </div>
                  
                  <p className="text-xs text-apple-gray-5 mb-2" data-element={`activity-description-${activity.id}`}>
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center space-x-4" data-element={`activity-details-${activity.id}`}>
                    <div className="flex items-center space-x-1" data-element={`activity-user-${activity.id}`}>
                      <User className="w-3 h-3 text-apple-gray-4" />
                      <span className="text-xs text-apple-gray-4">{activity.user_id}</span>
                    </div>
                    
                    {activity.entity_name && (
                      <div className="flex items-center space-x-1" data-element={`activity-entity-${activity.id}`}>
                        <span className="text-xs text-apple-gray-4">
                          {activity.entity_type.replace('_', ' ')}:
                        </span>
                        <span className="text-xs font-sf font-medium text-apple-gray-6">
                          {activity.entity_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between" data-element="activities-pagination">
          <div className="text-sm text-apple-gray-5" data-element="activities-pagination-info">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalActivities)} of {totalActivities} activities
          </div>
          
          <div className="flex items-center space-x-2" data-element="activities-pagination-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              data-element="activities-pagination-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center space-x-1" data-element="activities-pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (page > totalPages) return null;
                
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    data-element={`activities-pagination-page-${page}`}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              data-element="activities-pagination-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Activities; 