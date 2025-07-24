import api from './config';

export const toursAPI = {
  getAllTours: () => api.get('/tours'),
  getTour: (tourId) => api.get(`/tours/${tourId}`),
  createTour: (tourData) => api.post('/tours', tourData),
  updateTour: (tourId, tourData) => api.put(`/tours/${tourId}`, tourData),
  deleteTour: (tourId) => api.delete(`/tours/${tourId}`),
  addReview: (tourId, reviewData) => api.post(`/tours/${tourId}/reviews`, reviewData)
}; 