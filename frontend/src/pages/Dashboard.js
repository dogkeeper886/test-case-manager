import React from 'react';
import { 
  FolderOpen, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp 
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      name: 'Total Projects',
      value: '12',
      icon: FolderOpen,
      color: 'bg-blue-500',
    },
    {
      name: 'Test Cases',
      value: '248',
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      name: 'Passed Tests',
      value: '195',
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      name: 'Failed Tests',
      value: '23',
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      name: 'Pending Tests',
      value: '30',
      icon: Clock,
      color: 'bg-yellow-500',
    },
    {
      name: 'Success Rate',
      value: '89%',
      icon: TrendingUp,
      color: 'bg-indigo-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your test case management system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Test case TC-001 executed</span>
              <span className="text-xs text-gray-400">2 minutes ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Document uploaded: requirements.pdf</span>
              <span className="text-xs text-gray-400">1 hour ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">New project created: Mobile App</span>
              <span className="text-xs text-gray-400">3 hours ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
              Upload New Document
            </button>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors">
              Create Test Case
            </button>
            <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;