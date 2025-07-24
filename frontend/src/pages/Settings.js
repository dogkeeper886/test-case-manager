import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Database, Bell, Shield, Palette, Globe, Save } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const settings = {
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      role: 'Admin',
      avatar: null,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
      notifications: {
        email: true,
        browser: true,
        slack: false,
      },
    },
    system: {
      version: '1.0.0',
      lastUpdate: '2024-01-20',
      databaseSize: '2.3 GB',
      activeUsers: 15,
    },
  };

  const handleLayoutSearch = (query) => {
    setSearchQuery(query);
    // TODO: Implement settings search
  };

  const handleSaveSettings = () => {
    console.log('Save settings');
  };

  const handleResetSettings = () => {
    console.log('Reset settings');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'system', label: 'System', icon: <Database className="w-4 h-4" /> },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6" data-element="settings-profile-content">
      <Card elevation="sm" data-element="settings-profile-card">
        <Card.Header data-element="settings-profile-header">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="settings-profile-title">
            Profile Information
          </h3>
        </Card.Header>
        <Card.Body data-element="settings-profile-body">
          <div className="space-y-4" data-element="settings-profile-form">
            <div data-element="settings-avatar-section">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-avatar-label">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4" data-element="settings-avatar-content">
                <div className="w-16 h-16 bg-apple-gray-2 rounded-full flex items-center justify-center" data-element="settings-avatar-placeholder">
                  <User className="w-8 h-8 text-apple-gray-4" />
                </div>
                <Button size="sm" variant="outline" data-element="settings-avatar-upload">
                  Upload Photo
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="settings-name-section">
              <div data-element="settings-firstname">
                <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-firstname-label">
                  First Name
                </label>
                <Input 
                  defaultValue={settings.profile.name.split(' ')[0]} 
                  placeholder="First name"
                  data-element="settings-firstname-input"
                />
              </div>
              <div data-element="settings-lastname">
                <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-lastname-label">
                  Last Name
                </label>
                <Input 
                  defaultValue={settings.profile.name.split(' ')[1]} 
                  placeholder="Last name"
                  data-element="settings-lastname-input"
                />
              </div>
            </div>
            
            <div data-element="settings-email-section">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-email-label">
                Email Address
              </label>
              <Input 
                defaultValue={settings.profile.email} 
                type="email"
                placeholder="email@example.com"
                data-element="settings-email-input"
              />
            </div>
            
            <div data-element="settings-role-section">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-role-label">
                Role
              </label>
              <div className="flex items-center space-x-2" data-element="settings-role-content">
                <Badge variant="default" data-element="settings-role-badge">
                  {settings.profile.role}
                </Badge>
                <span className="text-sm text-apple-gray-5" data-element="settings-role-description">
                  Contact administrator to change role
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6" data-element="settings-preferences-content">
      <Card elevation="sm" data-element="settings-theme-card">
        <Card.Header data-element="settings-theme-header">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="settings-theme-title">
            Appearance
          </h3>
        </Card.Header>
        <Card.Body data-element="settings-theme-body">
          <div className="space-y-4" data-element="settings-theme-form">
            <div data-element="settings-theme-section">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-theme-label">
                Theme
              </label>
              <div className="flex space-x-4" data-element="settings-theme-options">
                <label className="flex items-center space-x-2 cursor-pointer" data-element="settings-theme-light">
                  <input type="radio" name="theme" value="light" defaultChecked={settings.preferences.theme === 'light'} />
                  <span className="text-sm text-apple-gray-7">Light</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer" data-element="settings-theme-dark">
                  <input type="radio" name="theme" value="dark" defaultChecked={settings.preferences.theme === 'dark'} />
                  <span className="text-sm text-apple-gray-7">Dark</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer" data-element="settings-theme-auto">
                  <input type="radio" name="theme" value="auto" defaultChecked={settings.preferences.theme === 'auto'} />
                  <span className="text-sm text-apple-gray-7">Auto</span>
                </label>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card elevation="sm" data-element="settings-locale-card">
        <Card.Header data-element="settings-locale-header">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="settings-locale-title">
            Language & Region
          </h3>
        </Card.Header>
        <Card.Body data-element="settings-locale-body">
          <div className="space-y-4" data-element="settings-locale-form">
            <div data-element="settings-language-section">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-language-label">
                Language
              </label>
              <select 
                className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                defaultValue={settings.preferences.language}
                data-element="settings-language-select"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
            
            <div data-element="settings-timezone-section">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-timezone-label">
                Timezone
              </label>
              <select 
                className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                defaultValue={settings.preferences.timezone}
                data-element="settings-timezone-select"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern Time</option>
                <option value="PST">Pacific Time</option>
                <option value="CET">Central European Time</option>
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6" data-element="settings-notifications-content">
      <Card elevation="sm" data-element="settings-notifications-card">
        <Card.Header data-element="settings-notifications-header">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="settings-notifications-title">
            Notification Preferences
          </h3>
        </Card.Header>
        <Card.Body data-element="settings-notifications-body">
          <div className="space-y-4" data-element="settings-notifications-form">
            <div className="flex items-center justify-between" data-element="settings-email-notifications">
              <div data-element="settings-email-notifications-info">
                <h4 className="text-sm font-medium text-apple-gray-7" data-element="settings-email-notifications-title">
                  Email Notifications
                </h4>
                <p className="text-sm text-apple-gray-5" data-element="settings-email-notifications-description">
                  Receive notifications via email
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer" data-element="settings-email-toggle">
                <input type="checkbox" defaultChecked={settings.preferences.notifications.email} className="sr-only" />
                <div className="w-11 h-6 bg-apple-gray-3 rounded-full peer peer-checked:bg-apple-blue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between" data-element="settings-browser-notifications">
              <div data-element="settings-browser-notifications-info">
                <h4 className="text-sm font-medium text-apple-gray-7" data-element="settings-browser-notifications-title">
                  Browser Notifications
                </h4>
                <p className="text-sm text-apple-gray-5" data-element="settings-browser-notifications-description">
                  Show notifications in browser
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer" data-element="settings-browser-toggle">
                <input type="checkbox" defaultChecked={settings.preferences.notifications.browser} className="sr-only" />
                <div className="w-11 h-6 bg-apple-gray-3 rounded-full peer peer-checked:bg-apple-blue peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6" data-element="settings-security-content">
      <Card elevation="sm" data-element="settings-password-card">
        <Card.Header data-element="settings-password-header">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="settings-password-title">
            Change Password
          </h3>
        </Card.Header>
        <Card.Body data-element="settings-password-body">
          <div className="space-y-4" data-element="settings-password-form">
            <div data-element="settings-current-password">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-current-password-label">
                Current Password
              </label>
              <Input 
                type="password" 
                placeholder="Enter current password"
                data-element="settings-current-password-input"
              />
            </div>
            
            <div data-element="settings-new-password">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-new-password-label">
                New Password
              </label>
              <Input 
                type="password" 
                placeholder="Enter new password"
                data-element="settings-new-password-input"
              />
            </div>
            
            <div data-element="settings-confirm-password">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-confirm-password-label">
                Confirm New Password
              </label>
              <Input 
                type="password" 
                placeholder="Confirm new password"
                data-element="settings-confirm-password-input"
              />
            </div>
            
            <Button variant="primary" data-element="settings-update-password">
              Update Password
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6" data-element="settings-system-content">
      <Card elevation="sm" data-element="settings-system-info-card">
        <Card.Header data-element="settings-system-info-header">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7" data-element="settings-system-info-title">
            System Information
          </h3>
        </Card.Header>
        <Card.Body data-element="settings-system-info-body">
          <div className="space-y-4" data-element="settings-system-info-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="settings-system-stats">
              <div className="p-4 bg-apple-gray-1 rounded-apple" data-element="settings-version">
                <div className="text-sm font-medium text-apple-gray-7" data-element="settings-version-label">Version</div>
                <div className="text-lg font-semibold text-apple-gray-7" data-element="settings-version-value">{settings.system.version}</div>
              </div>
              <div className="p-4 bg-apple-gray-1 rounded-apple" data-element="settings-database-size">
                <div className="text-sm font-medium text-apple-gray-7" data-element="settings-database-size-label">Database Size</div>
                <div className="text-lg font-semibold text-apple-gray-7" data-element="settings-database-size-value">{settings.system.databaseSize}</div>
              </div>
              <div className="p-4 bg-apple-gray-1 rounded-apple" data-element="settings-active-users">
                <div className="text-sm font-medium text-apple-gray-7" data-element="settings-active-users-label">Active Users</div>
                <div className="text-lg font-semibold text-apple-gray-7" data-element="settings-active-users-value">{settings.system.activeUsers}</div>
              </div>
              <div className="p-4 bg-apple-gray-1 rounded-apple" data-element="settings-last-update">
                <div className="text-sm font-medium text-apple-gray-7" data-element="settings-last-update-label">Last Update</div>
                <div className="text-lg font-semibold text-apple-gray-7" data-element="settings-last-update-value">{settings.system.lastUpdate}</div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      case 'system':
        return renderSystemTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <Layout
      onSearch={handleLayoutSearch}
      breadcrumbs={[
        { label: 'Settings', href: '/settings' }
      ]}
      actions={[
        {
          label: 'Save Changes',
          variant: 'primary',
          icon: <Save className="w-4 h-4" />,
          onClick: handleSaveSettings
        }
      ]}
    >
      {/* Page Header */}
      <div className="mb-6" data-element="settings-page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7" data-element="settings-page-title">
              Settings
            </h1>
            <p className="text-apple-gray-5 mt-1" data-element="settings-page-description">
              Manage your account preferences and system settings
            </p>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex space-x-6" data-element="settings-content">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0" data-element="settings-sidebar">
          <Card elevation="sm" data-element="settings-sidebar-card">
            <Card.Body className="p-0" data-element="settings-sidebar-body">
              <nav className="space-y-1" data-element="settings-sidebar-nav">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-apple-blue text-white'
                        : 'text-apple-gray-6 hover:bg-apple-gray-1 hover:text-apple-gray-7'
                    }`}
                    data-element={`settings-tab-${tab.id}`}
                  >
                    <span data-element={`settings-tab-icon-${tab.id}`}>{tab.icon}</span>
                    <span data-element={`settings-tab-label-${tab.id}`}>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </Card.Body>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1" data-element="settings-main-content">
          {renderTabContent()}
        </div>
      </div>
    </Layout>
  );
};

export default Settings; 