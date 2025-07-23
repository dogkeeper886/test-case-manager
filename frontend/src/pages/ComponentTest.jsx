import React, { useState } from 'react';
import { Search, Plus, Settings, User, Bell } from 'lucide-react';
import { Button, Card, Badge, Input } from '../components/ui';
import useTestCaseStore from '../stores/testCaseStore';

const ComponentTest = () => {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  const { setSearchQuery } = useTestCaseStore();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
    
    // Simulate validation
    if (value.length > 0 && value.length < 3) {
      setInputError('Input must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="min-h-screen bg-apple-gray-1 font-sf">
      {/* Header */}
      <div className="bg-white border-b border-apple-gray-2 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-sf-display font-semibold text-apple-gray-7">
            Apple-Style Component Test
          </h1>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" icon={<Bell className="w-4 h-4" />}>
              Notifications
            </Button>
            <Button variant="ghost" size="sm" icon={<Settings className="w-4 h-4" />}>
              Settings
            </Button>
            <Button variant="ghost" size="sm" icon={<User className="w-4 h-4" />}>
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Search Section */}
        <Card elevation="sm" padding="lg">
          <Card.Header>
            <h2 className="text-xl font-sf-display font-semibold text-apple-gray-7">
              Search & Input Components
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Search Test Cases"
                  placeholder="Search by title, description, or ID..."
                  icon={<Search className="w-4 h-4" />}
                  value={inputValue}
                  onChange={handleInputChange}
                  error={inputError}
                />
                
                <Input
                  label="Success Input"
                  placeholder="This input shows success state"
                  success="Input is valid!"
                />
                
                <Input
                  label="Loading Input"
                  placeholder="This input shows loading state"
                  loading={true}
                />
              </div>
              
              <div className="space-y-4">
                <Input
                  label="Disabled Input"
                  placeholder="This input is disabled"
                  disabled={true}
                />
                
                <Input
                  label="Input with Right Icon"
                  placeholder="Icon on the right side"
                  icon={<Plus className="w-4 h-4" />}
                  iconPosition="right"
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Button Section */}
        <Card elevation="sm" padding="lg">
          <Card.Header>
            <h2 className="text-xl font-sf-display font-semibold text-apple-gray-7">
              Button Components
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              {/* Button Variants */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Button Variants
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />}>
                    Primary Button
                  </Button>
                  <Button variant="secondary">
                    Secondary Button
                  </Button>
                  <Button variant="ghost">
                    Ghost Button
                  </Button>
                  <Button variant="danger">
                    Danger Button
                  </Button>
                  <Button variant="success">
                    Success Button
                  </Button>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Button Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* Button States */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Button States
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button loading={true}>Loading Button</Button>
                  <Button disabled={true}>Disabled Button</Button>
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />} iconPosition="right">
                    Icon Right
                  </Button>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Badge Section */}
        <Card elevation="sm" padding="lg">
          <Card.Header>
            <h2 className="text-xl font-sf-display font-semibold text-apple-gray-7">
              Badge Components
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-6">
              {/* Badge Variants */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Badge Variants
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="primary">Primary</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              {/* Test Case Specific Badges */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Test Case Status Badges
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="passed">Passed</Badge>
                  <Badge variant="failed">Failed</Badge>
                  <Badge variant="blocked">Blocked</Badge>
                  <Badge variant="skipped">Skipped</Badge>
                </div>
              </div>

              {/* Importance Badges */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Importance Levels
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="high">High</Badge>
                  <Badge variant="medium">Medium</Badge>
                  <Badge variant="low">Low</Badge>
                </div>
              </div>

              {/* Execution Type Badges */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Execution Types
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="automated">Automated</Badge>
                  <Badge variant="manual">Manual</Badge>
                </div>
              </div>

              {/* Badge Sizes */}
              <div>
                <h3 className="text-lg font-sf font-semibold text-apple-gray-6 mb-3">
                  Badge Sizes
                </h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Card Section */}
        <Card elevation="sm" padding="lg">
          <Card.Header>
            <h2 className="text-xl font-sf-display font-semibold text-apple-gray-7">
              Card Components
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample Test Suite Card */}
              <Card elevation="md" hover={true} onClick={() => console.log('Card clicked!')}>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
                      Network Control Profile
                    </h3>
                    <Badge variant="primary">18 Suites</Badge>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="text-apple-gray-5 text-sm mb-3">
                    Main test suite for network control functionality
                  </p>
                  <div className="flex items-center justify-between text-xs text-apple-gray-4">
                    <span>182 test cases</span>
                    <span>Updated 2 hours ago</span>
                  </div>
                </Card.Body>
              </Card>

              {/* Sample Test Case Card */}
              <Card elevation="md" hover={true}>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
                      DHCP Service Test
                    </h3>
                    <div className="flex gap-1">
                      <Badge variant="automated" size="sm">Auto</Badge>
                      <Badge variant="high" size="sm">High</Badge>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <p className="text-apple-gray-5 text-sm mb-3">
                    Test adding DHCP service to network configuration
                  </p>
                  <div className="flex items-center justify-between text-xs text-apple-gray-4">
                    <span>ID: 1673052</span>
                    <span>Version: 1</span>
                  </div>
                </Card.Body>
                <Card.Footer>
                  <div className="flex items-center justify-between">
                    <Badge variant="passed">Passed</Badge>
                    <Button variant="ghost" size="sm">View Details</Button>
                  </div>
                </Card.Footer>
              </Card>

              {/* Stats Card */}
              <Card elevation="md">
                <Card.Header>
                  <h3 className="text-lg font-sf font-semibold text-apple-gray-7">
                    Test Statistics
                  </h3>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-apple-gray-5">Total Cases</span>
                      <span className="font-semibold">182</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-apple-gray-5">Passed</span>
                      <span className="font-semibold text-success">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-apple-gray-5">Failed</span>
                      <span className="font-semibold text-error">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-apple-gray-5">Automated</span>
                      <span className="font-semibold text-apple-blue">89</span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ComponentTest; 