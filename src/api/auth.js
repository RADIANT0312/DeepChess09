import apiClient from "./index.js";

/**
 * 认证相关 API
 */
export const auth = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.username - 用户名，3-20字符，支持字母数字下划线
   * @param {string} credentials.password - 密码，6-128字符
   * @returns {Promise} API 响应
   */
  login: (credentials) => {
    return apiClient.post("/auth/login", credentials);
  },

  /**
   * 用户登出，清除token
   * @returns {Promise} API 响应
   */
  logout: () => {
    return apiClient.post("/auth/logout");
  },

  /**
   * 检查登录状态
   * @returns {Promise} API 响应
   */
  checkStatus: () => {
    return apiClient.get("/start");
  },

  /**
   * register
   */
  register: (userData) => {
    return apiClient.post("/auth/register", userData);
  },
};
