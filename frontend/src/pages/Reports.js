import React from 'react';
import { BarChart3, PieChart, TrendingUp, Download, Filter, Calendar, Plus, FileText, Clock, Eye, Trash2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Reports = () => {
  const reportTypes = [
    {
      id: 'coverage',
      name: 'Test Coverage Report',
      description: 'Comprehensive test coverage analysis with detailed metrics',
      icon: PieChart,
      color: 'bg-apple-blue',
      dataElement: 'report-type-coverage'
    },
    {
      id: 'execution',
      name: 'Execution Summary',
      description: 'Test execution results and performance trends',
      icon: BarChart3,
      color: 'bg-success',
      dataElement: 'report-type-execution'
    },
    {
      id: 'performance',
      name: 'Performance Metrics',
      description: 'Test performance and efficiency analytics',
      icon: TrendingUp,
      color: 'bg-warning',
      dataElement: 'report-type-performance'
    },
    {
      id: 'defects',
      name: 'Defect Analysis',
      description: 'Bug tracking and defect trend analysis',
      icon: BarChart3,
      color: 'bg-error',
      dataElement: 'report-type-defects'
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Weekly Test Coverage - Jan 2024',
      type: 'Coverage',
      generated: '2024-01-28',
      format: 'PDF',
      size: '2.1 MB',
      status: 'completed',
      dataElement: 'recent-report-1'
    },
    {
      id: 2,
      name: 'E-commerce Platform - Execution Summary',
      type: 'Execution',
      generated: '2024-01-27',
      format: 'CSV',
      size: '0.8 MB',
      status: 'completed',
      dataElement: 'recent-report-2'
    },
    {
      id: 3,
      name: 'Mobile App - Performance Report',
      type: 'Performance',
      generated: '2024-01-26',
      format: 'PDF',
      size: '1.5 MB',
      status: 'completed',
      dataElement: 'recent-report-3'
    },
    {
      id: 4,
      name: 'API Testing - Defect Analysis',
      type: 'Defects',
      generated: '2024-01-25',
      format: 'Excel',
      size: '3.2 MB',
      status: 'completed',
      dataElement: 'recent-report-4'
    }
  ];

  const handleCreateReport = () => {
    console.log('Create report clicked');
    // TODO: Open create report modal or navigate to create form
  };

  const handleDownloadReport = (report) => {
    console.log('Download report:', report);
    // TODO: Implement download functionality
  };

  const handleViewReport = (report) => {
    console.log('View report:', report);
    // TODO: Open report viewer
  };

  const handleDeleteReport = (report) => {
    console.log('Delete report:', report);
    // TODO: Implement delete functionality
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
      showSearch={true}
      onSearch={handleLayoutSearch}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="reports-header">
        <div className="flex items-center justify-between" data-element="reports-header-content">
          <div data-element="reports-title-section">
            <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7" data-element="reports-title">
              Reports
            </h1>
            <p className="text-apple-gray-5 mt-2" data-element="reports-subtitle">
              Generate and manage test reports and analytics
            </p>
          </div>
          <div className="flex items-center gap-3" data-element="reports-actions">
            <Button
              variant="primary"
              onClick={handleCreateReport}
              data-element="reports-create-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="mb-8" data-element="reports-types-section">
        <h2 className="text-xl font-sf font-semibold text-apple-gray-7 mb-6" data-element="reports-types-title">
          Report Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-element="reports-types-grid">
          {reportTypes.map((type) => (
            <Card
              key={type.id}
              elevation="sm"
              hover="lift"
              className="cursor-pointer"
              onClick={() => handleCreateReport()}
              data-element={type.dataElement}
            >
              <div className="p-6" data-element={`${type.dataElement}-content`}>
                <div className="flex items-center justify-between mb-4" data-element={`${type.dataElement}-header`}>
                  <div className={`p-3 rounded-apple-lg ${type.color} text-white`} data-element={`${type.dataElement}-icon`}>
                    <type.icon className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-2" data-element={`${type.dataElement}-name`}>
                  {type.name}
                </h3>
                <p className="text-sm text-apple-gray-5" data-element={`${type.dataElement}-description`}>
                  {type.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div data-element="reports-recent-section">
        <div className="flex items-center justify-between mb-6" data-element="reports-recent-header">
          <h2 className="text-xl font-sf font-semibold text-apple-gray-7" data-element="reports-recent-title">
            Recent Reports
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('View all reports')}
            data-element="reports-view-all"
          >
            View All
          </Button>
        </div>

        <div className="space-y-4" data-element="reports-recent-list">
              {recentReports.map((report) => (
            <Card
              key={report.id}
              elevation="sm"
              className="hover:shadow-apple-md transition-all duration-200"
              data-element={report.dataElement}
            >
              <div className="p-6" data-element={`${report.dataElement}-content`}>
                <div className="flex items-center justify-between" data-element={`${report.dataElement}-header`}>
                  <div className="flex items-center space-x-4" data-element={`${report.dataElement}-info`}>
                    <div className={`p-2 rounded-apple ${getReportTypeColor(report.type)} text-white`} data-element={`${report.dataElement}-type-icon`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0" data-element={`${report.dataElement}-details`}>
                      <h3 className="text-lg font-sf font-semibold text-apple-gray-7 truncate" data-element={`${report.dataElement}-name`}>
                        {report.name}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1" data-element={`${report.dataElement}-meta`}>
                        <span className="text-sm text-apple-gray-5" data-element={`${report.dataElement}-type`}>
                    {report.type}
                        </span>
                        <span className="text-sm text-apple-gray-5" data-element={`${report.dataElement}-format`}>
                    {report.format}
                        </span>
                        <span className="text-sm text-apple-gray-5" data-element={`${report.dataElement}-size`}>
                    {report.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2" data-element={`${report.dataElement}-actions`}>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleViewReport(report)}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                      data-element={`${report.dataElement}-view`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDownloadReport(report)}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-apple-blue hover:bg-apple-blue/10 transition-all duration-200"
                      data-element={`${report.dataElement}-download`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteReport(report)}
                      className="h-8 w-8 p-0 text-apple-gray-5 hover:text-error hover:bg-error/10 transition-all duration-200"
                      data-element={`${report.dataElement}-delete`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-apple-gray-2" data-element={`${report.dataElement}-footer`}>
                  <div className="flex items-center space-x-4 text-xs text-apple-gray-4" data-element={`${report.dataElement}-metadata`}>
                    <div className="flex items-center space-x-1" data-element={`${report.dataElement}-generated`}>
                      <Calendar className="w-3 h-3" />
                      <span>Generated {report.generated}</span>
                    </div>
                    <div className="flex items-center space-x-1" data-element={`${report.dataElement}-status`}>
                      <div className={`w-2 h-2 rounded-full ${report.status === 'completed' ? 'bg-success' : 'bg-warning'}`}></div>
                      <span className="capitalize">{report.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
              ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8" data-element="reports-stats-section">
        <Card elevation="sm" data-element="reports-stats-card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6" data-element="reports-stats-grid">
            <div className="text-center" data-element="reports-stats-total">
              <p className="text-2xl font-sf font-bold text-apple-gray-7" data-element="reports-stats-total-count">
                {recentReports.length}
              </p>
              <p className="text-sm text-apple-gray-5" data-element="reports-stats-total-label">
                Total Reports
              </p>
            </div>
            <div className="text-center" data-element="reports-stats-this-week">
              <p className="text-2xl font-sf font-bold text-success" data-element="reports-stats-this-week-count">
                4
              </p>
              <p className="text-sm text-apple-gray-5" data-element="reports-stats-this-week-label">
                This Week
              </p>
            </div>
            <div className="text-center" data-element="reports-stats-pdf">
              <p className="text-2xl font-sf font-bold text-apple-blue" data-element="reports-stats-pdf-count">
                2
              </p>
              <p className="text-sm text-apple-gray-5" data-element="reports-stats-pdf-label">
                PDF Reports
              </p>
            </div>
            <div className="text-center" data-element="reports-stats-csv">
              <p className="text-2xl font-sf font-bold text-warning" data-element="reports-stats-csv-count">
                1
              </p>
              <p className="text-sm text-apple-gray-5" data-element="reports-stats-csv-label">
                CSV Reports
              </p>
            </div>
          </div>
      </Card>
      </div>
    </Layout>
  );
};

// Helper function to get report type color
const getReportTypeColor = (type) => {
  switch (type.toLowerCase()) {
    case 'coverage':
      return 'bg-apple-blue';
    case 'execution':
      return 'bg-success';
    case 'performance':
      return 'bg-warning';
    case 'defects':
      return 'bg-error';
    default:
      return 'bg-apple-gray-4';
  }
};

export default Reports;