import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, Calendar } from 'lucide-react';

const Reports = () => {
  const reportTypes = [
    {
      id: 'coverage',
      name: 'Test Coverage Report',
      description: 'Comprehensive test coverage analysis',
      icon: PieChart,
      color: 'bg-blue-500',
    },
    {
      id: 'execution',
      name: 'Execution Summary',
      description: 'Test execution results and trends',
      icon: BarChart3,
      color: 'bg-green-500',
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      description: 'Test performance and efficiency metrics',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Weekly Test Coverage - Jan 2024',
      type: 'Coverage',
      generated: '2024-01-28',
      format: 'PDF',
      size: '2.1 MB',
    },
    {
      id: 2,
      name: 'E-commerce Platform - Execution Summary',
      type: 'Execution',
      generated: '2024-01-27',
      format: 'CSV',
      size: '0.8 MB',
    },
    {
      id: 3,
      name: 'Mobile App - Performance Report',
      type: 'Performance',
      generated: '2024-01-26',
      format: 'PDF',
      size: '1.5 MB',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generate and manage test reports and analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <div key={report.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-full ${report.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">{report.description}</p>
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                Generate Report
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Report Filters</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">All Projects</option>
                <option value="ecommerce">E-commerce Platform</option>
                <option value="mobile">Mobile Banking App</option>
                <option value="crm">CRM System</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Reports</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generated
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Format
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{report.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.generated}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.format}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {report.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900 mr-4">View</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;