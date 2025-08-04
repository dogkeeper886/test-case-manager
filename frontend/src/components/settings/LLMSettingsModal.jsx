import React, { useState, useEffect } from 'react';
import { 
  X, 
  Brain, 
  Key, 
  Settings, 
  CheckCircle, 
  AlertCircle,
  Info,
  Zap,
  Save,
  TestTube,
  Wifi,
  WifiOff,
  Loader
} from 'lucide-react';
import { Button, Card, Input, Select, Badge } from '../ui';
import { settingsAPI } from '../../services/api';
import { showSuccess, showError } from '../../utils/toast';

const LLMSettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4-turbo-preview',
    temperature: 0.1,
    maxTokens: 4000,
    enabled: false
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // disconnected, connecting, connected, error

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await settingsAPI.getLLMSettings();
      // The API returns { message: "...", data: { settings } }
      const settingsData = response.data.data || response.data;
      const loadedSettings = {
        provider: settingsData.provider || 'openai',
        apiKey: settingsData.apiKey || '',
        model: settingsData.model || 'gpt-4-turbo-preview',
        temperature: settingsData.temperature || 0.1,
        maxTokens: settingsData.maxTokens || 4000,
        enabled: settingsData.enabled || false
      };
      setSettings(loadedSettings);
      
      // Update connection status based on settings
      if (loadedSettings.enabled && loadedSettings.apiKey && !loadedSettings.apiKey.startsWith('***')) {
        setConnectionStatus('connected');
      } else if (loadedSettings.enabled && loadedSettings.apiKey) {
        setConnectionStatus('connected'); // API key is masked but exists
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Failed to load LLM settings:', error);
      showError('Failed to load settings');
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (connectionStatus === 'connected') {
      // Disconnect
      setConnectionStatus('disconnected');
      setSettings(prev => ({ ...prev, enabled: false }));
      setTestResult(null);
    } else {
      // Connect
      if (!settings.apiKey || !settings.provider || !settings.model) {
        showError('Please fill in all required fields before connecting');
        return;
      }
      
      setConnectionStatus('connecting');
      try {
        // Test connection first
        const testSettings = {
          provider: settings.provider,
          apiKey: settings.apiKey,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens
        };
        const response = await settingsAPI.testLLMConnection(testSettings);
        if (response.data.success) {
          setConnectionStatus('connected');
          setSettings(prev => ({ ...prev, enabled: true }));
          setTestResult({
            success: true,
            message: response.data.message,
            model: response.data.model,
            tokens: response.data.tokens
          });
          showSuccess('Connected to LLM service successfully');
        } else {
          setConnectionStatus('error');
          setTestResult({
            success: false,
            message: response.data.message || 'Connection failed'
          });
        }
      } catch (error) {
        setConnectionStatus('error');
        setTestResult({
          success: false,
          message: error.response?.data?.message || error.message
        });
        showError('Failed to connect: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Create completely fresh primitive values to avoid any potential circular references
      const settingsToSave = {
        provider: String(settings.provider || 'openai'),
        apiKey: String(settings.apiKey || ''),
        model: String(settings.model || 'gpt-4-turbo-preview'),
        temperature: Number(settings.temperature || 0.1),
        maxTokens: Number(settings.maxTokens || 4000),
        enabled: Boolean(settings.enabled)
      };
      
      
      await settingsAPI.updateLLMSettings(settingsToSave);
      showSuccess('LLM settings saved successfully');
      onClose();
    } catch (error) {
      console.error('Failed to save LLM settings:', error);
      showError('Failed to save settings: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const testSettings = {
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens
      };
      const response = await settingsAPI.testLLMConnection(testSettings);
      setTestResult({
        success: true,
        message: response.data.message,
        model: response.data.model,
        tokens: response.data.tokens
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.response?.data?.message || error.message
      });
    } finally {
      setTesting(false);
    }
  };

  const handleInputChange = (field, value) => {
    // Extract the actual value if it's an event object
    const actualValue = value && typeof value === 'object' && value.target 
      ? value.target.value 
      : value;
    
    setSettings(prev => ({
      ...prev,
      [field]: actualValue
    }));
    // Clear test result when settings change
    if (testResult) {
      setTestResult(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-apple-lg shadow-apple-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-apple-gray-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-apple-md flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-sf-semibold text-apple-gray-8">LLM Settings</h2>
              <p className="text-sm text-apple-gray-5">Configure AI-powered test case generation</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            onClick={onClose}
            className="text-apple-gray-5 hover:text-apple-gray-7"
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-apple-blue"></div>
            </div>
          ) : (
            <>
              {/* Connection Status and Control */}
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      {connectionStatus === 'connected' ? (
                        <Wifi className="w-5 h-5 text-green-600" />
                      ) : connectionStatus === 'connecting' ? (
                        <Loader className="w-5 h-5 text-apple-blue animate-spin" />
                      ) : connectionStatus === 'error' ? (
                        <WifiOff className="w-5 h-5 text-red-600" />
                      ) : (
                        <WifiOff className="w-5 h-5 text-apple-gray-4" />
                      )}
                      {connectionStatus === 'connected' && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-sf-medium text-apple-gray-8">LLM Connection</h3>
                      <p className="text-sm text-apple-gray-5">
                        {connectionStatus === 'connected' ? 'Connected and ready for AI-powered features' :
                         connectionStatus === 'connecting' ? 'Connecting to LLM service...' :
                         connectionStatus === 'error' ? 'Connection failed - check settings' :
                         'Disconnected - configure and connect to enable AI features'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={connectionStatus === 'connected' ? 'outline' : 'default'}
                    size="sm"
                    onClick={handleConnect}
                    disabled={connectionStatus === 'connecting'}
                    icon={
                      connectionStatus === 'connecting' ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : connectionStatus === 'connected' ? (
                        <WifiOff className="w-4 h-4" />
                      ) : (
                        <Wifi className="w-4 h-4" />
                      )
                    }
                    className={
                      connectionStatus === 'connected' 
                        ? 'text-red-600 border-red-200 hover:bg-red-50' 
                        : connectionStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : ''
                    }
                  >
                    {connectionStatus === 'connecting' ? 'Connecting...' :
                     connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
                  </Button>
                </div>
              </Card>

              {/* Provider Settings */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="w-4 h-4 text-apple-gray-5" />
                    <h3 className="font-sf-medium text-apple-gray-8">Provider Configuration</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-sf-medium text-apple-gray-7 mb-2">
                        Provider
                      </label>
                      <Select
                        value={settings.provider}
                        onChange={(value) => handleInputChange('provider', value)}
                        disabled={connectionStatus === 'connected'}
                      >
                        <option value="openai">OpenAI</option>
                        <option value="anthropic">Anthropic</option>
                        <option value="azure">Azure OpenAI</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-sf-medium text-apple-gray-7 mb-2">
                        Model
                      </label>
                      <Select
                        value={settings.model}
                        onChange={(value) => handleInputChange('model', value)}
                        disabled={connectionStatus === 'connected'}
                      >
                        {settings.provider === 'openai' && (
                          <>
                            <option value="gpt-4-turbo-preview">GPT-4 Turbo</option>
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          </>
                        )}
                        {settings.provider === 'anthropic' && (
                          <>
                            <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                            <option value="claude-3-sonnet-20240229">Claude 3 Sonnet</option>
                            <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                          </>
                        )}
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-sf-medium text-apple-gray-7 mb-2">
                      <Key className="w-4 h-4 inline mr-1" />
                      API Key
                    </label>
                    <Input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="Enter your API key"
                      disabled={connectionStatus === 'connected'}
                      className="font-mono"
                    />
                    <p className="text-xs text-apple-gray-5 mt-1">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>
                </div>
              </Card>

              {/* Advanced Settings */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-apple-gray-5" />
                    <h3 className="font-sf-medium text-apple-gray-8">Advanced Settings</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-sf-medium text-apple-gray-7 mb-2">
                        Temperature: {settings.temperature}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                        disabled={connectionStatus === 'connected'}
                        className="w-full h-2 bg-apple-gray-2 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="flex justify-between text-xs text-apple-gray-5 mt-1">
                        <span>More focused</span>
                        <span>More creative</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-sf-medium text-apple-gray-7 mb-2">
                        Max Tokens
                      </label>
                      <Input
                        type="number"
                        value={settings.maxTokens}
                        onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value) || 4000)}
                        min="1000"
                        max="8000"
                        disabled={connectionStatus === 'connected'}
                      />
                      <p className="text-xs text-apple-gray-5 mt-1">
                        Maximum tokens for LLM response
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Connection Status Details */}
              {testResult && (
                <Card className="p-4">
                  <div className={`p-3 rounded-apple-md border ${
                    testResult.success 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {testResult.success ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-sf-medium ${
                          testResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                        </p>
                        <p className={`text-xs mt-1 ${
                          testResult.success ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {testResult.message}
                        </p>
                        {testResult.success && testResult.model && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="success" size="sm">
                              Model: {testResult.model}
                            </Badge>
                            {testResult.tokens && (
                              <Badge variant="outline" size="sm">
                                {testResult.tokens} tokens available
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-apple-gray-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            icon={saving ? null : <Save className="w-4 h-4" />}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LLMSettingsModal;