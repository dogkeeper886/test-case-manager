import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = ({ 
  children,
  testSuites = [],
  onSuiteSelect,
  onTestCaseSelect,
  selectedSuiteId,
  selectedTestCaseId,
  onSearch,
  breadcrumbs = [],
  actions = [],
  showSearch = true
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-apple-gray-1 font-sf">
      {/* Sidebar */}
      <Sidebar
        testSuites={testSuites}
        onSuiteSelect={onSuiteSelect}
        onTestCaseSelect={onTestCaseSelect}
        selectedSuiteId={selectedSuiteId}
        selectedTestCaseId={selectedTestCaseId}
        onSearch={onSearch}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      {/* Main Content */}
      <div className="lg:ml-80">
        {/* Top Navigation */}
        <TopNav
          onMenuToggle={toggleSidebar}
          breadcrumbs={breadcrumbs}
          onSearch={onSearch}
          showSearch={showSearch}
          actions={actions}
        />

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 