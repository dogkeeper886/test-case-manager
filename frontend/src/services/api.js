import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
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
  getAll: (params = {}) => api.get('/testcases', { params }),
  
  // Get test case by ID
  getById: (id) => api.get(`/testcases/${id}`),
  
  // Create new test case
  create: (data) => api.post('/testcases', data),
  
  // Update test case
  update: (id, data) => api.put(`/testcases/${id}`, data),
  
  // Delete test case
  delete: (id) => api.delete(`/testcases/${id}`),
  
  // Get test cases by project
  getByProject: (projectId) => api.get(`/testcases/project/${projectId}`),
  
  // Get test cases by test suite
  getByTestSuite: (suiteId) => api.get(`/testcases/suite/${suiteId}`),
  
  // Search test cases
  search: (query) => api.get('/testcases/search', { params: { q: query } }),
};

export const testSuitesAPI = {
  // Get all test suites
  getAll: () => api.get('/testsuites'),
  
  // Get test suite by ID
  getById: (id) => api.get(`/testsuites/${id}`),
  
  // Create new test suite
  create: (data) => api.post('/testsuites', data),
  
  // Update test suite
  update: (id, data) => api.put(`/testsuites/${id}`, data),
  
  // Delete test suite
  delete: (id) => api.delete(`/testsuites/${id}`),
  
  // Get test suites by project
  getByProject: (projectId) => api.get(`/testsuites/project/${projectId}`),
};

export const projectsAPI = {
  // Get all projects
  getAll: () => api.get('/projects'),
  
  // Get project by ID
  getById: (id) => api.get(`/projects/${id}`),
  
  // Create new project
  create: (data) => api.post('/projects', data),
  
  // Update project
  update: (id, data) => api.put(`/projects/${id}`, data),
  
  // Delete project
  delete: (id) => api.delete(`/projects/${id}`),
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

export default api; 