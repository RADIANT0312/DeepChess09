<template>
  <div class="side-bar" :class="{ 'expanded': isExpanded, 'dragging': isDragging }" :style="sidebarStyle"
    @mousedown.left="handleMouseDown" @contextmenu.prevent="expandSidebar">
    <img src="/sidebar-logo.svg" alt="DeepChess Logo" class="collapsed-logo" />
    <div class="side-bar-content">
      <div class="header" @mousedown.left="handleHeaderMouseDown">
        <div class="logo">
          <img src="/sidebar-logo.svg" alt="DeepChess Logo" width="50" height="50" />
        </div>
        <span class="brand-name" v-show="isExpanded">DeepChess</span>
      </div>

      <div class="main-content-area">
        <button class="AIbutton" style="font-style: italic;" :class="{ 'active-button': activeWorkplace === 'history' }"
          @click="toggleWorkplace('history')">
          History
        </button>
        <button class="AIbutton" style="font-style: italic;"
          :class="{ 'active-button': activeWorkplace === 'AIcomment' }" @click="toggleWorkplace('AIcomment')">
          AI Comment
        </button>

        <div class="workplace" v-show="activeWorkplace === 'history'">
          <h3>Game History:</h3>
          <p v-if="!gameId">No active game to show history for. Create a match first.</p>
          <p v-else-if="isLoadingHistory">Loading history...</p>
          <p v-else-if="historyError" class="error-message">{{ historyError }}</p>
          <div v-else-if="historyContent.length">
            <p v-for="item in historyContent" :key="item.id" class="work-word">
              <strong>{{ item.move }}:</strong> {{ item.comment }}
            </p>
          </div>
          <p v-else>No game history available yet.</p>
        </div>

        <div class="workplace" v-show="activeWorkplace === 'AIcomment'">
          <h3>AI Analysis:</h3>
          <p v-if="!gameId" class="work-word">No active game to show AI comments for. Create a match first.</p>
          <p v-else-if="isLoadingAIComment">Loading AI comments...</p>
          <p v-else-if="aiCommentError" class="error-message">{{ aiCommentError }}</p>
          <div v-else-if="aiCommentContent.length">
            <p v-for="item in aiCommentContent" :key="item.id" class="work-word">
              {{ item.text }}
            </p>
          </div>
          <p v-else>No AI comments available yet.</p>
        </div>
      </div>
      <div class="footer">
        <button class="collapse-button" @click.stop="collapseSidebar" v-show="isExpanded">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { user, game } from '@/api'; // Adjust the import path as necessary.
export default {
  name: 'SideBarGame',
  props: {
    // 接收来自父组件的当前游戏ID
    currentGameId: {
      type: String,
      default: null,
    }
  },
  data() {
    return {
      isExpanded: false,
      currentTime: '',
      timeInterval: null,
      isDragging: false,
      position: { top: 10, right: 5 }, // Initial position in percentage and pixels
      dragStartOffset: { x: 0, y: 0 },
      activeWorkplace: null,
      gameId: null,
      isLoadingAIComment: false,
      aiCommentContent: [],
      aiCommentError: null,
      isLoadingHistory: false,
      historyContent: [],
      historyError: null,
    }
  },
  emits: ['expansion-change', 'resign-game'],
  watch: {
    // 监听 currentGameId prop 的变化，更新组件内部的 gameId
    currentGameId(newId) {
      this.gameId = newId;
      // 当 gameId 变化且有效时，重新加载数据
      if (newId) {
        // 每次 gameId 变化时，默认加载历史数据，并清空AI评论以便在切换时重新加载
        this.fetchGameDetailsData();
      } else {
        // 如果没有 gameId，则清空数据和错误
        this.historyContent = [];
        this.aiCommentContent = [];
        this.historyError = null;
        this.aiCommentError = null;
      }
    },
    // 监听 activeWorkplace 变化，按需加载数据（如果该工作区内容为空且未在加载中）
    activeWorkplace(newWorkplace) {
      // 这里的逻辑可以优化为只在需要时（即gameId存在且该tab内容为空时）才重新fetch
      // 但由于 fetchGameDetailsData 会同时获取两种数据，可以简化为只在 gameId 变化时调用一次
      // 如果数据量大，且AI评论或历史记录是独立加载的，才需要这里的细致控制
      if (this.gameId && !this.historyContent.length && !this.aiCommentContent.length && !this.isLoadingHistory && !this.isLoadingAIComment) {
        this.fetchGameDetailsData();
      }
    }
  },
  computed: {
    sidebarStyle() {
      return {
        top: `${this.position.top}px`,
        right: `${this.position.right}px`,
        transform: 'translateY(0)'
      };
    }
  },
  mounted() {
    this.startTimeUpdater();
    this.position.top = window.innerHeight * 0.05;
    this.position.right = 15;
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
  },
  methods: {
    startTimeUpdater() {
      this.updateTime();
      this.timeInterval = setInterval(() => {
        this.updateTime();
      }, 1000);
    },

    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    handleMouseDown(event) {
      if (this.isExpanded) return;
      this.startDrag(event);
    },

    handleHeaderMouseDown(event) {
      if (this.isExpanded) {
        this.startDrag(event);
      }
    },

    startDrag(event) {
      this.isDragging = true;

      const rect = this.$el.getBoundingClientRect();
      this.dragStartOffset.x = event.clientX - rect.left;
      this.dragStartOffset.y = event.clientY - rect.top;

      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
    },

    onDrag(event) {
      if (!this.isDragging) return;

      event.preventDefault();

      const newTop = event.clientY - this.dragStartOffset.y;
      const newRight = window.innerWidth - (event.clientX - this.dragStartOffset.x + this.$el.offsetWidth);

      const maxTop = window.innerHeight - this.$el.offsetHeight;
      const maxRight = window.innerWidth - this.$el.offsetWidth;

      this.position.top = Math.max(0, Math.min(newTop, maxTop));
      this.position.right = Math.max(0, Math.min(newRight, maxRight));
    },

    stopDrag() {
      setTimeout(() => {
        this.isDragging = false;
      }, 0);
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.stopDrag);
    },

    expandSidebar() {
      if (!this.isExpanded && !this.isDragging) {
        this.isExpanded = true;
        this.emitExpansionChange();
      }
    },

    collapseSidebar() {
      if (this.isExpanded) {
        this.isExpanded = false;
        this.emitExpansionChange();
      }
    },

    emitExpansionChange() {
      this.$emit('expansion-change', this.isExpanded);
    },
    toggleWorkplace(workplaceName) {
      this.activeWorkplace = workplaceName;
    },

    // 统一的获取游戏详情数据的方法
    async fetchGameDetailsData() {
      if (!this.gameId) {
        this.historyContent = [];
        this.aiCommentContent = [];
        return;
      }

      this.isLoadingHistory = true; // 假设加载历史和评论同时开始
      this.isLoadingAIComment = true;
      this.historyError = null;
      this.aiCommentError = null;

      try {
        // 调用 user 模块的 getGameDetails 方法来获取特定对局的详细信息
        const response = await user.getGameDetails(this.gameId);

        // 游戏历史: moves 数组
        this.historyContent = response.data.moves || [];

        // AI 评论: comments 数组
        this.aiCommentContent = response.data.comments || [];

        console.log('游戏详情数据获取成功:', response.data);

      } catch (error) {
        this.historyError = 'Failed to load game details.'; // 统一的错误消息
        this.aiCommentError = 'Failed to load AI comments.'; // 统一的错误消息
        // 错误已经在拦截器中处理并打印，这里只更新组件状态
        console.error('获取游戏详情出错:', error);
      } finally {
        this.isLoadingHistory = false;
        this.isLoadingAIComment = false;
      }
    }

  }
}
</script>

<style scoped>
.sidebar-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: auto;
  transition: opacity 0.3s ease-in-out;
}

.side-bar.expanded .sidebar-logo {
  opacity: 0;
  pointer-events: none;
}

.side-bar {
  position: fixed;
  /* top and right are now handled by :style */
  height: 6vh;
  width: 6vh;
  background: #364b3f;
  z-index: 1000;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.side-bar:not(.expanded):not(.dragging) {
  cursor: grab;
}

.side-bar.dragging {
  cursor: grabbing;
  transition: none;
  /* Disable transition while dragging for responsiveness */
  user-select: none;
  /* Prevent text selection while dragging */
}

.side-bar:not(.expanded):not(.dragging):hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.side-bar.expanded {
  height: 90vh;
  width: 350px;
  cursor: default;
  /* Change cursor back when expanded */
}

.collapsed-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  transition: opacity 0.2s ease-out;
  opacity: 1;
}

.side-bar.expanded .collapsed-logo {
  opacity: 0;
}

.side-bar-content {
  display: flex;
  flex-direction: column;
  height: 95%;
  /* This refers to 95% of the .side-bar's height when expanded */
  width: 350px;
  padding: 20px 0;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-sizing: border-box;
}

.side-bar.expanded .side-bar-content {
  opacity: 1;
  transform: translateX(0);
}

.header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 30px;
  min-height: 40px;
  cursor: move;
  user-select: none;
}

.logo {
  margin-right: 16px;
  color: #fff;
  min-width: 32px;
}

.brand-name {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
}

/* Styles for the main content area */
.main-content-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: 20px;
  box-sizing: border-box;
  /* Important for hiding scrollbar but allowing scroll */
  overflow-y: scroll;
  /* Allows content to scroll */
  -ms-overflow-style: none;
  /* For Internet Explorer and Edge */
  scrollbar-width: none;
  /* For Firefox */
}

/* For Chrome, Safari, and Opera */
.main-content-area::-webkit-scrollbar {
  display: none;
  /* Hide the scrollbar */
  width: 0;
  /* Ensures no width is reserved */
  height: 0;
  /* Ensures no height is reserved */
}


.nav-items {
  flex-grow: 1;
}

.nav-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-items li a {
  display: flex;
  align-items: center;
  padding: 15px 28px;
  color: #e0e0e0;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
  white-space: nowrap;
}

.nav-items li a:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.nav-items li.active a {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5));
  color: #fff;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
}

.nav-items li.active a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  bottom: 25%;
  width: 4px;
  background: #fff;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  margin-right: 20px;
  display: flex;
  align-items: center;
  min-width: 24px;
}

.nav-text {
  font-size: 16px;
}

.footer {
  padding: 0px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  flex-shrink: 0;
}

.collapse-button {
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 8px;
  margin-left: 250px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.collapse-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
}

.collapse-button svg {
  width: 24px;
  height: 24px;
}

/* AIbutton styles */
.AIbutton {
  width: calc(100% - 40px);
  height: 45px;
  /* Button height fixed */
  background: #4a675e;
  color: #e0e0e0;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 10px 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.AIbutton:hover {
  background: #5c7e70;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Active button styles */
.AIbutton.active-button {
  background: linear-gradient(90deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

/* Workplace styles */
.workplace {
  width: 280px;
  background: #2e3d37;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin: 15px 20px;
  padding: 15px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  color: #c0c0c0;
  font-size: 14px;
  line-height: 1.6;
  /* 确保内部文本换行 */
  word-wrap: break-word;
  /* 强制长单词或URL在达到容器边界时换行 */
  overflow-wrap: break-word;
  /* 现代替代方案 */
  white-space: normal;
  /* 确保不强制单行 */
  /* Removed overflow-y and max-height from here as main-content-area handles it */
  transition: all 0.5s ease-in-out;
}

.workplace h3 {
  color: #fff;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.workplace p {
  margin-bottom: 10px;
}

.work-word {
  text-align: left;
  color: #889296;
  font-size: 14px;
  font-weight: 500;
  font-style: italic;
}
</style>