import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Plus,
  Upload,
  BarChart3,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Button, Card } from '../components/ui';
import Layout from '../components/layout/Layout';
import { testCasesAPI, projectsAPI } from '../services/api';

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
  const [testSuites, setTestSuites] = useState([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);

  useEffect(() => {
    fetchDashboardData();
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

  const metricCards = [
    {
      name: 'Projects',
      value: stats.projects,
      icon: FolderOpen,
      color: 'bg-apple-blue',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/projects')
    },
    {
      name: 'Test Cases',
      value: stats.testCases,
      icon: FileText,
      color: 'bg-success',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/testcases')
    },
    {
      name: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'bg-apple-blue',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/reports')
    },
    {
      name: 'Pending',
      value: stats.pendingTests,
      icon: Clock,
      color: 'bg-warning',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/testcases?status=1')
    },
  ];

  const quickActions = [
    {
      label: 'Test Cases',
      description: 'Browse all test cases',
      icon: <FileText className="w-5 h-5" />,
      variant: 'primary',
      onClick: () => navigate('/testcases')
    },
    {
      label: 'Test Suites',
      description: 'Explore hierarchy',
      icon: <FolderOpen className="w-5 h-5" />,
      variant: 'secondary',
      onClick: () => navigate('/test-suites')
    },
    {
      label: 'Import',
      description: 'Upload documents',
      icon: <Upload className="w-5 h-5" />,
      variant: 'secondary',
      onClick: () => navigate('/documents')
    },
    {
      label: 'Reports',
      description: 'Generate reports',
      icon: <BarChart3 className="w-5 h-5" />,
      variant: 'secondary',
      onClick: () => navigate('/reports')
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'test-case',
      action: 'Test case "Network Configuration" was updated',
      time: '2 hours ago',
      link: '/testcases'
    },
    {
      id: 2,
      type: 'project',
      action: 'New project "Mobile Banking App" was created',
      time: '4 hours ago',
      link: '/projects'
    },
    {
      id: 3,
      type: 'test-suite',
      action: 'Test suite "Authentication" was imported',
      time: '1 day ago',
      link: '/test-suites'
    },
    {
      id: 4,
      type: 'report',
      action: 'Monthly test report was generated',
      time: '2 days ago',
      link: '/reports'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'test-case':
        return <FileText className="w-4 h-4 text-apple-blue" />;
      case 'project':
        return <FolderOpen className="w-4 h-4 text-success" />;
      case 'test-suite':
        return <FolderOpen className="w-4 h-4 text-warning" />;
      case 'report':
        return <BarChart3 className="w-4 h-4 text-apple-gray-5" />;
      default:
        return <Activity className="w-4 h-4 text-apple-gray-4" />;
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
  };

  // Handle search from layout
  const handleLayoutSearch = (query) => {
    console.log('Search query:', query);
    // Navigate to test cases with search
    navigate(`/testcases?search=${encodeURIComponent(query)}`);
  };

  return (
    <Layout
      testSuites={testSuites}
      onSuiteSelect={handleSuiteSelect}
      onTestCaseSelect={handleTestCaseSelect}
      selectedSuiteId={selectedSuiteId}
      selectedTestCaseId={selectedTestCaseId}
      onSearch={handleLayoutSearch}
      breadcrumbs={[
        { label: 'Dashboard', href: '/' }
      ]}
      actions={[
        {
          label: 'Add Test Case',
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => navigate('/testcases')
        }
      ]}
      showSearch={false}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="dashboard-header">
        <div className="flex items-center justify-between" data-element="dashboard-header-content">
          <div data-element="dashboard-title-section">
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7" data-element="dashboard-title">
              Dashboard
            </h1>
            <p className="text-apple-gray-5 mt-1" data-element="dashboard-subtitle">
              Overview of your test case management system
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metricCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.name} 
              elevation="sm" 
              hover={true}
              className="cursor-pointer transition-all duration-200 hover:shadow-apple-md group"
              onClick={stat.onClick}
            >
              <Card.Body className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-apple ${stat.color} ${stat.hoverColor} transition-colors duration-200`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-sf font-medium text-apple-gray-5">{stat.name}</p>
                    <p className="text-2xl font-sf-display font-semibold text-apple-gray-7">
                      {loading ? (
                        <span className="inline-block w-8 h-8 bg-apple-gray-2 rounded animate-pulse"></span>
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-apple-gray-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card elevation="sm">
          <Card.Header>
            <h3 className="text-xl font-sf font-semibold text-apple-gray-7">
              Recent Activity
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-apple hover:bg-apple-gray-2/50 cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(activity.link)}
                >
                  <div className="flex items-center space-x-3">
                    {getActivityIcon(activity.type)}
                    <span className="text-sm font-sf text-apple-gray-6">{activity.action}</span>
                  </div>
                  <span className="text-xs font-sf text-apple-gray-4">{activity.time}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-apple-gray-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/testcases')}
                  className="text-apple-blue hover:text-blue-600"
                >
                  View All Activity
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Quick Actions */}
        <Card elevation="sm">
          <Card.Header>
            <h3 className="text-xl font-sf font-semibold text-apple-gray-7">
              Quick Actions
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  className="w-full justify-start h-auto py-3 px-4"
                  onClick={action.onClick}
                >
                  <div className="flex items-center space-x-3">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-sf font-medium">{action.label}</div>
                      <div className="text-xs opacity-80">{action.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;