import apiClient from "./index.js";

/**
 * 用户相关 API
 */
export const user = {
  /**
   * 获取用户头像（Base64编码）
   * @returns {Promise<string>} 头像 Base64 数据
   */
  getAvatar: async () => {
    const fallback = "/default-avatar.jpg";
    try {
      const response = await apiClient.get("/user/avatar");
      return response.data.avatar;
    } catch (err) {
      console.error("头像加载失败：", err);
      return fallback;
    }
  },

  /**
   * 获取用户个人信息和统计数据
   * @returns {Promise} API 响应
   */
  getProfile: () => {
    return apiClient.get("/user/profile");
  },

  /**
   * 获取用户历史对局列表，支持分页和排序
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码（默认1，最小1）
   * @param {number} params.limit - 每页数量（默认20，范围1-100）
   * @param {string} params.sort - 排序方式：
   *   - 'date_desc': 按日期降序（默认）
   *   - 'date_asc': 按日期升序
   *   - 'result_win': 只显示获胜对局
   *   - 'result_loss': 只显示失败对局
   *   - 'result_draw': 只显示平局
   * @returns {Promise} API 响应
   */
  getHistory: (params = {}) => {
    return apiClient.get("/user/history", { params });
  },

  /**
   * 获取单局详细复盘数据
   * @param {string} gameId - 对局ID（必须是用户参与的对局）
   * @returns {Promise} API 响应
   */
  getGameDetails: (gameId) => {
    return apiClient.get(`/user/history/${gameId}`);
  },

  /**
   * 获取AI对用户的棋风和技术水平分析
   * @returns {Promise} API 响应
   */
  getAnalysis: () => {
    return apiClient.get("/user/analysis");
  },
};
