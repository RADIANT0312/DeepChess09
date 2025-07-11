import apiClient from './index.js';

/**
 * 游戏相关 API
 */
export const game = {
  /**
   * 创建新游戏
   * @param {Object} gameConfig - 游戏配置
   * @param {string} gameConfig.opponent - 对手类型 (AI/player)
   * @param {string} gameConfig.difficulty - 难度级别
   * @param {string} gameConfig.timeControl - 时间控制
   * @returns {Promise} API 响应
   */
  createGame: (gameConfig) => {
    return apiClient.post('/game/create', gameConfig);
  },

  /**
   * 加入游戏
   * @param {string} gameId - 游戏 ID
   * @returns {Promise} API 响应
   */
  joinGame: (gameId) => {
    return apiClient.post(`/game/${gameId}/join`);
  },

  /**
   * 进行移动
   * @param {string} gameId - 游戏 ID
   * @param {Object} move - 移动数据
   * @param {string} move.from - 起始位置
   * @param {string} move.to - 目标位置
   * @param {string} move.promotion - 升变棋子类型 (可选)
   * @returns {Promise} API 响应
   */
  makeMove: (gameId, move) => {
    return apiClient.post(`/game/${gameId}/move`, { move });
  },

  /**
   * 获取游戏状态
   * @param {string} gameId - 游戏 ID
   * @returns {Promise} API 响应
   */
  getGameState: (gameId) => {
    return apiClient.get(`/game/${gameId}/state`);
  },

  /**
   * 认输
   * @param {string} gameId - 游戏 ID
   * @returns {Promise} API 响应
   */
  resign: (gameId) => {
    return apiClient.post(`/game/${gameId}/resign`);
  },

  /**
   * 提议和棋
   * @param {string} gameId - 游戏 ID
   * @returns {Promise} API 响应
   */
  offerDraw: (gameId) => {
    return apiClient.post(`/game/${gameId}/draw`);
  },

  /**
   * 接受/拒绝和棋提议
   * @param {string} gameId - 游戏 ID
   * @param {boolean} accept - 是否接受
   * @returns {Promise} API 响应
   */
  respondToDraw: (gameId, accept) => {
    return apiClient.post(`/game/${gameId}/draw/respond`, { accept });
  }
};
