import api from './config';

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

export const getMyDetails = (token) => {
  return api.get('/auth/me');
};

export const changePassword = (passwordData) => {
  return api.post('/auth/change-password', passwordData);
};

export const forgetPassword = (emailData) => {
  return api.post('/auth/forgot-password', emailData);
};

export const resetPassword = (resetData) => {
  return api.post('/auth/reset-password', resetData);
};

export const getAllUsers = () => {
  return api.get('/auth/admin/users');
};

export const deleteUser = (userId) => {
  return api.delete(`/auth/admin/users/${userId}`);
};

export const toggleAdminStatus = (userId) => {
  return api.patch(`/auth/admin/users/${userId}/toggle-admin`);
};
