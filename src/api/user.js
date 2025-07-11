import apiClient from './index.js';

/**
 * 用户相关 API
 */
export const user = {
    /**
     * 获取用户头像
     * @returns {Promise<string>} 头像 URL 或 base64 数据
     */
    getAvatar: async () => {
        const fallback = '/default-avatar.jpg';
        try {
            const response = await apiClient.get('/user/avatar');
            const avatar = response.data.avatar;
            return avatar.startsWith('data:image')
                ? avatar
                : 'data:image/png;base64,' + avatar;
        } catch (err) {
            console.error('头像加载失败：', err);
            return fallback;
        }
    },

    /**
     * 获取用户资料
     * @returns {Promise} API 响应
     */
    getProfile: () => {
        return apiClient.get('/user/profile');
    },

    /**
     * 更新用户资料
     * @param {Object} profileData - 用户资料数据
     * @returns {Promise} API 响应
     */
    updateProfile: (profileData) => {
        return apiClient.put('/user/profile', profileData);
    },

    /**
     * 上传用户头像
     * @param {File} avatarFile - 头像文件
     * @returns {Promise} API 响应
     */
    uploadAvatar: async (avatarFile) => {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const fallback = '/default-avatar.jpg';
        try {
            const response = await apiClient.post('/user/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // 假设成功响应会返回新的头像数据
            const avatar = response.data?.avatar;
            if (avatar) {
                return avatar.startsWith('data:image')
                    ? avatar
                    : 'data:image/png;base64,' + avatar;
            }
            // 如果响应中没有头像数据，也返回默认头像
            return fallback;
        } catch (err) {
            console.error('头像上传失败：', err);
            // 上传失败时返回默认头像
            return fallback;
        }
    },

    /**
     * 获取游戏历史
     * @param {Object} params - 查询参数
     * @param {number} params.page - 页码
     * @param {number} params.limit - 每页数量
     * @param {string} params.sort - 排序方式
     * @returns {Promise} API 响应
     */
    getHistory: (params = {}) => {
        return apiClient.get('/user/history', { params });
    },

    /**
     * 获取游戏详情
     * @param {string} gameId - 游戏 ID
     * @returns {Promise} API 响应
     */
    getGameDetails: (gameId) => {
        return apiClient.get(`/user/history/${gameId}`);
    },

    /**
     * 保存游戏分析
     * @param {string} gameId - 游戏 ID
     * @param {string} comment - 分析评论
     * @returns {Promise} API 响应
     */
    saveGameAnalysis: (gameId, comment) => {
        return apiClient.post(`/user/history/${gameId}/analysis`, { comment });
    },

    /**
     * 获取 AI 分析
     * @param {string} gameId - 游戏 ID
     * @param {Array} moves - 棋谱走法
     * @returns {Promise} API 响应
     */
    getAIAnalysis: (gameId, moves) => {
        return apiClient.post(`/user/history/${gameId}/ai-analysis`, { moves });
    }
};
