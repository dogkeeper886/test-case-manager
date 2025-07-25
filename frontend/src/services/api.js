import axios from 'axios';

// Dynamic API URL detection for remote access
const getApiBaseURL = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using environment API URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // If accessing from remote PC, use server IP instead of localhost
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  console.log('🌐 Current hostname:', currentHost);
  console.log('🔌 Current port:', currentPort);
  
  // If accessing via IP address (remote access), use the same IP for backend
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    const apiURL = `http://${currentHost}:3001`;
    console.log('🚀 Using remote API URL:', apiURL);
    return apiURL;
  }
  
  // Default to localhost for local development
  console.log('🏠 Using localhost API URL: http://localhost:3001');
  return 'http://localhost:3001';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const testCasesAPI = {
  // Get all test cases with optional filters
  getAll: (params = {}) => api.get('/api/testcases', { params }),
  
  // Get test case by ID
  getById: (id) => api.get(`/api/testcases/${id}`),
  
  // Create new test case
  create: (data) => api.post('/api/testcases', data),
  
  // Update test case
  update: (id, data) => api.put(`/api/testcases/${id}`, data),
  
  // Delete test case
  delete: (id) => api.delete(`/api/testcases/${id}`),
  
  // Get test cases by project
  getByProject: (projectId) => api.get(`/api/testcases/project/${projectId}`),
  
  // Get test cases by test suite
  getByTestSuite: (suiteId) => api.get(`/api/testcases/suite/${suiteId}`),
  
  // Search test cases
  search: (query) => api.get('/api/testcases/search', { params: { q: query } }),
};

export const testSuitesAPI = {
  // Get all test suites
  getAll: () => api.get('/api/testsuites'),
  
  // Get test suite by ID
  getById: (id) => api.get(`/api/testsuites/${id}`),
  
  // Create new test suite
  create: (data) => api.post('/api/testsuites', data),
  
  // Update test suite
  update: (id, data) => api.put(`/api/testsuites/${id}`, data),
  
  // Delete test suite
  delete: (id) => api.delete(`/api/testsuites/${id}`),
  
  // Get test suites by project
  getByProject: (projectId) => api.get(`/api/testsuites/project/${projectId}`),
};

export const projectsAPI = {
  // Get all projects
  getAll: () => api.get('/api/projects'),
  
  // Get project by ID
  getById: (id) => api.get(`/api/projects/${id}`),
  
  // Create new project
  create: (data) => api.post('/api/projects', data),
  
  // Update project
  update: (id, data) => api.put(`/api/projects/${id}`, data),
  
  // Delete project
  delete: (id) => api.delete(`/api/projects/${id}`),
};

export const documentsAPI = {
  // Get all documents
  getAll: () => api.get('/documents'),
  
  // Get document by ID
  getById: (id) => api.get(`/documents/${id}`),
  
  // Upload document
  upload: (formData) => api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Delete document
  delete: (id) => api.delete(`/documents/${id}`),
};

export const reportsAPI = {
  // Get all reports
  getAll: () => api.get('/reports'),
  
  // Get report by ID
  getById: (id) => api.get(`/reports/${id}`),
  
  // Generate report
  generate: (data) => api.post('/reports/generate', data),
  
  // Download report
  download: (id) => api.get(`/reports/${id}/download`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
};

export const importAPI = {
  // Get available import strategies
  getStrategies: () => api.get('/api/import/strategies'),
  
  // Preview import from file
  previewFile: (formData) => api.post('/api/import/testlink/preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Preview import from content
  previewContent: (data) => api.post('/api/import/testlink/content/preview', data),
  
  // Import from file
  importFile: (formData) => api.post('/api/import/testlink', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  
  // Import from content
  importContent: (data) => api.post('/api/import/testlink/content', data),
  
  // Get import status
  getStatus: (importLogId) => api.get(`/api/import/status/${importLogId}`),
  
  // Get import logs for project
  getLogs: (projectId) => api.get(`/api/import/logs/${projectId}`),
  
  // Retry failed import
  retryImport: (importLogId, strategy) => api.post(`/api/import/retry/${importLogId}`, { strategy }),
  
  // Delete import log
  deleteImportLog: (importLogId) => api.delete(`/api/import/logs/${importLogId}`),
};

export const activitiesAPI = {
  // Get recent activities
  getRecent: (limit = 10, offset = 0) => api.get('/api/activities', { params: { limit, offset } }),
  
  // Get activity by ID
  getById: (id) => api.get(`/api/activities/${id}`),
  
  // Get activity statistics
  getStats: () => api.get('/api/activities/stats'),
  
  // Get activities by entity
  getByEntity: (entityType, entityId, limit = 10, offset = 0) => 
    api.get(`/api/activities/entity/${entityType}/${entityId}`, { params: { limit, offset } }),
  
  // Get activities by user
  getByUser: (userId, limit = 10, offset = 0) => 
    api.get(`/api/activities/user/${userId}`, { params: { limit, offset } }),
  
  // Log a new activity
  log: (activityData) => api.post('/api/activities/log', activityData),
};

export default api; 