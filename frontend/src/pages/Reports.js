import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, Calendar, Plus } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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

  const handleCreateReport = () => {
    console.log('Create report clicked');
    // TODO: Open create report modal or navigate to create form
    // For now, show a placeholder alert
    alert('Create Report functionality will be implemented here');
  };

  const handleLayoutSearch = (query) => {
    console.log('Layout search:', query);
    // TODO: Implement global search
  };

  return (
    <Layout
      breadcrumbs={[
        { label: 'Reports', href: '/reports' }
      ]}
      actions={[
        {
          label: 'Create Report',
          variant: 'primary',
          icon: <Plus className="w-4 h-4" />,
          onClick: () => handleCreateReport()
        }
      ]}
      showSearch={false}
    >
      {/* Page Header */}
      <div className="mb-6" data-element="reports-header">
        <div className="flex items-center justify-between" data-element="reports-header-content">
          <div data-element="reports-title-section">
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7" data-element="reports-title">
              Reports
            </h1>
            <p className="text-apple-gray-5 mt-1" data-element="reports-subtitle">
              Generate and manage test reports and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-element="reports-types-grid">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.id} elevation="md" className="cursor-pointer" data-element={`report-type-card-${report.id}`}>
              <Card.Header>
                <div className="flex items-center" data-element={`report-type-header-${report.id}`}>
                  <div className={`p-3 rounded-full ${report.color}`} data-element={`report-type-icon-${report.id}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4" data-element={`report-type-title-container-${report.id}`}>
                    <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element={`report-type-title-${report.id}`}>
                      {report.name}
                    </h3>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-apple-gray-5 mb-4" data-element={`report-type-description-${report.id}`}>
                  {report.description}
                </p>
                <Button 
                  variant="primary" 
                  className="w-full" 
                  data-element={`report-type-generate-button-${report.id}`}
                >
                  Generate Report
                </Button>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {/* Report Filters */}
      <Card elevation="sm" padding="lg" className="mb-8" data-element="reports-filters-card">
        <Card.Header>
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="reports-filters-title">
            Report Filters
          </h3>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-element="reports-filters-content">
            <div data-element="reports-project-filter">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="reports-project-label">
                Project
              </label>
              <select 
                className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                data-element="reports-project-select"
              >
                <option value="">All Projects</option>
                <option value="ecommerce">E-commerce Platform</option>
                <option value="mobile">Mobile Banking App</option>
                <option value="crm">CRM System</option>
              </select>
            </div>
            <div data-element="reports-date-filter">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="reports-date-label">
                Date Range
              </label>
              <div className="relative" data-element="reports-date-input-container">
                <Calendar className="w-5 h-5 absolute left-3 top-3 text-apple-gray-4" />
                <input
                  type="date"
                  className="w-full pl-10 pr-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                  data-element="reports-date-input"
                />
              </div>
            </div>
            <div data-element="reports-format-filter">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="reports-format-label">
                Format
              </label>
              <select 
                className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                data-element="reports-format-select"
              >
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Recent Reports */}
      <Card elevation="sm" className="overflow-hidden" data-element="reports-table-card">
        <Card.Header>
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="reports-table-title">
            Recent Reports
          </h3>
        </Card.Header>
        <Card.Body className="p-0">
          <table className="min-w-full divide-y divide-apple-gray-2" data-element="reports-table">
            <thead className="bg-apple-gray-1" data-element="reports-table-header">
              <tr data-element="reports-table-header-row">
                <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-6 uppercase tracking-wider" data-element="reports-table-header-name">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-6 uppercase tracking-wider" data-element="reports-table-header-type">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-6 uppercase tracking-wider" data-element="reports-table-header-generated">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-6 uppercase tracking-wider" data-element="reports-table-header-format">
                  Format
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-6 uppercase tracking-wider" data-element="reports-table-header-size">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-apple-gray-6 uppercase tracking-wider" data-element="reports-table-header-actions">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-apple-gray-2" data-element="reports-table-body">
              {recentReports.map((report) => (
                <tr key={report.id} className="hover:bg-apple-gray-1" data-element={`reports-table-row-${report.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap" data-element={`reports-table-name-${report.id}`}>
                    <div className="text-sm font-medium text-apple-gray-7" data-element={`reports-table-name-text-${report.id}`}>
                      {report.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`reports-table-type-${report.id}`}>
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`reports-table-generated-${report.id}`}>
                    {report.generated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`reports-table-format-${report.id}`}>
                    {report.format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-apple-gray-7" data-element={`reports-table-size-${report.id}`}>
                    {report.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" data-element={`reports-table-actions-${report.id}`}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={<Download className="w-4 h-4" />}
                      className="mr-2"
                      data-element={`reports-table-download-${report.id}`}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="mr-2"
                      data-element={`reports-table-view-${report.id}`}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-element={`reports-table-delete-${report.id}`}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card.Body>
      </Card>
    </Layout>
  );
};

export default Reports;