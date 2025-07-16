import apiClient from "./index.js";

/**
 * 教学相关 API (game page2)
 */
export const teaching = {
  /**
   * 获取所有可用的教学课程列表
   * @returns {Promise} API 响应
   */
  createLesson: (lessonConfig) => {
    return apiClient.post("/teaching/start", lessonConfig);
  },

  /**
   * 获取特定教学课程的详细信息和初始状态
   * @param {string} lessonId - 课程ID
   * @returns {Promise} API 响应
   */
  getLesson: (lessonId) => {
    return apiClient.get(`/teaching/${lessonId}`);
  },

  /**
   * 在教学模式下提交走法，获得详细的AI指导
   * @param {string} lessonId - 课程ID
   * @param {string} move - 走法，格式为{from}{to}，如"e2e4"
   * @returns {Promise} API 响应
   */
  makeMove: (lessonId, move) => {
    return apiClient.post(`/teaching/${lessonId}/move`, { move });
  },
};
