import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Database, Bell, Shield, Palette, Globe, Save, CheckCircle, XCircle, AlertCircle, Download, Upload } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import Layout from '../components/layout/Layout';

const Settings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
      console.log('Reset settings');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" />, dataElement: 'settings-tab-profile' },
    { id: 'preferences', label: 'Preferences', icon: <Palette className="w-4 h-4" />, dataElement: 'settings-tab-preferences' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, dataElement: 'settings-tab-notifications' },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" />, dataElement: 'settings-tab-security' },
    { id: 'system', label: 'System', icon: <Database className="w-4 h-4" />, dataElement: 'settings-tab-system' },
  ];

  const renderProfileTab = () => (
    <div className="space-y-6" data-element="settings-profile-content">
      <Card elevation="sm" data-element="settings-profile-card">
        <div className="p-6" data-element="settings-profile-card-content">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-6" data-element="settings-profile-title">
            Profile Information
          </h3>
          <div className="space-y-6" data-element="settings-profile-form">
            <div data-element="settings-avatar-section">
              <label className="block text-sm font-medium text-apple-gray-7 mb-3" data-element="settings-avatar-label">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4" data-element="settings-avatar-content">
                <div className="w-16 h-16 bg-apple-gray-2 rounded-full flex items-center justify-center" data-element="settings-avatar-placeholder">
                  <User className="w-8 h-8 text-apple-gray-4" />
                </div>
                <div className="flex space-x-2" data-element="settings-avatar-actions">
                  <Button size="sm" variant="secondary" data-element="settings-avatar-upload">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button size="sm" variant="ghost" data-element="settings-avatar-remove">
                    Remove
                  </Button>
                </div>
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

            <div data-element="settings-email">
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

            <div data-element="settings-role">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-role-label">
                Role
              </label>
              <div className="flex items-center space-x-2" data-element="settings-role-content">
                <Badge variant="success" size="sm" data-element="settings-role-badge">
                  {settings.profile.role}
                </Badge>
                <span className="text-sm text-apple-gray-5" data-element="settings-role-description">
                  Contact administrator to change role
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6" data-element="settings-preferences-content">
      <Card elevation="sm" data-element="settings-preferences-card">
        <div className="p-6" data-element="settings-preferences-card-content">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-6" data-element="settings-preferences-title">
            Display & Language
          </h3>
          <div className="space-y-6" data-element="settings-preferences-form">
            <div data-element="settings-theme">
              <label className="block text-sm font-medium text-apple-gray-7 mb-3" data-element="settings-theme-label">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3" data-element="settings-theme-options">
                {['light', 'dark', 'auto'].map((theme) => (
                  <button
                    key={theme}
                    className={`p-4 rounded-apple-lg border-2 transition-all duration-200 ${
                      settings.preferences.theme === theme
                        ? 'border-apple-blue bg-apple-blue/5'
                        : 'border-apple-gray-2 hover:border-apple-gray-3'
                    }`}
                    data-element={`settings-theme-${theme}`}
                  >
                    <div className="text-center">
                      <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                        theme === 'light' ? 'bg-white border border-apple-gray-3' :
                        theme === 'dark' ? 'bg-apple-gray-7' : 'bg-gradient-to-r from-white to-apple-gray-7'
                      }`}></div>
                      <span className="text-sm font-sf font-medium text-apple-gray-7 capitalize">{theme}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="settings-language-timezone">
              <div data-element="settings-language">
                <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-language-label">
                  Language
                </label>
                <select 
                  className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                  defaultValue={settings.preferences.language}
                  data-element="settings-language-select"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div data-element="settings-timezone">
                <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-timezone-label">
                  Timezone
                </label>
                <select 
                  className="w-full px-3 py-2 border border-apple-gray-3 rounded-apple focus:outline-none focus:ring-2 focus:ring-apple-blue/50 focus:border-apple-blue"
                  defaultValue={settings.preferences.timezone}
                  data-element="settings-timezone-select"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time</option>
                  <option value="PST">Pacific Time</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6" data-element="settings-notifications-content">
      <Card elevation="sm" data-element="settings-notifications-card">
        <div className="p-6" data-element="settings-notifications-card-content">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-6" data-element="settings-notifications-title">
            Notification Preferences
          </h3>
          <div className="space-y-4" data-element="settings-notifications-form">
            {Object.entries(settings.preferences.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-4 border border-apple-gray-2 rounded-apple-lg" data-element={`settings-notification-${key}`}>
                <div data-element={`settings-notification-info-${key}`}>
                  <h4 className="font-sf font-medium text-apple-gray-7 capitalize" data-element={`settings-notification-title-${key}`}>
                    {key} Notifications
                  </h4>
                  <p className="text-sm text-apple-gray-5" data-element={`settings-notification-description-${key}`}>
                    Receive notifications via {key}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer" data-element={`settings-notification-toggle-${key}`}>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    defaultChecked={value}
                    data-element={`settings-notification-checkbox-${key}`}
                  />
                  <div className="w-11 h-6 bg-apple-gray-3 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-apple-blue/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-apple-gray-3 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-apple-blue"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6" data-element="settings-security-content">
      <Card elevation="sm" data-element="settings-security-card">
        <div className="p-6" data-element="settings-security-card-content">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-6" data-element="settings-security-title">
            Security Settings
          </h3>
          <div className="space-y-6" data-element="settings-security-form">
            <div data-element="settings-password">
              <label className="block text-sm font-medium text-apple-gray-7 mb-2" data-element="settings-password-label">
                Current Password
              </label>
              <Input 
                type="password"
                placeholder="Enter current password"
                data-element="settings-password-input"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="settings-new-password">
              <div data-element="settings-new-password-field">
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
                  Confirm Password
                </label>
                <Input 
                  type="password"
                  placeholder="Confirm new password"
                  data-element="settings-confirm-password-input"
                />
              </div>
            </div>

            <div data-element="settings-two-factor">
              <div className="flex items-center justify-between p-4 border border-apple-gray-2 rounded-apple-lg" data-element="settings-two-factor-content">
                <div data-element="settings-two-factor-info">
                  <h4 className="font-sf font-medium text-apple-gray-7" data-element="settings-two-factor-title">
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-apple-gray-5" data-element="settings-two-factor-description">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="secondary" size="sm" data-element="settings-two-factor-enable">
                  Enable
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSystemTab = () => (
    <div className="space-y-6" data-element="settings-system-content">
      <Card elevation="sm" data-element="settings-system-card">
        <div className="p-6" data-element="settings-system-card-content">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-6" data-element="settings-system-title">
            System Information
          </h3>
          <div className="space-y-4" data-element="settings-system-info">
            <div className="flex items-center justify-between p-4 border border-apple-gray-2 rounded-apple-lg" data-element="settings-system-version">
              <div data-element="settings-system-version-info">
                <h4 className="font-sf font-medium text-apple-gray-7" data-element="settings-system-version-title">
                  Version
                </h4>
                <p className="text-sm text-apple-gray-5" data-element="settings-system-version-value">
                  {settings.system.version}
                </p>
              </div>
              <Badge variant="success" size="sm" data-element="settings-system-version-badge">
                Latest
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-element="settings-system-stats">
              <div className="p-4 border border-apple-gray-2 rounded-apple-lg" data-element="settings-system-database">
                <h4 className="font-sf font-medium text-apple-gray-7 mb-1" data-element="settings-system-database-title">
                  Database Size
                </h4>
                <p className="text-2xl font-sf font-bold text-apple-blue" data-element="settings-system-database-value">
                  {settings.system.databaseSize}
                </p>
              </div>
              <div className="p-4 border border-apple-gray-2 rounded-apple-lg" data-element="settings-system-users">
                <h4 className="font-sf font-medium text-apple-gray-7 mb-1" data-element="settings-system-users-title">
                  Active Users
                </h4>
                <p className="text-2xl font-sf font-bold text-success" data-element="settings-system-users-value">
                  {settings.system.activeUsers}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-apple-gray-2 rounded-apple-lg" data-element="settings-system-update">
              <div data-element="settings-system-update-info">
                <h4 className="font-sf font-medium text-apple-gray-7" data-element="settings-system-update-title">
                  Last Update
                </h4>
                <p className="text-sm text-apple-gray-5" data-element="settings-system-update-value">
                  {settings.system.lastUpdate}
                </p>
              </div>
              <Button variant="secondary" size="sm" data-element="settings-system-check-update">
                Check for Updates
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card elevation="sm" data-element="settings-backup-card">
        <div className="p-6" data-element="settings-backup-card-content">
          <h3 className="text-lg font-sf font-semibold text-apple-gray-7 mb-6" data-element="settings-backup-title">
            Data Management
          </h3>
          <div className="space-y-4" data-element="settings-backup-actions">
            <div className="flex items-center justify-between p-4 border border-apple-gray-2 rounded-apple-lg" data-element="settings-backup-export">
              <div data-element="settings-backup-export-info">
                <h4 className="font-sf font-medium text-apple-gray-7" data-element="settings-backup-export-title">
                  Export Data
                </h4>
                <p className="text-sm text-apple-gray-5" data-element="settings-backup-export-description">
                  Download all your data as a backup
                </p>
              </div>
              <Button variant="secondary" size="sm" data-element="settings-backup-export-button">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-apple-gray-2 rounded-apple-lg" data-element="settings-backup-import">
              <div data-element="settings-backup-import-info">
                <h4 className="font-sf font-medium text-apple-gray-7" data-element="settings-backup-import-title">
                  Import Data
                </h4>
                <p className="text-sm text-apple-gray-5" data-element="settings-backup-import-description">
                  Restore data from a backup file
                </p>
              </div>
              <Button variant="secondary" size="sm" data-element="settings-backup-import-button">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </div>
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
      breadcrumbs={[
        { label: 'Settings', href: '/settings' }
      ]}
      showSearch={true}
      onSearch={handleLayoutSearch}
    >
      {/* Page Header */}
      <div className="mb-8" data-element="settings-header">
        <div className="flex items-center justify-between" data-element="settings-header-content">
          <div data-element="settings-title-section">
            <h1 className="text-3xl font-sf-display font-semibold text-apple-gray-7" data-element="settings-title">
              Settings
            </h1>
            <p className="text-apple-gray-5 mt-2" data-element="settings-subtitle">
              Manage your account preferences and system configuration
            </p>
          </div>
          <div className="flex items-center gap-3" data-element="settings-actions">
            <Button
              variant="secondary"
              onClick={handleResetSettings}
              data-element="settings-reset-button"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleSaveSettings}
              disabled={isSaving}
              data-element="settings-save-button"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex flex-col lg:flex-row gap-8" data-element="settings-content">
        {/* Sidebar Navigation */}
        <div className="lg:w-64" data-element="settings-sidebar">
          <Card elevation="sm" data-element="settings-sidebar-card">
            <div className="p-4" data-element="settings-sidebar-content">
              <nav className="space-y-2" data-element="settings-nav">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-apple-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-apple-blue text-white'
                        : 'text-apple-gray-7 hover:bg-apple-gray-1'
                    }`}
                    data-element={tab.dataElement}
                  >
                    {tab.icon}
                    <span className="font-sf font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
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