/**
 * User Settings & System Configuration
 * Manages system defaults and preferences
 */

const settings = {
  // System Information
  system: {
    name: 'Promoter ID Management System',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },

  // ID Template Defaults
  idTemplate: {
    defaultWidth: 1080,
    defaultHeight: 1920,
    defaultFont: 'Arial',
    defaultFontSize: 12,
    defaultFontColor: '#000000',
    defaultBackgroundColor: '#FFFFFF'
  },

  // Excel Template Configuration
  excelTemplate: {
    headers: [
      'employeeno',
      'promoter_id',
      'first_name',
      'last_name',
      'full_name',
      'date_hired',
      'date_expired',
      'brand',
      'category',
      'position',
      'function',
      'contact_no',
      'address',
      'emergency_contact',
      'contact_person',
      'location',
      'district',
      'division',
      'hrgen',
      'employer',
      'nickname',
      'photo_path'
    ],
    filename: 'Promoter_Import_Template',
    sheetName: 'Promoters',
    sampleRows: 5
  },

  // Photo Upload Settings
  photoUpload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    uploadDir: 'app/uploads/photos'
  },

  // Database Settings
  database: {
    name: 'promoters.db',
    path: 'database/promoters.db',
    autoInitialize: true
  },

  // Server Settings
  server: {
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },

  // API Settings
  api: {
    defaultPageSize: 10,
    maxPageSize: 100,
    searchFields: ['employeeno', 'promoter_id', 'full_name', 'first_name', 'last_name']
  }
};

/**
 * Get all settings
 */
function getAllSettings() {
  return settings;
}

/**
 * Get specific setting by key
 */
function getSetting(key) {
  const keys = key.split('.');
  let value = settings;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return null;
    }
  }
  
  return value;
}

/**
 * Update a setting
 */
function updateSetting(key, value) {
  const keys = key.split('.');
  const lastKey = keys.pop();
  let target = settings;
  
  for (const k of keys) {
    if (!(k in target)) {
      target[k] = {};
    }
    target = target[k];
  }
  
  target[lastKey] = value;
  return value;
}

/**
 * Export default system defaults for client use
 */
function getClientDefaults() {
  return {
    idTemplate: settings.idTemplate,
    excelTemplate: {
      headers: settings.excelTemplate.headers,
      filename: settings.excelTemplate.filename
    }
  };
}

module.exports = {
  settings,
  getAllSettings,
  getSetting,
  updateSetting,
  getClientDefaults
};
