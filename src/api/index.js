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

// Add a response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，可能需要重新登录
          console.warn('未授权访问，请重新登录');
          // 这里可以添加重定向到登录页面的逻辑
          break;
        case 403:
          console.warn('访问被禁止');
          break;
        case 404:
          console.warn('请求的资源不存在');
          break;
        case 500:
          console.error('服务器内部错误');
          break;
        default:
          console.error(`请求失败: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error('网络错误，请检查您的网络连接');
    } else {
      console.error('请求配置错误:', error.message);
    }
    return Promise.reject(error);
  }
);

// 导入各个模块
export { auth } from './auth.js';
export { user } from './user.js';
export { game } from './game.js';

// 导出 axios 实例供直接使用
export default apiClient;
// 192.168.201.106:8000