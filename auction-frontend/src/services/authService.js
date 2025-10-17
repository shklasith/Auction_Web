import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add token to requests if available
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async register(userData) {
    try {
      console.log('Registering user with data:', { ...userData, password: '***', confirmPassword: '***' });
      const response = await this.api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      
      if (response.data.success && response.data.token) {
        console.log('Registration successful, storing token and user');
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      } else {
        console.warn('Registration succeeded but no token received');
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network Error: Cannot connect to server. Please ensure the backend is running on http://localhost:5104',
          errors: ['Unable to reach the server. The backend may not be running.']
        };
      }
      
      // Handle server errors
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || [error.message]
      };
    }
  }

  async login(credentials) {
    try {
      console.log('Logging in with:', { usernameOrEmail: credentials.usernameOrEmail, password: '***' });
      const response = await this.api.post('/auth/login', credentials);
      console.log('Login response:', response.data);
      
      if (response.data.success && response.data.token) {
        console.log('Login successful, storing token and user');
        this.setToken(response.data.token);
        this.setUser(response.data.user);
      } else {
        console.warn('Login request succeeded but no token received');
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network Error: Cannot connect to server. Please ensure the backend is running on http://localhost:5104',
          errors: ['Unable to reach the server. The backend may not be running.']
        };
      }
      
      // Handle server errors
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        errors: error.response?.data?.errors || [error.message]
      };
    }
  }

  async getProfile() {
    try {
      const response = await this.api.get('/auth/profile');
      if (response.data) {
        this.setUser(response.data);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(formData) {
    try {
      const response = await this.api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success && response.data.user) {
        this.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
        errors: error.response?.data?.errors || [error.message]
      };
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await this.api.post('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Password change failed',
        errors: error.response?.data?.errors || [error.message]
      };
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setToken(token) {
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  isAdmin() {
    const user = this.getUser();
    return user?.role === 'Administrator' || user?.role === 2;
  }

  isSeller() {
    const user = this.getUser();
    return user?.role === 'Seller' || user?.role === 1 || user?.role === 'Administrator' || user?.role === 2;
  }

  isBuyer() {
    const user = this.getUser();
    return user?.role === 'Buyer' || user?.role === 0;
  }
}

export default new AuthService();

