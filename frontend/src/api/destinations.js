import api from './config';

export const destinationsAPI = {
  getAllDestinations: () => api.get('/destinations'),
  getDestination: (destinationId) => api.get(`/destinations/${destinationId}`),
  createDestination: (destinationData) => api.post('/destinations', destinationData),
  updateDestination: (destinationId, destinationData) => api.put(`/destinations/${destinationId}`, destinationData),
  deleteDestination: (destinationId) => api.delete(`/destinations/${destinationId}`),
  searchDestinations: (query, country) => api.get('/destinations/search', { params: { q: query, country } })
}; 