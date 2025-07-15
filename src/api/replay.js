import apiClient from "./index.js";

/**
 * 复盘相关 API
 */
export const replay = {
  /**
   * 获取单局完整复盘数据，包含所有走法和棋盘状态
   * @param {string} gameId - 对局ID
   * @returns {Promise} API 响应
   */
  getReplay: (gameId) => {
    return apiClient.get(`/replay/${gameId}`);
  },
};
