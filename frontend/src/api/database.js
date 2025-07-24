import api from './config';

export const databaseAPI = {
  getDatabaseInfo: () => api.get('/database/info'),
  getDatabaseSummary: () => api.get('/database/info'), // Using same endpoint for now
  exportDatabase: () => api.post('/database/export')
}; 