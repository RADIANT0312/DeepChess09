import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Assuming the backend is served on the same domain
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const login = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

export const register = (userData) => {
  // The API documentation does not specify a registration endpoint.
  // Using a placeholder endpoint '/auth/register'.
  // This should be replaced with the actual endpoint when available.
  return apiClient.post('/auth/register', userData);
};

export default apiClient;
// 192.168.201.106:8000