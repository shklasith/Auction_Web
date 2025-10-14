import axios from 'axios';

const API_URL = 'http://localhost:5106/api';

const adminService = {
  // Admin Profile
  getAdminProfile: async () => {
    const response = await axios.get(`${API_URL}/admin/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  updateAdminProfile: async (formData) => {
    const response = await axios.put(`${API_URL}/admin/profile`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getActivityLog: async (days = 30) => {
    const response = await axios.get(`${API_URL}/admin/activity-log?days=${days}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  getStatistics: async () => {
    const response = await axios.get(`${API_URL}/admin/statistics`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // Dashboard
  getDashboardData: async () => {
    const response = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  // User Management
  getUsers: async (page = 1, pageSize = 20, searchTerm = '', role = null) => {
    const params = new URLSearchParams({ page, pageSize });
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (role) params.append('role', role);
    
    const response = await axios.get(`${API_URL}/admin/users?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  getUserDetail: async (userId) => {
    const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await axios.post(`${API_URL}/admin/toggle-user-status`, { userId }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  },

  createAdmin: async (adminData) => {
    const response = await axios.post(`${API_URL}/admin/create-admin`, adminData, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    return response.data;
  }
};

export default adminService;

