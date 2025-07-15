<script>
import SideBar from '@components/SideBarGame/index.vue';
import Board from '@components/Board/index.vue';
import TopBar from './topbar.vue';
import { game } from '@/api/game.js';
import { teaching } from '@/api/teaching.js';

export default {
  name: 'Game',
  components: {
    SideBar,
    Board,
    TopBar
  },
  data() {
    return {
      // 游戏基本信息
      mode: null, // 'game', 'learning', 'history'
      gameId: null,
      
      // 游戏状态
      gameData: null,
      isLoading: true,
      loadError: null,
      isTimeout: false,
      timeoutTimer: null,
      
      // 通用游戏数据
      boardState: '',
      moves: [],
      currentPlayer: '',
      userColor: '',
      gameStatus: 'ongoing',
      gameResult: 'ongoing',
      
      // 教学模式特有数据
      instructions: '',
      objectives: [],
      hints: [],
      title: '',
      description: ''
    }
  },
  async created() {
    // 从路由参数获取mode和gameId
    this.mode = this.$route.query.mode || this.$route.params.mode;
    this.gameId = this.$route.query.gameId || this.$route.params.gameId;
    
    console.log('Game组件初始化:', { mode: this.mode, gameId: this.gameId });
    
    if (!this.mode || !this.gameId) {
      this.loadError = 'Lack of required parameters: mode or gameId';
      this.isLoading = false;
      return;
    }
    
    await this.initializeGame();
  },
  mounted() {
    // 设置页面超时检测 (30秒)
    this.startTimeoutTimer();
  },
  beforeUnmount() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
    }
  },
  methods: {
    async initializeGame() {
      try {
        this.loadError = null;
        
        switch (this.mode) {
          case 'game':
            await this.initGameMode();
            break;
          case 'learning':
            await this.initLearningMode();
            break;
          case 'history':
            await this.initHistoryMode();
            break;
          default:
            throw new Error(`未知的游戏模式: ${this.mode}`);
        }
        
        this.isLoading = false;
      } catch (error) {
        console.error('游戏初始化失败:', error);
        this.loadError = error.message || '游戏初始化失败';
        this.isLoading = false;
      }
    },
    
    async initGameMode() {
      console.log('初始化对弈模式, gameId:', this.gameId);
      const response = await game.getGameState(this.gameId);
      console.log('获取对弈状态1');
      const data = response.data;
      
      this.gameData = data;
      this.boardState = data.boardState;
      this.moves = data.moves || [];
      this.currentPlayer = data.currentPlayer;
      this.userColor = data.userColor;
      this.gameStatus = data.status;
      this.gameResult = data.result;
    },
    
    async initLearningMode() {
      console.log('初始化教学模式, lessonId:', this.gameId);
      const response = await teaching.getLesson(this.gameId);
      const data = response.data;
      
      this.gameData = data;
      this.boardState = data.boardState;
      this.moves = data.moves || [];
      this.currentPlayer = data.currentPlayer;
      this.userColor = data.userColor;
      this.instructions = data.instructions;
      this.objectives = data.objectives || [];
      this.hints = data.hints || [];
      this.title = data.title;
      this.description = data.description;
      this.gameStatus = 'ongoing';
      this.gameResult = 'ongoing';
    },
    
    async initHistoryMode() {
      console.log('初始化历史模式, gameId:', this.gameId);
      // 历史模式使用与对弈模式相同的API，但是只读
      const response = await game.getGameState(this.gameId);
      const data = response.data;
      
      this.gameData = data;
      this.boardState = data.boardState;
      this.moves = data.moves || [];
      this.currentPlayer = data.currentPlayer;
      this.userColor = data.userColor;
      this.gameStatus = 'finished'; // 历史对局都是已完成的
      this.gameResult = data.result;
    },
    
    startTimeoutTimer() {
      this.timeoutTimer = setTimeout(() => {
        console.warn('页面操作超时');
        this.isTimeout = true;
      }, 30000); // 30秒超时
    },
    
    resetTimeout() {
      if (this.timeoutTimer) {
        clearTimeout(this.timeoutTimer);
      }
      this.isTimeout = false;
      this.startTimeoutTimer();
    },
    
    handleGameResigned() {
      // 处理认输事件
      console.log('游戏已认输');
      // 跳转到结果页面或返回主页
      this.$router.push('/main');
    },
    
    handleUserInteraction() {
      // 用户有操作时重置超时计时器
      this.resetTimeout();
    }
  }
}
</script>
<template>
  <div class="game" @click="handleUserInteraction">
    <!-- Loading 状态 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-content">
        <div class="spinner"></div>
        <p>Starting game...</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="loadError" class="error-overlay">
      <div class="error-content">
        <h3>{{ loadError }}</h3>
        <button @click="$router.push('/main')" class="back-button">Back to Home</button>
      </div>
    </div>
    
    <!-- 超时遮罩层 -->
    <div v-if="isTimeout" class="timeout-overlay">
      <div class="timeout-content">
        <h3>Page Operation Timeout</h3>
        <p>The page has been locked and can only exit the game</p>
        <button @click="handleGameResigned" class="resign-only-button">Exit Game</button>
      </div>
    </div>
    
    <!-- 正常游戏界面 -->
    <template v-else>
      <TopBar 
        :gameId="gameId" 
        :mode="mode"
        :gameData="gameData"
        @game-resigned="handleGameResigned" 
      />
      <SideBar />
      <div class="board-area">
        <Board 
          :boardFEN="this.boardState"
          :moves="this.moves"
          :currentPlayer="this.currentPlayer"
          :userColor="this.userColor"
          :gameStatus="this.gameStatus"
          :gameResult="this.gameResult"
          :mode="this.mode"
          :isTimeout="isTimeout"
          @user-interaction="handleUserInteraction"
        />
      </div>
      
    </template>
  </div>
</template>

<style scoped>
.game {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background-color: #4f5442;
}

.board-area {
  --top-bar-height: 60px;
  --side-bar-width: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  height: calc(100vh - var(--top-bar-height));
  margin-top: var(--top-bar-height);
  width: calc(100% - var(--side-bar-width) - 20px);
  margin-right: calc(var(--side-bar-width) + 10px);
  padding-left: 10px;
}

/* Loading 遮罩层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loading-content {
  text-align: center;
  color: white;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误遮罩层 */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.error-content {
  background: #638D6D;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
}

.error-content h3 {
  color: white;
  font-size: 2rem;
  margin-bottom: 2px;
}

.back-button {
  background: #364B3F;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

.back-button:hover {
  background: #364B3F;
}

/* 超时遮罩层 */
.timeout-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(128, 128, 128, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.timeout-content {
  background: #638D6D;
  padding: 40px;
  border-radius: 10px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.timeout-content h3 {
  color: white;
  margin-bottom: 20px;
}

.resign-only-button {
  background: #364B3F;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  font-weight: bold;
}

.resign-only-button:hover {
  background: black;
}


/* 响应式设计 */
@media (max-width: 1200px) {
  .learning-panel {
    position: relative;
    right: auto;
    top: auto;
    width: 100%;
    margin: 20px;
    max-height: none;
  }
  
  .board-area {
    width: calc(100% - 40px);
    margin-right: 20px;
  }
}
</style>