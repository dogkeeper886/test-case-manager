const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const OpenAI = require('openai');

// Encryption key for API keys (should be in environment)
const ENCRYPTION_KEY = process.env.SETTINGS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

/**
 * Encrypt sensitive data
 */
function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
function decrypt(text) {
  if (!text) return null;
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = textParts.join(':');
    const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

// GET /api/settings/llm - Get LLM settings
router.get('/llm', async (req, res) => {
  try {
    const db = req.app.locals.db;
    
    // Get LLM settings from database
    const result = await db.query(`
      SELECT setting_key, setting_value, is_encrypted 
      FROM app_settings 
      WHERE setting_key LIKE 'llm_%'
    `);
    
    const settings = {
      provider: 'openai',
      apiKey: '',
      model: 'gpt-4.1',
      temperature: 0.1,
      maxTokens: 16000,
      enabled: false
    };
    
    // Parse settings from database
    result.rows.forEach(row => {
      const key = row.setting_key.replace('llm_', '');
      let value = row.setting_value;
      
      console.log('Reading setting from DB:', { key: row.setting_key, value, encrypted: row.is_encrypted });
      
      if (row.is_encrypted && value) {
        value = decrypt(value);
      }
      
      // Convert types
      if (key === 'enabled') {
        value = value === 'true';
      } else if (key === 'temperature') {
        value = parseFloat(value) || 0.1;
      } else if (key === 'maxTokens') {
        value = parseInt(value) || 4000;
      }
      
      settings[key] = value;
    });
    
    // Don't send the actual API key to frontend (send masked version)
    if (settings.apiKey) {
      console.log('Masking API key for frontend:', `${settings.apiKey.substring(0, 10)}...${settings.apiKey.slice(-4)}`);
      settings.apiKey = '***' + settings.apiKey.slice(-4);
      console.log('Masked API key:', settings.apiKey);
    }
    
    res.json({
      message: 'LLM settings retrieved successfully',
      data: settings
    });
    
  } catch (error) {
    console.error('Failed to get LLM settings:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve LLM settings',
      message: error.message 
    });
  }
});

// PUT /api/settings/llm - Update LLM settings
router.put('/llm', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { provider, apiKey, model, temperature, maxTokens, enabled } = req.body;
    
    console.log('Received LLM settings update:', { 
      provider, 
      apiKey: apiKey ? '***' : 'empty', 
      model, 
      temperature, 
      maxTokens, 
      enabled: enabled,
      enabledType: typeof enabled 
    });
    
    // Validate input
    if (provider && !['openai', 'anthropic', 'azure'].includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }
    
    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      return res.status(400).json({ error: 'Temperature must be between 0 and 1' });
    }
    
    if (maxTokens !== undefined && (maxTokens < 100 || maxTokens > 8000)) {
      return res.status(400).json({ error: 'Max tokens must be between 100 and 8000' });
    }
    
    // Prepare settings to save
    const settingsToSave = [
      { key: 'llm_provider', value: provider, encrypted: false },
      { key: 'llm_model', value: model, encrypted: false },
      { key: 'llm_temperature', value: temperature?.toString(), encrypted: false },
      { key: 'llm_maxTokens', value: maxTokens?.toString(), encrypted: false },
      { key: 'llm_enabled', value: enabled?.toString(), encrypted: false }
    ];
    
    // Only update API key if it's not the masked version
    if (apiKey && !apiKey.startsWith('***')) {
      settingsToSave.push({ 
        key: 'llm_apiKey', 
        value: encrypt(apiKey), 
        encrypted: true 
      });
    }
    
    // Start transaction
    await db.query('BEGIN');
    
    try {
      // Create app_settings table if it doesn't exist
      await db.query(`
        CREATE TABLE IF NOT EXISTS app_settings (
          id SERIAL PRIMARY KEY,
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT,
          is_encrypted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Update or insert each setting
      for (const setting of settingsToSave) {
        if (setting.value !== undefined && setting.value !== null) {
          console.log('Saving setting to DB:', setting);
          await db.query(`
            INSERT INTO app_settings (setting_key, setting_value, is_encrypted, updated_at)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
            ON CONFLICT (setting_key) 
            DO UPDATE SET 
              setting_value = EXCLUDED.setting_value,
              is_encrypted = EXCLUDED.is_encrypted,
              updated_at = CURRENT_TIMESTAMP
          `, [setting.key, setting.value, setting.encrypted]);
        }
      }
      
      await db.query('COMMIT');
      
      res.json({
        message: 'LLM settings updated successfully',
        data: { updated: true }
      });
      
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Failed to update LLM settings:', error);
    res.status(500).json({ 
      error: 'Failed to update LLM settings',
      message: error.message 
    });
  }
});

// POST /api/settings/llm/test - Test LLM connection
router.post('/llm/test', async (req, res) => {
  try {
    const { provider, apiKey, model, temperature, maxTokens } = req.body;
    
    if (!provider || !apiKey || !model) {
      return res.status(400).json({ 
        error: 'Provider, API key, and model are required for testing' 
      });
    }
    
    let testClient;
    let testResponse;
    
    if (provider === 'openai') {
      // Handle API key - use provided key or get stored encrypted key
      let actualApiKey = apiKey;
      
      if (apiKey.startsWith('***')) {
        actualApiKey = await getStoredAPIKey('llm_apiKey', req.app.locals.db);
        if (!actualApiKey) {
          return res.status(400).json({ 
            error: 'Invalid API key',
            message: 'No stored API key found' 
          });
        }
      }
      
      testClient = new OpenAI({
        apiKey: actualApiKey
      });
      
      // Test with a simple completion
      const completion = await testClient.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a test assistant. Respond with exactly: 'Connection test successful'"
          },
          {
            role: "user", 
            content: "Test connection"
          }
        ],
        max_tokens: 50,
        temperature: temperature || 0.1
      });
      
      testResponse = {
        success: true,
        message: 'OpenAI connection successful',
        model: completion.model,
        tokens: completion.usage?.total_tokens,
        response: completion.choices[0]?.message?.content
      };
      
    } else if (provider === 'anthropic') {
      // TODO: Implement Anthropic testing
      return res.status(400).json({ 
        error: 'Anthropic testing not yet implemented' 
      });
    } else {
      return res.status(400).json({ 
        error: 'Unsupported provider for testing' 
      });
    }
    
    res.json({
      message: 'LLM connection test completed',
      data: testResponse
    });
    
  } catch (error) {
    console.error('LLM connection test failed:', error);
    
    let errorMessage = 'Connection test failed';
    if (error.code === 'invalid_api_key') {
      errorMessage = 'Invalid API key';
    } else if (error.code === 'insufficient_quota') {
      errorMessage = 'API quota exceeded';
    } else if (error.message.includes('model')) {
      errorMessage = 'Invalid or unavailable model';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(400).json({
      error: 'Connection test failed',
      message: errorMessage
    });
  }
});

/**
 * Helper function to get stored API key
 */
async function getStoredAPIKey(settingKey, db) {
  try {
    const result = await db.query(
      'SELECT setting_value FROM app_settings WHERE setting_key = $1 AND is_encrypted = true',
      [settingKey]
    );
    
    if (result.rows.length > 0) {
      return decrypt(result.rows[0].setting_value);
    }
    return null;
  } catch (error) {
    console.error('Failed to get stored API key:', error);
    return null;
  }
}

module.exports = router;