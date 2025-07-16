<template>
  <div class="main-layout">
    <div class="content-wrapper" :class="{ 'shifted': true }">
      <div class="user-center-container">
        <header class="user-center-header">
          <h1>{{ profile.username }}</h1>
        </header>        <section class="profile-section card">
          <h2>Basic Information</h2>
          <div v-if="profile" class="profile-details">
            <div class="avatar-section">
              <div class="avatar-wrapper">
                <img v-if="avatar" :src="avatar" alt="User Avatar" class="user-avatar" />
                <div v-else class="avatar-placeholder">No Avatar</div>
              </div>
              <div class="avatar-info">
                <p><strong>User ID:</strong> <span class="profile-value">{{ profile.id }}</span></p>
                <p><strong>Username:</strong> <span class="profile-value">{{ profile.username }}</span></p>
                <!-- <p><strong>Email:</strong> <span class="profile-value">{{ profile.email }}</span></p> -->
                <p><strong>Account Created At:</strong> <span class="profile-value">{{ formatDateTime(profile.createdAt)
                    }}</span></p>
              </div>
            </div>

            <!-- AI分析评价部分 -->
            <div class="ai-analysis-section">
              <h3 class="analysis-title">AI Analysis & Evaluation</h3>
              <div v-if="isLoadingAnalysis" class="analysis-loading">
                <div class="loading-spinner"></div>
                <p>AI is analyzing your chess style and skill level...</p>
              </div>
              <div v-else-if="userAnalysis && userAnalysis.success" class="analysis-content">
                <div class="analysis-item">
                  <div class="analysis-text" v-html="formatAnalysisText(userAnalysis.analysis.ai_analysis)"></div>
                </div>
                <div class="analysis-timestamp">
                  <small>Analysis generated: {{ formatDateTime(userAnalysis.timestamp) }}</small>
                </div>
              </div>
              <div v-else-if="userAnalysisError" class="analysis-error">
                <p>{{ userAnalysisError }}</p>
              </div>
              <div v-else class="analysis-empty">
                <p>No analysis available. Play more games to generate AI evaluation.</p>
              </div>
            </div>

          </div>
          <p v-else-if="profileError" class="error-message">{{ profileError }}</p>
          <p v-else class="loading-message">Loading profile...</p>
        </section>

        <section class="profile-section card">
          <h2>Statistics</h2>
          <div v-if="profile" class="profile-details">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-label">Total Games:</span>
                <span class="stat-value">{{ profile.stats.totalGames }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Wins:</span>
                <span class="stat-value win">{{ profile.stats.wins }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Losses:</span>
                <span class="stat-value loss">{{ profile.stats.losses }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Draws:</span>
                <span class="stat-value draw">{{ profile.stats.draws }}</span>
              </div>
            </div>
            <div class="stats-grid">
              <div class="stat-item full-width">
                <span class="stat-label">Win Rate:</span>
                <span class="stat-value win-rate">{{ (profile.stats.winRate * 100).toFixed(2) }}%</span>
              </div>
            </div>
            <div class="stats-grid">
              <div class="stat-item full-width">
                <span class="stat-label">Draw Rate:</span>
                <span class="stat-value draw-rate">{{ (profile.stats.draws / profile.stats.totalGames * 100).toFixed(2)
                  }}%</span>
              </div>
            </div>
          </div>
          <p v-else-if="profileError" class="error-message">{{ profileError }}</p>
          <p v-else class="loading-message">Loading profile...</p>
        </section>

        <section class="history-section card">
          <h2>Game History</h2>

          <div class="filters-container">
            <div class="filter-group">
              <label for="sort-by" class="filter-label">Sort By:</label>
              <select id="sort-by" v-model="sort" @change="fetchHistory" class="filter-select">
                <option value="date_desc">Date Descending</option>
                <option value="date_asc">Date Ascending</option>
                <option value="result_win">Show Wins Only</option>
                <option value="result_loss">Show Losses Only</option>
                <option value="result_draw">Show Draws Only</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="limit" class="filter-label">Items per page:</label>
              <select id="limit" v-model.number="limit" @change="fetchHistory" class="filter-select">
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div v-if="games.length > 0" class="game-list">
            <ul>
              <li v-for="game in games" :key="game.gameId" @click="fetchGameDetails(game.gameId)" class="game-item">
                <div class="game-info">
                  <p><strong>Opponent:</strong> {{ game.opponent }}</p>
                  <p><strong>Date:</strong> {{ formatDateTime(game.date) }}</p>
                </div>
                <div class="game-meta">
                  <span class="game-result" :class="game.result">{{ getResultText(game.result) }}</span>
                  <span class="game-duration">{{ formatDuration(game.duration) }}</span>
                  <span class="game-color" :class="game.userColor">{{ game.userColor === 'white' ? 'White' : 'Black'
                  }}</span>
                  <button @click.stop="analyzeGame(game.gameId)" class="analyze-button" title="review">
                    review
                  </button>
                </div>
              </li>
            </ul>

            <div class="pagination">
              <button @click="changePage(pagination.page - 1)" :disabled="!pagination.hasPrev"
                class="pagination-button">Previous</button>
              <span class="pagination-info">{{ pagination.page }} / {{ pagination.totalPages }}</span>
              <button @click="changePage(pagination.page + 1)" :disabled="!pagination.hasNext"
                class="pagination-button">Next</button>
            </div>
          </div>
          <p v-else-if="historyError" class="error-message">{{ historyError }}</p>
          <p v-else class="no-data-message">No game history available.</p>
        </section>

        <!-- <section v-if="selectedGameDetails" class="game-details-section card">
          <h2 class="section-title">Game Replay (ID: {{ selectedGameDetails.gameId }})</h2>
          <button @click="selectedGameDetails = null" class="close-details-button">Close Details</button>

          <div v-if="selectedGameDetails" class="game-replay">
            <h3 class="section-sub-heading">Move Sequence</h3>
            <ol class="move-list">
              <li v-for="(move, index) in selectedGameDetails.moves" :key="index" class="move-item">
                <span class="move-notation">{{ index + 1 }}. {{ move }}</span>
                <div v-if="selectedGameDetails.comments[index]" class="move-comments">
                  <p v-if="selectedGameDetails.comments[index].userComment"><strong>My Comment:</strong> {{ selectedGameDetails.comments[index].userComment }}</p>
                  <p v-if="selectedGameDetails.comments[index].aiComment"><strong>AI Comment:</strong> {{ selectedGameDetails.comments[index].aiComment }}</p>
                </div>
              </li>
            </ol>

            <h3 class="section-sub-heading">Board States (After each move)</h3>
            <div class="board-states-viewer">
              <pre>{{ selectedGameDetails.boardStates.join('\n') }}</pre>
            </div>

            <h3 class="section-sub-heading">Timestamps (Per move)</h3>
            <ul class="timestamp-list">
              <li v-for="(timestamp, index) in selectedGameDetails.timestamps" :key="index">
                Move {{ index + 1 }}: {{ formatDateTime(timestamp) }}
              </li>
            </ul>
            <div v-if="selectedGameDetails" class="global-analysis-section">
            <h3 class="section-sub-heading">全局复盘分析</h3>
            <comment 
                :game-id="selectedGameDetails.gameId"
                :existing-comment="selectedGameDetails.analysisComment"
                @comment-updated="handleAnalysisUpdate"
            />
            </div>
          </div>
          <p v-else-if="gameDetailsError" class="error-message">{{ gameDetailsError }}</p>
        </section> -->
      </div>
    </div>
  </div>
</template>

<script>
import { user } from '@/api';
import { marked } from 'marked';

export default {
  name: 'ProfileIndex', // 组件名称
  components: {
  },
  data() {
    return {
      // 添加一个开关来控制是否使用模拟数据
      testMode: false, // 设置为 true 来使用模拟数据，false 来调用 API
      profile: null,
      profileError: null,
      avatar: '',
      // 添加用户分析相关状态
      userAnalysis: null,
      userAnalysisError: null,
      isLoadingAnalysis: false,
      games: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
      sort: 'date_desc',
      limit: 20,
      historyError: null,
      selectedGameDetails: null,
      gameDetailsError: null,
      // 新增状态，用于控制内容区域的下移
      isTopBarExpanded: false,
    };
  },
  created() {
    // 配置 marked 选项
    marked.setOptions({
      gfm: true, // 启用 GitHub Flavored Markdown
      breaks: true, // 启用换行符转换为 <br>
      sanitize: false, // 不过滤 HTML (Vue 会自动处理)
      silent: true, // 静默模式，避免抛出错误
    });

    if (this.testMode) {
      // 如果是测试模式，加载模拟数据
      this.loadMockData();
    } else {
      // 否则，从 API 获取数据
      this.fetchProfile();
      this.fetchAvatar();
      this.fetchUserAnalysis();
      this.fetchHistory();
    }
  },
  methods: {
    // 新增：加载模拟数据的方法
    loadMockData() {
      // --- 模拟的 profile 数据 ---
      this.profile = {
        id: 'user_12345',
        username: 'DeepChessPlayer',
        email: 'player@example.com',
        createdAt: '2024-01-15T10:30:00Z',
        stats: {
          totalGames: 150,
          wins: 90,
          losses: 45,
          draws: 15,
          winRate: 0.60
        }
      };
      this.profileError = null;

      // 设置模拟头像
      this.avatar = '/default-avatar.jpg';

      // --- 模拟的用户分析数据 ---
      this.userAnalysis = {
        success: true,
        analysis: {
          ai_analysis: "根据您的对局历史分析，您是一位积极进攻型棋手，偏好主动出击和战术组合。您的技术水平处于中级到高级之间。在开局方面，您的理论基础较为扎实，熟悉多种开局体系；战术敏锐度较高，能够发现并执行组合；残局技巧不错，基本残局掌握良好。但在中局位置判断方面有时不够准确，时间管理需要改进，偶有时间压力下的失误，复杂局面的计算深度也有待提高。建议您多练习典型中局位置的判断，加强计算训练以提高战术视野，并学习时间分配策略来避免时间紧张的情况。"
        },
        timestamp: '2024-07-09T10:30:00Z'
      };
      this.userAnalysisError = null;
      this.isLoadingAnalysis = false;

      // --- 模拟的 games 数据（游戏历史列表） ---
      this.games = [
        {
          gameId: 'game_abc001',
          opponent: 'AI_Master',
          date: '2024-07-09T14:20:00Z',
          result: 'win',
          duration: 3600,
          userColor: 'white'
        },
        {
          gameId: 'game_def002',
          opponent: 'RookieBot',
          date: '2024-07-08T18:05:00Z',
          result: 'loss',
          duration: 2400,
          userColor: 'black'
        },
        {
          gameId: 'game_ghi003',
          opponent: 'ChessGuru',
          date: '2024-07-07T09:45:00Z',
          result: 'draw',
          duration: 4000,
          userColor: 'white'
        },
        {
          gameId: 'game_jkl004',
          opponent: 'Tactician',
          date: '2024-07-06T11:10:00Z',
          result: 'win',
          duration: 2800,
          userColor: 'black'
        },
        {
          gameId: 'game_jkl005',
          opponent: 'Tactician',
          date: '2024-07-06T11:10:00Z',
          result: 'win',
          duration: 2800,
          userColor: 'black'
        }
      ];

      // --- 模拟的 pagination 数据 ---
      this.pagination = {
        page: 1,
        limit: 20,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      this.historyError = null;

      // --- 模拟的 selectedGameDetails 数据 ---
      this.selectedGameDetails = {
        gameId: 'game_abc001',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'],
        boardStates: [
          'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
          'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
        ],
        timestamps: [
          '2024-07-09T14:20:00Z',
          '2024-07-08T14:20:10Z',
          '2024-07-01T14:20:25Z',
          '2024-07-02T14:20:40Z',
          '2024-07-03T14:20:55Z',
          '2024-07-04T14:21:10Z',
        ],
        comments: [
          { userComment: '开局不错', aiComment: '最佳开局。' },
          { userComment: '', aiComment: '不错的应对。' },
          null,
          { userComment: '犯了个错误', aiComment: '一个次优着法。' },
          null,
          { userComment: '妙手', aiComment: '关键性一步。' }
        ],
        analysisComment: '这局棋开局稳健，中盘发生激烈对抗，最终抓住对手失误获胜。'
      };
      this.gameDetailsError = null;
    },
    // 处理评论组件的点击事件
    handleAnalysisUpdate({ comments }) {
      if (!this.selectedGameDetails) return;

      this.$set(this.selectedGameDetails, 'analysisComment', comments);

      // 自动保存到服务器
      this.saveGameAnalysis();
    },
    analyzeGame(gameId) {
      // 如果已经是当前选中游戏，则不再重复获取
      if (this.selectedGameDetails && this.selectedGameDetails.gameId === gameId) {
        return;
      }

      this.fetchGameDetails(gameId);

      // 滚动到详情区域
      this.$nextTick(() => {
        const detailsSection = document.querySelector('.game-details-section');
        if (detailsSection) {
          detailsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    },

    async saveGameAnalysis() {
      if (!this.selectedGameDetails || !this.selectedGameDetails.analysisComment) return;

      try {
        await user.saveGameAnalysis(
          this.selectedGameDetails.gameId,
          this.selectedGameDetails.analysisComment
        );
      } catch (error) {
        console.error('保存复盘分析失败:', error);
        this.$message.error('保存分析失败，请稍后重试');
      }
    },
    /**
     * 处理 TopBar 组件发出的展开状态变化事件。
     * @param {boolean} isExpanded - 如果 TopBar 展开或被固定，则为 true，否则为 false。
     */
    handleTopBarExpansion(isExpanded) {
      this.isTopBarExpanded = isExpanded;
    },

    /**
     * 获取用户头像
     */
    async fetchAvatar() {
      try {
        this.avatar = await user.getAvatar();
      } catch (error) {
        console.error('Failed to fetch avatar:', error);
        // 如果获取失败，使用默认头像
        this.avatar = '/default-avatar.jpg';
      }
    },

    /**
     * 获取AI对用户的分析评价
     */
    async fetchUserAnalysis() {
      this.isLoadingAnalysis = true;
      this.userAnalysisError = null;
      try {
        const response = await user.getAnalysis();
        this.userAnalysis = response.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.userAnalysisError = 'Unauthorized. Please log in.';
        } else if (error.response && error.response.status === 404) {
          this.userAnalysisError = 'Analysis not available. Please play more games to generate analysis.';
        } else {
          this.userAnalysisError = 'Failed to fetch user analysis. Please try again later.';
          console.error('Error fetching user analysis:', error);
        }
      } finally {
        this.isLoadingAnalysis = false;
      }
    },
    /**
     * Fetches the user's profile information and statistics.
     */
    async fetchProfile() {
      try {
        const response = await user.getProfile();
        this.profile = response.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.profileError = 'Unauthorized. Please log in.';
        } else {
          this.profileError = 'Failed to fetch profile information. Please try again later.';
          console.error('Error fetching profile:', error);
        }
      }
    },

    /**
     * Fetches the user's game history with pagination and sorting.
     */
    async fetchHistory() {
      try {
        this.historyError = null; // 清除之前的错误信息
        const response = await user.getHistory({
          page: this.pagination.page,
          limit: this.limit,
          sort: this.sort,
        });
        this.games = response.data.games;
        this.pagination = response.data.pagination;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            this.historyError = 'Unauthorized. Please log in.';
          } else if (error.response.status === 422) {
            this.historyError = 'Query parameter validation failed.';
          } else {
            this.historyError = 'Failed to fetch game history.';
          }
        } else {
          this.historyError = 'Failed to fetch game history. Please check your network connection.';
        }
        console.error('Error fetching history:', error);
        this.games = []; // 错误时清空游戏列表
      }
    },

    /**
     * Changes the current page for game history.
     * @param {number} newPage - The new page number.
     */
    changePage(newPage) {
      if (newPage >= 1 && newPage <= this.pagination.totalPages) {
        this.pagination.page = newPage;
        this.fetchHistory(); // 重新获取数据
      }
    },

    /**
     * Fetches detailed information for a specific game.
     * @param {string} gameId - The ID of the game to fetch.
     */
    async fetchGameDetails(gameId) {
      this.selectedGameDetails = null; // 清除之前的详情
      this.gameDetailsError = null; // 清除之前的错误
      try {
        const response = await user.getGameDetails(gameId);
        // 确保有comments数组和analysisComment对象
        response.data.comments = response.data.comments || [];
        response.data.analysisComment = response.data.analysisComment || null;
        this.selectedGameDetails = response.data;
      } catch (error) {
        if (error.response) {
          if (error.response.status === 401) {
            this.gameDetailsError = 'Unauthorized. Please log in.';
          } else if (error.response.status === 404) {
            this.gameDetailsError = 'Game not found or you do not have permission to access it.';
          } else {
            this.gameDetailsError = 'Failed to fetch game details.';
          }
        } else {
          this.gameDetailsError = 'Failed to fetch game details. Please check your network connection.';
        }
        console.error('Error fetching game details:', error);
      }
    },

    /**
     * Formats an ISO 8601 date string into a more readable format.
     * @param {string} dateTimeString - The date and time string in ISO 8601 format.
     * @returns {string} The formatted date and time.
     */
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return '';
      // 使用 'en-US' 语言环境和小时/分钟格式
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateTimeString).toLocaleDateString('en-US', options);
    },

    /**
     * Formats duration in seconds into a more readable string (e.g., "30 minutes 0 seconds").
     * @param {number} seconds - The duration in seconds.
     * @returns {string} The formatted duration.
     */
    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} minutes ${remainingSeconds} seconds`;
    },

    /**
     * 使用 marked 库格式化分析文本
     * @param {string} text - 原始分析文本
     * @returns {string} 格式化后的HTML文本
     */
    formatAnalysisText(text) {
      if (!text) return '';
      
      try {
        // 使用 marked 解析 Markdown
        let html = marked.parse(text);
      
        // 移除多余的空白字符和空行
        html = html
          .replace(/\n\s*\n/g, '\n') // 移除连续的空行
          .replace(/>\s+</g, '><')    // 移除标签间的空白
          .replace(/\s+/g, ' ')       // 将多个空格压缩为单个空格
          .trim();                    // 移除首尾空白
        
        return html;
      } catch (error) {
        console.error('Error parsing markdown:', error);
        // 如果解析失败，返回原始文本并进行基本的换行处理
        return text.replace(/\n/g, '<br>');
      }
    },

    /**
     * Returns a user-friendly text for game results.
     * @param {string} result - The game result ('win', 'loss', 'draw').
     * @returns {string} The display text for the result.
     */
    getResultText(result) {
      switch (result) {
        case 'win':
          return 'Win';
        case 'loss':
          return 'Loss';
        case 'draw':
          return 'Draw';
        default:
          return result;
      }
    }
  }
}
</script>

<style scoped>
/* 主要布局容器，用于整体页面布局 */
.main-layout {
  display: flex;
  flex-direction: column;
  /* 垂直堆叠子元素 */
  min-height: 100vh;
  /* 最小高度为视口高度，确保页面始终占据一整屏 */
}

/* 内容包裹器，用于根据 TopBar 状态调整自身位置 */
.content-wrapper {
  flex-grow: 1;
  /* 允许内容区域填充可用空间 */
  padding-top: 6px;
  /* 初始顶部填充，与折叠状态的 TopBar 高度一致 */
  transition: padding-top 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  /* 顶部填充的平滑过渡动画 */
  overflow-y: auto;
  /* 允许垂直方向滚动条自动出现 */
  -webkit-overflow-scrolling: touch;
  /* 提高 iOS 设备上的滚动平滑度 */
  display: flex;
  /* 使用 flex 布局来更好地控制子元素 */
}

/* 当 TopBar 展开或固定时，为内容包裹器添加的类，用于下移内容 */
.content-wrapper.shifted {
  padding-top: 56px;
  /* 当 TopBar 展开时，下移内容区域的高度 */
}

/* 用户中心主要内容容器 (之前名为 .user-center-container) */
.user-center-container {
  max-width: 960px;
  /* 最大宽度限制内容区域 */
  margin: 30px auto;
  /* 自动左右居中，上下边距 30px */
  padding: 20px;
  background-color: #697a71;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  /* 轻微阴影，增加层次感 */
  overflow-y: auto;
  /* 允许在容器内部垂直滚动 */
  flex-grow: 1;
  /* 填充可用空间 */
  min-height: 0;
  /* 在 flex 布局中允许收缩 */
  max-height: calc(100vh - 120px);
  /* 设置最大高度，减去顶部padding和margin */
  
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

.user-center-container::-webkit-scrollbar {
  display: none; /* WebKit browsers */
}

/* 页面头部样式 */
.user-center-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #c5cacf;
}

.user-center-header h1 {
  color: #333;
  font-size: 2.5em;
  margin: 0;
  font-weight: 600;
}

/* 通用卡片样式 */
.card {
  background-color: #D1D8BE;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 30px;
}

h2 {
  color: #2c3e50;
  font-size: 1.8em;
  margin-top: 0;
  margin-bottom: 25px;
  border-bottom: 2px solid #7f91a3;
  padding-bottom: 10px;
  font-weight: 500;
}

.section-sub-heading {
  color: #495057;
  font-size: 1.3em;
  margin-top: 30px;
  margin-bottom: 20px;
  font-weight: 500;
}

/* 个人资料部分样式 */
.profile-details p {
  margin: 12px 0;
  font-size: 1.05em;
  color: #555;
  display: flex;
  justify-content: space-between;
  padding-bottom: 5px;
  border-bottom: 1px dashed #d4d5d6;
  /* 虚线分隔 */
}

.profile-details p:last-of-type {
  border-bottom: none;
  /* 最后一行没有虚线 */
}

.profile-value {
  font-weight: 600;
  color: #000000;
}

/* 头像部分样式 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.avatar-wrapper {
  flex-shrink: 0;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #819A91;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.8rem;
  text-align: center;
  border: 3px solid #ddd;
}

.avatar-info {
  flex-grow: 1;
}

.avatar-info p {
  margin: 10;
  word-break: break-all;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  /* 响应式网格布局 */
  gap: 15px;
  margin-top: 20px;
}

.stat-item {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);
}

.stat-label {
  display: block;
  font-size: 0.9em;
  color: #777;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #34495e;
}

/* 统计数据不同结果的颜色 */
.stat-value.win {
  color: #28a745;
}

.stat-value.loss {
  color: #dc3545;
}

.stat-value.draw {
  color: #ffc107;
}

.stat-value.win-rate {
  color: #007bff;
}

.stat-item.full-width {
  grid-column: 1 / -1;
  /* 跨越所有列 */
}

/* 筛选器样式 */
.filters-container {
  display: flex;
  flex-wrap: wrap;
  /* 允许换行 */
  gap: 20px;
  margin-bottom: 30px;
  padding: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label {
  font-weight: 600;
  color: #555;
  font-size: 0.95em;
}

.filter-select {
  padding: 10px 20px;
  border: 1px solid #819A91;
  border-radius: 6px;
  background-color: white;
  font-size: 0.95em;
  color: #333;
  appearance: none;
  /* 移除默认的下拉箭头 */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236c757d'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  /* 自定义下拉箭头 */
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 1.2em;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.filter-select:focus {
  border-color: #819A91;
  outline: 0;
  box-shadow: 0 0 0 0.2rem #819A91;
}


/* 游戏列表样式 */
.game-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.game-item {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}

.game-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  background-color: #fcfcfc;
}

.game-info p {
  margin: 5px 0;
  color: #495057;
  font-size: 1em;
}

.game-info p strong {
  color: #34495e;
}

.game-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.game-result {
  font-weight: bold;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.9em;
  min-width: 60px;
  text-align: center;
}

/* 游戏结果不同状态的颜色 */
.game-result.win {
  background-color: #d4edda;
  color: #155724;
}

.game-result.loss {
  background-color: #f8d7da;
  color: #721c24;
}

.game-result.draw {
  background-color: #fff3cd;
  color: #856404;
}

.game-duration,
.game-color {
  font-size: 0.85em;
  color: #6c757d;
}

.game-color.white {
  color: #555;
}

.game-color.black {
  color: #333;
}


/* 分页器样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 15px;
}

.pagination-button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 123, 255, 0.2);
}

.pagination-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.pagination-button:hover:enabled {
  background-color: #0056b3;
  transform: translateY(-2px);
}

.pagination-info {
  font-size: 1.1em;
  font-weight: 600;
  color: #555;
}

/* 游戏详情部分样式 */
.game-details-section {
  position: relative;
  /* 用于定位关闭按钮 */
}

.close-details-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s;
}

.close-details-button:hover {
  background-color: #495057;
}

.game-replay {
  margin-top: 20px;
}

.move-list {
  list-style: none;
  padding: 0;
  margin-top: 15px;
  background-color: #fcfcfc;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.move-item {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e0e0e0;
}

.move-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.move-notation {
  font-size: 1.1em;
  color: #333;
  font-weight: bold;
}

.move-comments {
  margin-top: 8px;
  background-color: #f0f8ff;
  border-left: 4px solid #a0cffc;
  padding: 10px 15px;
  border-radius: 4px;
}

.move-comments p {
  margin: 5px 0;
  font-size: 0.9em;
  color: #5a6268;
}

.move-comments strong {
  color: #333;
}

.board-states-viewer {
  background-color: #2b2b2b;
  color: #f8f8f2;
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  margin-top: 15px;
  box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.2);
}

.board-states-viewer pre {
  margin: 0;
  font-size: 0.9em;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.timestamp-list {
  list-style: disc;
  padding-left: 25px;
  margin-top: 15px;
  background-color: #fcfcfc;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
}

.timestamp-list li {
  margin-bottom: 8px;
  color: #495057;
  font-size: 0.95em;
}

/* 消息提示样式 */
.loading-message,
.no-data-message {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

.error-message {
  color: #dc3545;
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  font-weight: 500;
}

/* 基本响应式调整 */
@media (max-width: 768px) {
  .user-center-container {
    margin: 20px 10px;
    padding: 15px;
  }

  .user-center-header h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.5em;
  }

  .profile-details p {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-value {
    margin-top: 5px;
  }

  .avatar-section {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }

  .user-avatar,
  .avatar-placeholder {
    width: 60px;
    height: 60px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-container {
    flex-direction: column;
    gap: 15px;
  }

  .game-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .game-meta {
    width: 100%;
    flex-direction: row;
    justify-content: space-around;
    margin-top: 15px;
    border-top: 1px dashed #e0e0e0;
    padding-top: 10px;
  }

  .close-details-button {
    position: static;
    margin-top: 15px;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .user-center-container {
    margin: 10px;
    padding: 10px;
  }

  .card {
    padding: 20px;
  }

  h1 {
    font-size: 2em;
  }

  h2 {
    font-size: 1.3em;
  }

  .filter-select,
  .pagination-button {
    font-size: 0.9em;
    padding: 8px 12px;
  }

  .user-avatar,
  .avatar-placeholder {
    width: 50px;
    height: 50px;
  }
}

/* 复盘按钮样式 */
.analyze-button {
  background-color: #819A91;
  color: white;
  border: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  margin-left: 10px;
  transition: all 0.3s ease;
}

.analyze-button:hover {
  background-color: #5c6d67;
  transform: translateY(-1px);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* 调整游戏元信息布局 */
.game-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* AI分析评价样式 */
.ai-analysis-section {
  margin-top: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
}

.analysis-title {
  color: #2c3e50;
  font-size: 1.4em;
  margin-bottom: 20px;
  font-weight: 600;
  border-bottom: 2px solid #819A91;
  padding-bottom: 8px;
}

.analysis-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #6c757d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #819A91;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.analysis-item {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #819A91;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.analysis-text {
  color: #495057;
  font-size: 1.05em;
  line-height: 1.6;
  margin: 0;
  text-align: justify;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.analysis-text h1,
.analysis-text h2,
.analysis-text h3,
.analysis-text h4,
.analysis-text h5,
.analysis-text h6 {
  color: #2c3e50;
  margin: 20px 0 10px 0;
  font-weight: 600;
}

.analysis-text h1 {
  font-size: 1.4em;
  border-bottom: 2px solid #819A91;
  padding-bottom: 5px;
}

.analysis-text h2 {
  font-size: 1.3em;
  border-bottom: 1px solid #819A91;
  padding-bottom: 3px;
}

.analysis-text h3 {
  font-size: 1.2em;
}

.analysis-text p {
  margin: 10px 0;
}

.analysis-text strong {
  color: #2c3e50;
  font-weight: 600;
}

.analysis-text em {
  font-style: italic;
  color: #6c757d;
}

.analysis-text code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: '宋体';
  font-size: 0.9em;
}

.analysis-text pre {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e9ecef;
  overflow-x: auto;
  margin: 10px 0;
}

.analysis-text pre code {
  background: none;
  padding: 0;
  border-radius: 0;
}

.analysis-text blockquote {
  border-left: 4px solid #819A91;
  margin: 15px 0;
  padding: 0 15px;
  color: #6c757d;
  font-style: italic;
}

.analysis-text ul,
.analysis-text ol {
  margin: 10px 0;
  padding-left: 25px;
}

.analysis-text li {
  margin: 5px 0;
}

.analysis-text table {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
}

.analysis-text th,
.analysis-text td {
  border: 1px solid #dee2e6;
  padding: 8px 12px;
  text-align: left;
}

.analysis-text th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.analysis-text a {
  color: #819A91;
  text-decoration: none;
}

.analysis-text a:hover {
  text-decoration: underline;
}

.analysis-divider {
  border: none;
  border-top: 1px solid #dee2e6;
  margin: 20px 0;
}

.analysis-timestamp {
  text-align: right;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.analysis-timestamp small {
  color: #6c757d;
  font-style: italic;
}

.analysis-error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
  text-align: center;
}

.analysis-empty {
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #ffeaa7;
  text-align: center;
  font-style: italic;
}

/* 响应式调整 - AI分析部分 */
@media (max-width: 768px) {
  .ai-analysis-section {
    margin-top: 20px;
    padding: 15px;
  }
  
  .analysis-title {
    font-size: 1.2em;
  }
  
  .analysis-item {
    padding: 15px;
  }
  
  .analysis-text {
    font-size: 1em;
  }
}
</style>