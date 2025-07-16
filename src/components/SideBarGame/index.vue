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
        <div class="button-row" :class="{ 'single-button': !isAiShouldShow }">
          <button class="AIbutton" style="font-style: italic;" 
            :class="{ 'active-button': activeWorkplace === 'history' }"
            @click="toggleWorkplace('history')">
            History
          </button>
          <button v-if="isAiShouldShow" class="AIbutton" style="font-style: italic;"
            :class="{ 'active-button': activeWorkplace === 'AIcomment' }"
            @click="toggleWorkplace('AIcomment')">
            AI Comment
          </button>
        </div>
        <div class="workplace" v-show="activeWorkplace === 'history'">
          <h3>Move History</h3>
          <p v-if="isLoadingHistory" class="loading-text">Loading history...</p>
          <p v-else-if="historyError" class="error-message">{{ historyError }}</p>
          <div v-else-if="moveHistory.length" class="history-container">
            <div v-for="(item, index) in moveHistory" :key="index" 
                 class="move-item" 
                 :class="{ 
                   'selected': selectedMoveIndex === index,
                   'has-comment': hasCommentForMove(index)
                 }"
                 @click="selectMove(index)">
              <span class="move-number">{{ Math.floor(index / 2) + 1 }}{{ index % 2 === 0 ? '.' : '...' }}</span>
              <span class="move-notation">{{ item }}</span>
              <span v-if="hasCommentForMove(index)" class="comment-indicator">💬</span>
            </div>
          </div>
          <p v-else class="no-history">No game history available yet.</p>
        </div>

        <div class="workplace" v-show="activeWorkplace === 'AIcomment'">
          <h3>AI Analysis:</h3>
          <div class="ai-comment-container">
            <div v-if="selectedMoveIndex === null" class="no-selection">
              <p class="work-word">Please select a move from the history first to view AI comments.</p>
            </div>
            <div v-else-if="!hasCommentForMove(selectedMoveIndex)" class="no-comment">
              <p class="work-word">No AI comment available for move {{ Math.floor(selectedMoveIndex / 2) + 1 }}{{ selectedMoveIndex % 2 === 0 ? '' : '...' }} {{ moveHistory[selectedMoveIndex] }}.</p>
              <p class="work-word" style="font-size: 12px; opacity: 0.7;">AI analysis may be processed later.</p>
            </div>
            <div v-else class="comment-content">
              <div class="selected-move-info">
                <span class="move-label">Move {{ Math.floor(selectedMoveIndex / 2) + 1 }}{{ selectedMoveIndex % 2 === 0 ? '' : '...' }}</span>
                <span class="move-value">{{ moveHistory[selectedMoveIndex] }}</span>
              </div>
              <div class="ai-comment-text">
                <p class="work-word">{{ getCommentForMove(selectedMoveIndex) }}</p>
              </div>
            </div>
          </div>
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
    },
    moveHistory: {
      type: Array,
      default: () => [],
    },
    aiCommentContent: {
      type: Array,
      default: () => [],
    },
    isAiShouldShow: {
      type: Boolean,
      default: false,
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
      aiCommentError: null,
      isLoadingHistory: false,
      historyContent: [],
      historyError: null,
      selectedMoveIndex: null, // 当前选中的移动索引
    }
  },
  emits: ['expansion-change', 'resign-game'],
  computed: {
    sidebarStyle() {
      return {
        top: `${this.position.top}px`,
        right: `${this.position.right}px`,
        transform: 'translateY(0)'
      };
    }
  },
  watch: {
    // 监听 moveHistory 变化，自动滚动到最新记录
    moveHistory: {
      handler(newHistory) {
        if (newHistory && newHistory.length > 0) {
          this.$nextTick(() => {
            this.scrollToLatest();
          });
        }
      },
      deep: true
    },
    // 监听工作区切换到历史记录时也滚动到最新
    activeWorkplace(newWorkplace) {
      if (newWorkplace === 'history' && this.moveHistory.length > 0) {
        this.$nextTick(() => {
          this.scrollToLatest();
        });
      }
    }
  },
  mounted() {
    console.log(`isAiShouldShow = ${this.isAiShouldShow}`);
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
      // 如果切换到历史记录且有数据，滚动到最新
      if (workplaceName === 'history' && this.moveHistory.length > 0) {
        this.$nextTick(() => {
          this.scrollToLatest();
        });
      }
    },

    // 滚动到最新的移动记录
    scrollToLatest() {
      const historyContainer = this.$el.querySelector('.history-container');
      if (historyContainer) {
        // 使用平滑滚动到底部显示最新记录
        historyContainer.scrollTo({
          top: historyContainer.scrollHeight,
          behavior: 'smooth'
        });
        
        // 高亮最新的移动记录
        const moveItems = historyContainer.querySelectorAll('.move-item');
        if (moveItems.length > 0) {
          const latestMove = moveItems[moveItems.length - 1];
          latestMove.classList.add('latest-move');
          
          // 3秒后移除高亮效果
          setTimeout(() => {
            latestMove.classList.remove('latest-move');
          }, 3000);
        }
      }
    },

    // 选中特定的移动
    selectMove(index) {
      this.selectedMoveIndex = index;
    },

    // 检查指定移动是否有评论
    hasCommentForMove(index) {
      if (!this.aiCommentContent || !Array.isArray(this.aiCommentContent)) {
        return false;
      }
      return this.aiCommentContent.some(comment => comment.moveIndex === index);
    },

    // 获取指定移动的评论
    getCommentForMove(index) {
      if (!this.aiCommentContent || !Array.isArray(this.aiCommentContent)) {
        return '';
      }
      const comment = this.aiCommentContent.find(comment => comment.moveIndex === index);
      return comment ? comment.text : '';
    },

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
  flex-shrink: 0;
  display: flex;
  height: 95%;
  flex-direction: column;
  padding-bottom: 20px;
  box-sizing: border-box;
  overflow: hidden;
  /* 禁止滚动 */
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
  position: absolute;
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

.button-row {
  display: flex;
  gap: 10px;
  margin: 10px 20px;
  justify-content: space-between;
}

.button-row.single-button {
  justify-content: center;
}

.button-row.single-button .AIbutton {
  flex: none;
  width: 100%;
}

/* AIbutton styles */
.AIbutton {
  flex: 1; /* 让按钮平均分配宽度 */
  height: 45px;
  /* Button height fixed */
  padding: 10px 10px;
  background: #4a675e;
  color: #e0e0e0;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.AIbutton:hover {
  background: #5c7e70;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Active button styles */
.AIbutton.active-button {
  background: linear-gradient(90deg, #66eab7, #4ba265);
  color: #fff;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

/* Workplace styles */
.workplace {
  width: 280px;
  flex: 1;
  background: #2e3d37;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  margin: 15px 20px;
  padding: 15px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
  color: #c0c0c0;
  font-size: 14px;
  line-height: 1.6;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 确保内部文本换行 */
  word-wrap: break-word;
  /* 强制长单词或URL在达到容器边界时换行 */
  overflow-wrap: break-word;
  /* 现代替代方案 */
  white-space: normal;
  /* 确保不强制单行 */
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
  text-align: center;
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  font-style: italic;
}

/* Move History Styles */
.history-container {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  scroll-behavior: smooth; /* 平滑滚动效果 */
}

.move-item {
  display: flex;
  align-items: center;
  padding: 6px 8px;
  margin: 2px 0;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  position: relative;
}

.move-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.move-item:nth-child(odd) {
  background: rgba(255, 255, 255, 0.02);
}

/* 选中状态的样式 */
.move-item.selected {
  background: rgba(102, 234, 183, 0.2) !important;
  border: 1px solid rgba(102, 234, 183, 0.4);
  box-shadow: 0 0 6px rgba(102, 234, 183, 0.3);
}

/* 有评论的移动样式 */
.move-item.has-comment {
  border-left: 3px solid #66eab7;
}

/* 评论指示器样式 */
.comment-indicator {
  margin-left: auto;
  font-size: 12px;
  opacity: 0.8;
}

/* 最新移动记录的高亮样式 */
.move-item.latest-move {
  background: rgba(102, 234, 183, 0.15) !important;
  border: 1px solid rgba(102, 234, 183, 0.3);
  box-shadow: 0 0 8px rgba(102, 234, 183, 0.2);
  animation: highlightPulse 3s ease-in-out;
}

@keyframes highlightPulse {
  0% { 
    background: rgba(102, 234, 183, 0.25);
    box-shadow: 0 0 12px rgba(102, 234, 183, 0.4);
  }
  50% { 
    background: rgba(102, 234, 183, 0.15);
    box-shadow: 0 0 8px rgba(102, 234, 183, 0.2);
  }
  100% { 
    background: rgba(102, 234, 183, 0.15);
    box-shadow: 0 0 8px rgba(102, 234, 183, 0.2);
  }
}

.move-number {
  min-width: 35px;
  color: #66eab7;
  font-weight: 600;
  font-size: 12px;
  margin-right: 8px;
}

.move-notation {
  color: #e0e0e0;
  font-weight: 500;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.loading-text {
  color: #66eab7;
  font-style: italic;
  text-align: center;
  animation: pulse 1.5s ease-in-out infinite;
}

.no-history {
  color: #888;
  font-style: italic;
  text-align: center;
  opacity: 0.7;
}

.error-message {
  color: #ff6b6b;
  font-weight: 500;
  text-align: center;
  background: rgba(255, 107, 107, 0.1);
  padding: 8px;
  border-radius: 4px;
  border-left: 3px solid #ff6b6b;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Custom scrollbar for history container */
.history-container::-webkit-scrollbar {
  width: 4px;
}

.history-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.history-container::-webkit-scrollbar-thumb {
  background: rgba(102, 234, 183, 0.5);
  border-radius: 2px;
}

.history-container::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 234, 183, 0.7);
}

/* Custom scrollbar for AI comment container */
.ai-comment-container::-webkit-scrollbar {
  width: 4px;
}

.ai-comment-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.ai-comment-container::-webkit-scrollbar-thumb {
  background: rgba(102, 234, 183, 0.5);
  border-radius: 2px;
}

.ai-comment-container::-webkit-scrollbar-thumb:hover {
  background: rgba(102, 234, 183, 0.7);
}

/* AI Comment 相关样式 */
.ai-comment-container {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.02);
  scroll-behavior: smooth;
}

.no-selection, .no-comment {
  text-align: center;
  padding: 20px;
}

.comment-content {
  padding: 10px;
}

.selected-move-info {
  background: rgba(102, 234, 183, 0.1);
  border: 1px solid rgba(102, 234, 183, 0.3);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.move-label {
  color: #66eab7;
  font-weight: 600;
  font-size: 12px;
}

.move-value {
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  font-weight: 500;
  font-size: 14px;
}

.ai-comment-text {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 6px;
  padding: 12px;
  border-left: 3px solid #66eab7;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap; /* 保持换行符和空格 */
}

.ai-comment-text .work-word {
  text-align: left;
  font-style: normal;
  line-height: 1.5;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>