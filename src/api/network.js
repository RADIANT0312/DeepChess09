import apiClient from "./index.js";

/**
 * 网络状态检测相关 API
 */
export const network = {
  /**
   * 检测与服务器的延迟
   * @returns {Promise<number>} 返回延迟时间（毫秒），如果失败返回 -1
   */
  async checkLatency() {
    try {
      const startTime = performance.now();
      await apiClient.get("/ping", {
        timeout: 5000, // 5秒超时
      });
      const endTime = performance.now();
      return Math.round(endTime - startTime);
    } catch (error) {
      console.warn("延迟检测失败:", error);
      return -1; // 返回-1表示连接失败
    }
  },

  /**
   * 检查服务器连接状态
   * @returns {Promise<Object>} 返回连接状态信息
   */
  async checkConnection() {
    try {
      const latency = await this.checkLatency();

      if (latency === -1) {
        return {
          status: "disconnected",
          latency: -1,
          message: "无法连接到服务器",
        };
      }

      let status = "good";
      let message = "连接良好";

      if (latency > 1000) {
        status = "poor";
        message = "连接较差";
      } else if (latency > 500) {
        status = "fair";
        message = "连接一般";
      }

      return {
        status,
        latency,
        message,
      };
    } catch (error) {
      return {
        status: "error",
        latency: -1,
        message: "网络检测错误",
      };
    }
  },
};
