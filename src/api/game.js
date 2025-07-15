import apiClient from "./index.js";

/**
 * 对弈游戏相关 API (game page1)
 */
export const game = {
  /**
   * 创建新的对弈游戏，与AI对局
   * @param {Object} gameConfig - 游戏配置
   * @param {string} gameConfig.color - 用户执棋颜色 (white|black)
   * @param {string} gameConfig.difficulty - AI难度等级 (easy|medium|hard)
   *   - easy: 简单（约1200 ELO）
   *   - medium: 中等（约1600 ELO）
   *   - hard: 困难（约2000 ELO）
   * @returns {Promise} API 响应
   */
  createMatch: (gameConfig) => {
    return apiClient.post("/game/match", gameConfig);
  },

  /**
   * 获取对局当前状态
   * @param {string} gameId - 对局ID
   * @returns {Promise} API 响应
   */
  getGameState: (gameId) => {
    return apiClient.get(`/game/${gameId}`);
  },

  /**
   * 提交用户走法，返回AI应对
   * @param {string} gameId - 对局ID
   * @param {string} move - 走法，使用标准代数记号法，格式为{from}{to}，如"e2e4"
   * @returns {Promise} API 响应
   */
  makeMove: (gameId, move) => {
    return apiClient.post(`/game/${gameId}/move`, { move });
  },

  /**
   * 用户认输，结束对局
   * @param {string} gameId - 对局ID
   * @returns {Promise} API 响应
   */
  resign: (gameId) => {
    return apiClient.post(`/game/${gameId}/resign`);
  },
};
