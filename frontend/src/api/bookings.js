import api from './config';

export const bookingsAPI = {
  getUserBookings: () => api.get('/bookings'),
  getBooking: (bookingId) => api.get(`/bookings/${bookingId}`),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  updateBooking: (bookingId, bookingData) => api.put(`/bookings/${bookingId}`, bookingData),
  cancelBooking: (bookingId) => api.post(`/bookings/${bookingId}/cancel`),
  getAllBookings: () => api.get('/admin/bookings') // Admin only
}; 