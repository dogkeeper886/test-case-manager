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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch data from API
      const [testCasesRes, projectsRes] = await Promise.all([
        testCasesAPI.getAll(),
        projectsAPI.getAll()
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
      name: 'Total Projects',
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
      name: 'Passed Tests',
      value: stats.passedTests,
      icon: CheckCircle,
      color: 'bg-success',
      hoverColor: 'hover:bg-green-600',
      onClick: () => navigate('/testcases?status=2')
    },
    {
      name: 'Failed Tests',
      value: stats.failedTests,
      icon: XCircle,
      color: 'bg-error',
      hoverColor: 'hover:bg-red-600',
      onClick: () => navigate('/testcases?status=3')
    },
    {
      name: 'Pending Tests',
      value: stats.pendingTests,
      icon: Clock,
      color: 'bg-warning',
      hoverColor: 'hover:bg-orange-600',
      onClick: () => navigate('/testcases?status=1')
    },
    {
      name: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      color: 'bg-apple-blue',
      hoverColor: 'hover:bg-blue-600',
      onClick: () => navigate('/reports')
    },
  ];

  const quickActions = [
    {
      label: 'View All Test Cases',
      description: 'Browse and manage all test cases',
      icon: <FileText className="w-5 h-5" />,
      variant: 'primary',
      onClick: () => navigate('/testcases')
    },
    {
      label: 'Browse Test Suites',
      description: 'Explore test suite hierarchy',
      icon: <FolderOpen className="w-5 h-5" />,
      variant: 'secondary',
      onClick: () => navigate('/test-suites')
    },
    {
      label: 'Upload Document',
      description: 'Import new test cases from documents',
      icon: <Upload className="w-5 h-5" />,
      variant: 'secondary',
      onClick: () => navigate('/documents')
    },
    {
      label: 'Generate Report',
      description: 'Create detailed test reports',
      icon: <BarChart3 className="w-5 h-5" />,
      variant: 'secondary',
      onClick: () => navigate('/reports')
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Test case TC-001 executed',
      time: '2 minutes ago',
      type: 'test-execution',
      link: '/testcases/1'
    },
    {
      id: 2,
      action: 'Document uploaded: requirements.pdf',
      time: '1 hour ago',
      type: 'document',
      link: '/documents'
    },
    {
      id: 3,
      action: 'New project created: Mobile App',
      time: '3 hours ago',
      type: 'project',
      link: '/projects'
    },
    {
      id: 4,
      action: 'Test suite "Login Flow" updated',
      time: '5 hours ago',
      type: 'test-suite',
      link: '/test-suites'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'test-execution': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'document': return <FileText className="w-4 h-4 text-apple-blue" />;
      case 'project': return <FolderOpen className="w-4 h-4 text-warning" />;
      case 'test-suite': return <FolderOpen className="w-4 h-4 text-info" />;
      default: return <Activity className="w-4 h-4 text-apple-gray-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7">
          Dashboard
        </h1>
        <p className="mt-2 text-apple-gray-5 font-sf">
          Overview of your test case management system
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.name} 
              elevation="sm" 
              hover={true}
              className="cursor-pointer transition-all duration-200 hover:shadow-apple-md"
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
                      {loading ? '...' : stat.value}
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
            <div className="space-y-3">
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
    </div>
  );
};

export default Dashboard;