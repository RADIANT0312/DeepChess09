<template>
  <transition name="celebration-fade-scale">
    <div v-if="internalShow" class="chess-celebration-overlay" @click.self="closeOverlay">
      <div class="celebration-card" :class="outcomeType">
        <button class="close-button" @click="closeOverlay">×</button>

        <div class="light-effect"></div>

        <div class="content-wrapper">
          <div class="icon-container">
            <img :src="avatar" :alt="outcomeType" class="outcome-icon" />
          </div>
          <h2 class="outcome-text">{{ message }}</h2>
          <br />

          <div class="actions">
            <router-link to="/game">
              <button class="action-button rematch-button" @click="handleRematchClick">Rematch</button>
            </router-link>
            <router-link to="/main">
              <button class="action-button exit-button" @click="handleExitClick">Back to Lobby</button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { user } from '../../api';

export default {
  name: 'ChessOutcomeCelebration',
  props: {
    // 移除 'show' prop。现在组件的可见性由自身内部管理。
    // outcomeType 仍然保留为 prop，因为它定义了组件要显示什么内容，这是来自父组件的配置。
    outcomeType: {
      type: String,
      default: 'win', // 默认显示胜利效果，方便测试
      validator: (value) => ['win', 'lose', 'draw', ''].includes(value)
    }
  },
  data() {
    return {
      // 这是关键：使用 internalShow 作为组件内部的响应式数据，控制自身的可见性。
      internalShow: true, // 默认值为 true，表示组件被渲染时就可见
      avatar: '/default-avatar.jpg' // 添加头像数据
    };
  },
  computed: {
    // 沿用之前的计算属性，它们直接使用 outcomeType prop
    message() {
      switch (this.outcomeType) {
        case 'win':
          return 'VICTORY!';
        case 'lose':
          return 'DEFEAT!';
        case 'draw':
          return 'DRAW!';
        default:
          return 'GAME OVER';
      }
    },
  },
  mounted() {
    this.fetchAvatar();
  },
  methods: {
    async fetchAvatar() {
      this.avatar = await user.getAvatar();
    },
    // closeOverlay 方法现在直接修改 internalShow 数据
    closeOverlay() {
      this.internalShow = false; // 直接将 internalShow 设置为 false，组件就会从 DOM 中移除
      // 此时不再需要 `this.$emit('update:show', false);`，
      // 因为父组件没有监听这个 prop。
      // 但是，如果你希望父组件在组件关闭时能收到通知（例如记录日志），
      // 仍然可以保留 `this.$emit('close');` 事件。
      this.$emit('close'); // 仍然可以发出 'close' 事件，作为通知
      console.log('Celebration component closed.');
    },
    handleRematchClick() {
      console.log('Rematch clicked!');
      this.$emit('rematch'); // 触发 rematch 事件给父组件
      this.closeOverlay(); // 调用内部关闭逻辑
    },
    handleExitClick() {
      console.log('Back to Lobby clicked!');
      this.$emit('exit'); // 触发 exit 事件给父组件
      this.closeOverlay(); // 调用内部关闭逻辑
    }
  },
  // 不再需要 watch 属性，因为不再依赖外部状态来控制显示
};
</script>

<style scoped>
/* 样式代码与之前完全相同，此处省略以保持简洁 */
.chess-celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  font-family: 'Arial', sans-serif;
  color: #fff;
}

.celebration-card {
  position: relative;
  width: 90%;
  max-width: 600px;
  background-color: #364b3f;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  /* 0 0 15px rgba(224, 217, 217, 0.3) inset; */
  padding: 40px 20px;
  text-align: center;
  overflow: hidden;
  transform-style: preserve-3d;
  animation: card-appear 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
}

.light-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150%;
  height: 150%;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  animation: pulse-light 2s infinite ease-out;
  z-index: 1;
  pointer-events: none;
}

.celebration-card.win .light-effect {
  background: radial-gradient(circle at center, rgba(76, 175, 80, 0.3) 0%, rgba(76, 175, 80, 0) 70%);
  animation: pulse-light-win 2s infinite ease-out;
}

.celebration-card.lose .light-effect {
  background: radial-gradient(circle at center, rgba(244, 67, 54, 0.3) 0%, rgba(244, 67, 54, 0) 70%);
  animation: pulse-light-lose 2s infinite ease-out;
}

.celebration-card.draw .light-effect {
  background: radial-gradient(circle at center, rgba(255, 193, 7, 0.3) 0%, rgba(255, 193, 7, 0) 70%);
  animation: pulse-light-draw 2s infinite ease-out;
}

.content-wrapper {
  position: relative;
  z-index: 2;
  opacity: 0;
  animation: content-fade-in 0.8s ease-out 0.3s forwards;
}

.icon-container {
  width: 100px;
  height: 100px;
  margin: 0 auto 20px auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.2) inset;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.outcome-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
}

.outcome-text {
  font-family: "Palatin Linotype", cursive;
  font-style: normal;
  font-size: 3.5em;
  font-weight: bold;
  color: white;
  letter-spacing: 5px;
  margin-bottom: 10px;
  text-shadow: 3px 3px 8px rgba(0, 0, 0, 0.5);
  animation: text-bounce 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) 0.5s forwards;
}

.celebration-card.win .outcome-text {
  /* color: #8bc34a; */
  text-shadow: 0 0 15px rgba(139, 195, 74, 0.8);
}

.celebration-card.lose .outcome-text {
  /* color: #f44333; */
  text-shadow: 0 0 15px rgba(244, 67, 51, 0.8);
}

.celebration-card.draw .outcome-text {
  /* color: #ffc107; */
  text-shadow: 0 0 15px rgba(255, 193, 7, 0.8);
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  animation: content-fade-in 0.8s ease-out 0.8s forwards;
}

.action-button {
  font-family: "Palatin Linotype", cursive;
  font-style: normal;
  background-color: #1F2828;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  cursor: pointer;
  font-size: 1.5em;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.action-button:hover {
  background-color: #0056b3;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
}

.action-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #ddd;
  font-size: 36px;
  cursor: pointer;
  padding: 5px 10px;
  transition: color 0.3s ease, transform 0.2s ease;
  z-index: 10;
}

.close-button:hover {
  color: #fff;
  transform: rotate(90deg);
}

.celebration-fade-scale-enter-active,
.celebration-fade-scale-leave-active {
  transition: opacity 0.5s ease;
}

.celebration-fade-scale-enter-from,
.celebration-fade-scale-leave-to {
  opacity: 0;
}

@keyframes card-appear {
  0% {
    transform: scale(0.5) translateY(-50px);
    opacity: 0;
  }

  60% {
    transform: scale(1.05) translateY(10px);
    opacity: 1;
  }

  100% {
    transform: scale(1) translateY(0);
  }
}

@keyframes content-fade-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes text-bounce {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }

  60% {
    transform: scale(1.1);
    opacity: 1;
  }

  80% {
    transform: scale(0.95);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes pulse-light {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }

  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
}

@keyframes pulse-light-win {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }

  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
}

@keyframes pulse-light-lose {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }

  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
}

@keyframes pulse-light-draw {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }

  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
}

.celebration-fade-scale-leave-active .celebration-card {
  animation: card-disappear 0.3s ease-in forwards;
}

@keyframes card-disappear {
  from {
    transform: scale(1);
    opacity: 1;
  }

  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>