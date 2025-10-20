import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5104/api';

// Create axios instance for admin service
const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const adminService = {
  // Admin Profile
  getAdminProfile: async () => {
    const response = await adminApi.get('/admin/profile');
    return response.data;
  },

  updateAdminProfile: async (formData) => {
    const response = await adminApi.put('/admin/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getActivityLog: async (days = 30) => {
    const response = await adminApi.get(`/admin/activity-log?days=${days}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await adminApi.get('/admin/statistics');
    return response.data;
  },

  // Dashboard
  getDashboardData: async () => {
    console.log('Making request to:', `${API_URL}/admin/dashboard`);
    const response = await adminApi.get('/admin/dashboard');
    console.log('Response received:', response);
    return response.data;
  },

  // User Management
  getUsers: async (page = 1, pageSize = 20, searchTerm = '', role = null) => {
    const params = new URLSearchParams({ page, pageSize });
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (role) params.append('role', role);
    
    const response = await adminApi.get(`/admin/users?${params}`);
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await adminApi.post('/admin/toggle-user-status', { userId });
    return response.data;
  },

  createAdmin: async (adminData) => {
    const response = await adminApi.post('/admin/create-admin', adminData);
    return response.data;
  }
};

export default adminService;

