import React from 'react';
import { Menu, Bell, Settings, User, Search } from 'lucide-react';
import { Button, Input } from '../ui';

const TopNav = ({ 
  onMenuToggle,
  breadcrumbs = [],
  onSearch,
  showSearch = true,
  actions = []
}) => {
  return (
    <div className="bg-white border-b border-apple-gray-2 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Menu className="w-5 h-5" />}
            onClick={onMenuToggle}
            className="lg:hidden"
          />

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center space-x-2">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && (
                  <span className="text-apple-gray-4">/</span>
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-sm font-medium text-apple-gray-7">
                    {crumb.label}
                  </span>
                ) : (
                  <a
                    href={crumb.href}
                    className="text-sm text-apple-gray-5 hover:text-apple-gray-7 transition-colors"
                  >
                    {crumb.label}
                  </a>
                )}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-apple-gray-4" />
              <Input
                type="text"
                placeholder="Search test cases..."
                onChange={(e) => onSearch?.(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Custom Actions */}
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'primary'}
              size={action.size || 'sm'}
              icon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}

          {/* Default Actions */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Bell className="w-4 h-4" />}
            className="relative"
          >
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-apple-red rounded-full"></span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
          />

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-apple-blue rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium text-apple-gray-7">
              Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav; 