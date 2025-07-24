import api from './config';

export const vehiclesAPI = {
  getAllVehicles: () => api.get('/vehicles'),
  getVehicle: (vehicleId) => api.get(`/vehicles/${vehicleId}`),
  createVehicle: (vehicleData) => api.post('/vehicles', vehicleData),
  updateVehicle: (vehicleId, vehicleData) => api.put(`/vehicles/${vehicleId}`, vehicleData),
  deleteVehicle: (vehicleId) => api.delete(`/vehicles/${vehicleId}`),
  getVehicleCalendar: (vehicleId) => api.get(`/vehicles/${vehicleId}/calendar`),
  requestVehicleBooking: (bookingData) => api.post('/vehicle-bookings', bookingData),
  getAllVehicleBookings: () => api.get('/vehicle-bookings'), // Admin: all, User: own
  updateVehicleBookingStatus: (bookingId, status) => api.patch(`/vehicle-bookings/${bookingId}`, { status }),
  updateVehicleBooking: (bookingId, data) => api.patch(`/vehicle-bookings/${bookingId}`, data), // PATCH arbitrary fields
}; 