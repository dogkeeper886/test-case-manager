import React from 'react';
import { Plus, Search, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';

const TestCases = () => {
  const testCases = [
    {
      id: 'TC-001',
      title: 'User Login Functionality',
      description: 'Verify that users can login with valid credentials',
      priority: 'High',
      status: 'Passed',
      project: 'E-commerce Platform',
      created: '2024-01-20',
    },
    {
      id: 'TC-002',
      title: 'Password Reset',
      description: 'Verify password reset functionality via email',
      priority: 'Medium',
      status: 'Failed',
      project: 'E-commerce Platform',
      created: '2024-01-21',
    },
    {
      id: 'TC-003',
      title: 'Product Search',
      description: 'Verify product search returns relevant results',
      priority: 'High',
      status: 'Pending',
      project: 'E-commerce Platform',
      created: '2024-01-22',
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Cases</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and execute your test cases
            </p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            New Test Case
          </button>
        </div>
      </div>

      <div className="mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search test cases..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Case
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {testCases.map((testCase) => (
              <tr key={testCase.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{testCase.id}</div>
                    <div className="text-sm text-gray-900">{testCase.title}</div>
                    <div className="text-sm text-gray-500">{testCase.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    testCase.priority === 'High' 
                      ? 'bg-red-100 text-red-800' 
                      : testCase.priority === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {testCase.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(testCase.status)}
                    <span className="ml-2 text-sm text-gray-900">{testCase.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {testCase.project}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {testCase.created}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-4">Execute</button>
                  <button className="text-green-600 hover:text-green-900 mr-4">Edit</button>
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

export default TestCases;