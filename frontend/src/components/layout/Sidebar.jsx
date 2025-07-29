import React, { useState } from 'react';
import { X, Search, Folder, FileText, BarChart3, Settings, Upload, FolderOpen } from 'lucide-react';
import { Button, Input } from '../ui';

const Sidebar = ({ 
  onSearch,
  isOpen = true,
  onToggle
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/' },
    { id: 'testcases', label: 'Test Cases', icon: FileText, href: '/testcases' },
    { id: 'testsuites', label: 'Test Suites', icon: FolderOpen, href: '/test-suites' },
    { id: 'projects', label: 'Projects', icon: Folder, href: '/projects' },
    { id: 'reports', label: 'Reports', icon: BarChart3, href: '/reports' },
    { id: 'documents', label: 'Documents', icon: FileText, href: '/documents' },
    { id: 'import', label: 'Import', icon: Upload, href: '/import' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50
        w-80 bg-white border-r border-apple-gray-2
        transform transition-transform duration-300 ease-in-out
        flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-apple-gray-2 flex-shrink-0 h-16" data-element="sidebar-header">
          <h1 className="text-lg font-sf-display font-semibold text-apple-gray-7" data-element="sidebar-title">
            Test Manager
          </h1>
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={onToggle}
            className="lg:hidden"
            data-element="sidebar-close-button"
          />
        </div>

        {/* Search */}
        <div className="px-6 py-4 border-b border-apple-gray-2 flex-shrink-0" data-element="sidebar-search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-apple-gray-4" />
            <Input
              type="text"
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
              data-element="sidebar-search-input"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-6 py-4" data-element="sidebar-navigation">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className="
                    flex items-center px-3 py-2 rounded-apple text-sm font-medium
                    text-apple-gray-6 hover:text-apple-gray-7 hover:bg-apple-gray-2/50
                    transition-colors duration-200
                  "
                  data-element={`sidebar-nav-${item.id}`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-apple-gray-2 flex-shrink-0" data-element="sidebar-footer">
          <div className="text-xs text-apple-gray-4 text-center" data-element="sidebar-version">
            Test Case Manager v1.0
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 