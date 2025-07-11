import apiClient from './index.js';

/**
 * 认证相关 API
 */
export const auth = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.username - 用户名
   * @param {string} credentials.password - 密码
   * @returns {Promise} API 响应
   */
  login: (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @param {string} userData.username - 用户名
   * @param {string} userData.email - 邮箱
   * @param {string} userData.password - 密码
   * @returns {Promise} API 响应
   */
  register: (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * 用户登出
   * @returns {Promise} API 响应
   */
  logout: () => {
    return apiClient.post('/auth/logout');
  },

  /**
   * 刷新 token
   * @returns {Promise} API 响应
   */
  refreshToken: () => {
    return apiClient.post('/auth/refresh');
  }
};
