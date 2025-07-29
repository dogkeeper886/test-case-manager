import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  FileText, 
  Clock,
  TrendingUp,
  ArrowRight,
  Activity,
  BarChart3,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Button, Card } from '../components/ui';
import Layout from '../components/layout/Layout';
import { testCasesAPI, projectsAPI, activitiesAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    projects: 0,
    testCases: 0,
    passedTests: 0,
    failedTests: 0,
    pendingTests: 0,
    successRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [testSuites, setTestSuites] = useState([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchActivities();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data from API
      const [testCasesRes, projectsRes, testSuitesRes] = await Promise.all([
        testCasesAPI.getAll({ limit: 1000 }), // Get all test cases for accurate statistics
        projectsAPI.getAll(),
        testCasesAPI.getAll({ limit: 1000 }) // We'll use this for test suites data
      ]);

      const testCases = testCasesRes.data.data || testCasesRes.data || [];
      const projects = projectsRes.data.data || projectsRes.data || [];

      // Calculate statistics
      const passedTests = testCases.filter(tc => tc.status === 2).length;
      const failedTests = testCases.filter(tc => tc.status === 3).length;
      const pendingTests = testCases.filter(tc => tc.status === 1).length;
      const successRate = testCases.length > 0 ? Math.round((passedTests / testCases.length) * 100) : 0;

      setStats({
        projects: projects.length,
        testCases: testCases.length,
        passedTests,
        failedTests,
        pendingTests,
        successRate
      });

      // Set test suites for sidebar (we'll use test cases data for now)
      setTestSuites([]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use fallback data
      setStats({
        projects: 12,
        testCases: 248,
        passedTests: 195,
        failedTests: 23,
        pendingTests: 30,
        successRate: 89
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await activitiesAPI.getRecent(10, 0);
      const activitiesData = response.data.data || [];
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Use fallback data if API fails
      setActivities([
        {
          id: 1,
          action_type: 'test_case_create',
          entity_type: 'test_case',
          entity_name: 'Login Test Case',
          description: 'Test case "Login Test Case" was created',
          user_id: 'system',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          display_name: 'Test Case Created',
          icon: 'FileText',
          color: 'success'
        },
        {
          id: 2,
          action_type: 'project_create',
          entity_type: 'project',
          entity_name: 'E-commerce Platform',
          description: 'Project "E-commerce Platform" was created',
          user_id: 'system',
          created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          display_name: 'Project Created',
          icon: 'FolderOpen',
          color: 'success'
        },
        {
          id: 3,
          action_type: 'import_complete',
          entity_type: 'import',
          entity_name: null,
          description: 'TestLink XML import completed successfully. Imported 5 test suites and 23 test cases.',
          user_id: 'system',
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          display_name: 'Import Completed',
          icon: 'CheckCircle',
          color: 'success'
        },
        {
          id: 4,
          action_type: 'test_case_update',
          entity_type: 'test_case',
          entity_name: 'API Test Suite',
          description: 'Test case "API Test Suite" was updated',
          user_id: 'system',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          display_name: 'Test Case Updated',
          icon: 'FileText',
          color: 'apple-blue'
        }
      ]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const metricCards = [
    {
      name: 'Projects',
      value: stats.projects,
      icon: FolderOpen,
      color: 'bg-apple-blue',
      onClick: () => navigate('/projects'),
      dataElement: 'dashboard-projects-card'
    },
    {
      name: 'Test Cases',
      value: stats.testCases,
      icon: FileText,
      color: 'bg-success',
      onClick: () => navigate('/testcases'),
      dataElement: 'dashboard-testcases-card'
    }
  ];

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
        return <Activity className="w-4 h-4 text-warning" />;
      case 'Download':
        return <Activity className="w-4 h-4 text-apple-blue" />;
      default:
        return <Activity className="w-4 h-4 text-apple-gray-4" />;
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
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Handle suite selection from sidebar
  const handleSuiteSelect = (suite) => {
    console.log('Selected suite:', suite);
    setSelectedSuiteId(suite.id);
  };

  // Handle test case selection from sidebar
  const handleTestCaseSelect = (testCase) => {
    console.log('Selected test case from tree:', testCase);
    setSelectedTestCaseId(testCase.id);
    // Navigate to test case detail page
    navigate(`/testcases/${testCase.id}`);
  };

  if (loading) {
    return (
      <Layout
        breadcrumbs={[
          { label: 'Dashboard', href: '/' }
        ]}
        showSearch={false}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue mx-auto mb-4"></div>
            <p className="text-apple-gray-5">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      breadcrumbs={[
        { label: 'Dashboard', href: '/' }
      ]}
      showSearch={false}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="dashboard-header">
        <div className="flex items-center justify-between" data-element="dashboard-header-content">
          <div data-element="dashboard-title-section">
            <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7" data-element="dashboard-title">
              Dashboard
            </h1>
            <p className="text-apple-gray-5 mt-2" data-element="dashboard-subtitle">
              Welcome back! Here's an overview of your test case management system.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" data-element="dashboard-metrics">
        {metricCards.map((metric, index) => (
          <Card
            key={metric.name}
            elevation="sm"
            hover="clean"
            onClick={metric.onClick}
            className="cursor-pointer"
            data-element={metric.dataElement}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-sf font-bold text-apple-gray-7" data-element={`${metric.dataElement}-value`}>
                  {metric.value}
                </p>
                <p className="text-sm text-apple-gray-5 mt-1" data-element={`${metric.dataElement}-label`}>
                  {metric.name}
                </p>
              </div>
              <div className={`p-3 rounded-apple-lg ${metric.color} text-white`} data-element={`${metric.dataElement}-icon`}>
                <metric.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div data-element="dashboard-activity-section">
        <Card elevation="sm" hover="clean" data-element="dashboard-activity-card">
          <div className="flex items-center justify-between mb-6" data-element="dashboard-activity-header">
            <h2 className="text-xl font-sf font-semibold text-apple-gray-7" data-element="dashboard-activity-title">
              Recent Activity
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/activities')}
              data-element="dashboard-activity-view-all"
            >
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {activitiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-apple-blue"></div>
              <span className="ml-2 text-apple-gray-5">Loading activities...</span>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-apple-gray-4 mx-auto mb-2" />
              <p className="text-apple-gray-5">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3" data-element="dashboard-activity-list">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="group relative flex items-start space-x-3 p-4 rounded-apple-lg border border-transparent hover:shadow-apple-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:ring-offset-2 transition-all duration-200 ease-out cursor-pointer"
                  onClick={() => navigate(`/activities/${activity.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(`/activities/${activity.id}`);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View details for ${activity.display_name || activity.action_type}`}
                  data-element={`dashboard-activity-${activity.id}`}
                >
                  <div className="flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-200 ease-out" data-element={`dashboard-activity-${activity.id}-icon`}>
                    {getActivityIcon(activity.icon)}
                  </div>
                  <div className="flex-1 min-w-0" data-element={`dashboard-activity-${activity.id}-content`}>
                    <p className="text-sm font-sf font-medium text-apple-gray-7 transition-colors duration-200" data-element={`dashboard-activity-${activity.id}-title`}>
                      {activity.display_name || activity.action_type}
                    </p>
                    <p className="text-xs text-apple-gray-5 mt-1" data-element={`dashboard-activity-${activity.id}-description`}>
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2" data-element={`dashboard-activity-${activity.id}-meta`}>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-apple-gray-4" data-element={`dashboard-activity-${activity.id}-user`}>
                          {activity.user_id}
                        </span>
                        <span className="text-xs text-apple-gray-4" data-element={`dashboard-activity-${activity.id}-time`}>
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-apple-gray-3 group-hover:translate-x-1 transition-all duration-200 ease-out" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;