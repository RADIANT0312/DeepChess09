<template>
  <BaseTopBar @expansion-change="emitExpansionChange" :fixed="true">
    <template #content>
      <button class="resign-button" @click.stop="handleResign" :disabled="isResigning" type="button">
        <span v-if="isResigning">
          {{ mode === 'game' ? 'Resigning...' : 'Exiting...' }}
        </span>
        <span v-else>
          {{ getButtonText() }}
        </span>
      </button>
    </template>
    <template #content2>
      <div class="latency-display" :class="latencyStatus">
        <div class="latency-icon">📡</div>
        <div class="latency-text">
          <span v-if="latency === -1">offline</span>
          <span v-else-if="latency === null">checking...</span>
          <span v-else>{{ latency }}ms</span>
        </div>
      </div>
    </template>
    <template #content3>
      <div class="time-display">{{ currentTime }}</div>
    </template>
  </BaseTopBar>
</template>

<script>
import BaseTopBar from '../BaseTopBar/index.vue';
import { game } from '@/api/game.js';
import { network } from '@/api/network.js';

export default {
  name: 'TopBar',
  components: {
    BaseTopBar
  },
  props: {
    gameId: {
      type: String,
      required: true
    },
    mode: {
      type: String,
      required: true,
      validator: value => ['game', 'learning', 'history'].includes(value)
    },
    gameData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      currentTime: '',
      timeInterval: null,
      isResigning: false,
      latency: null, // 延迟时间（毫秒），null表示未检测，-1表示离线
      latencyInterval: null,
      latencyStatus: 'checking' // checking, good, fair, poor, disconnected
    }
  },
  emits: ['expansion-change', 'game-resigned'],
  mounted() {
    this.startTimeUpdater();
    this.startLatencyChecker();
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    if (this.latencyInterval) {
      clearInterval(this.latencyInterval);
    }
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
      this.currentTime = now.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    emitExpansionChange(isExpanded) {
      this.$emit('expansion-change', isExpanded);
    },

    async handleResign() {
      console.log('handleResign called'); // 调试日志
      console.log('gameId:', this.gameId); // 调试日志
      console.log('mode:', this.mode); // 调试日志
      console.log('isResigning:', this.isResigning); // 调试日志

      if (!this.gameId || this.isResigning) {
        console.log('早期返回：gameId或isResigning检查失败'); // 调试日志
        return;
      }

      try {
        console.log('开始退出流程'); // 调试日志
        this.isResigning = true;

        // 根据模式调用不同的API
        if (this.mode === 'game') {
          // 只有对弈模式才调用认输API
          await game.resign(this.gameId);
        } else {
          await game.resign(this.gameId);
        }

        // 发出认输事件给父组件
        this.$emit('game-resigned');

        console.log('操作成功'); // 调试日志
      } catch (error) {
        console.error('操作失败:', error);
        alert('resign failed: ' + (error.message || 'unknown error'));
      } finally {
        this.isResigning = false;
      }
    },

    startLatencyChecker() {
      this.checkLatency();
      this.latencyInterval = setInterval(() => {
        this.checkLatency();
      }, 3000); // 每3秒检测一次延迟
    },

    async checkLatency() {
      try {
        const result = await network.checkConnection();
        this.latency = result.latency;
        this.latencyStatus = result.status;
      } catch (error) {
        console.error('延迟检测错误:', error);
        this.latency = -1;
        this.latencyStatus = 'disconnected';
      }
    },

    getButtonText() {
      switch (this.mode) {
        case 'game':
          return 'Resign';
        case 'learning':
          return 'Exit Lesson';
        case 'history':
          return 'Exit Replay';
        default:
          return 'Exit';
      }
    }
  }
}
</script>

<style scoped>
.time-display {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.resign-button {
  background: #1F2828;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.resign-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #68301C 0%, #68301C 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
}

.resign-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(255, 107, 107, 0.3);
}

.resign-button:disabled {
  background: linear-gradient(135deg, #999999 0%, #777777 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(153, 153, 153, 0.3);
}

.latency-display {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.latency-icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.latency-text {
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  min-width: 45px;
  text-align: center;
}

/* 根据网络状态显示不同颜色 */
.latency-display.good {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.8) 0%, rgba(56, 142, 60, 0.8) 100%);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.latency-display.fair {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.8) 0%, rgba(255, 160, 0, 0.8) 100%);
  border: 1px solid rgba(255, 193, 7, 0.5);
}

.latency-display.poor {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.8) 0%, rgba(239, 108, 0, 0.8) 100%);
  border: 1px solid rgba(255, 152, 0, 0.5);
}

.latency-display.disconnected {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.8) 0%, rgba(211, 47, 47, 0.8) 100%);
  border: 1px solid rgba(244, 67, 54, 0.5);
}

.latency-display.checking {
  background: linear-gradient(135deg, rgba(158, 158, 158, 0.8) 0%, rgba(117, 117, 117, 0.8) 100%);
  border: 1px solid rgba(158, 158, 158, 0.5);
}

/* 动画效果 */
.latency-display.checking .latency-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
}
</style>
