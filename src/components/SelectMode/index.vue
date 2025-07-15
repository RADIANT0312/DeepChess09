<template>
  <div class="choose-options-modal">
    <div class="choose-options-content">
      <h2>Choose Your Side</h2>
      <br />
      <div class="choose-options-btns">
        <button :class="['color-btn', 'white', { selected: color === 'white' }]" @click="color = 'white'">
          <span class="chess-svg">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="#fff" stroke="#364b3f" stroke-width="2.5" />
            </svg>
          </span>
          <span>Play as White</span>
        </button>
        <button :class="['color-btn', 'black', { selected: color === 'black' }]" @click="color = 'black'">
          <span class="chess-svg">
            <svg width="36" height="36" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="#22382c" stroke="#e0f5d8" stroke-width="2.5" />
            </svg>
          </span>
          <span>Play as Black</span>
        </button>
      </div>
      <div class="choose-options-row">
        <label>AI Difficulty:</label>
        <select v-model="difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      <div class="choose-options-actions">
        <button class="color-btn notready" @click="goToMain" :disabled="isCreatingGame">I'm not ready</button>
        <button class="color-btn confirm" :disabled="!color || isCreatingGame" @click="startGame">
          {{ isCreatingGame ? 'Creating Game...' : 'Start Game' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { game } from '@/api/game.js';
import { teaching } from '@/api/teaching.js';

export default {
  name: 'ChooseGameOptions',
  data() {
    return {
      mode: this.$route.query.mode || 'game',
      color: '',
      difficulty: 'medium',
      isCreatingGame: false, // 添加loading状态
    };
  },
  methods: {
    goToMain() {
      this.$router.push('/main');
    },
    async startGame() {
      if (this.isCreatingGame) return; // 防止重复点击

      this.isCreatingGame = true;

      try {
        // 调用 API 创建游戏
        const response = this.mode === 'teaching'
          ? await game.createMatch({ color: this.color, difficulty: this.difficulty })
          // TODO: 这里按理说应该是teaching.createTeaching, 或者getLessons获得一些课程的信息
          // 但目前没有相关的API，所以暂时使用createMatch，因此当前版本下 game和teaching的创建逻辑是一样的
          // 区别在于渲染时 game 不会渲染 ai comment, teaching 会
          : await game.createMatch({ color: this.color, difficulty: this.difficulty });

        const { gameId } = response.data;

        // 直接跳转到 API 游戏页面
        window.location.href = `/game/game/${gameId}?rmode=${this.mode}`;
      } catch (error) {
        console.error('创建游戏失败:', error);
        // 可以在这里添加错误提示
        alert('创建游戏失败，请重试');
      } finally {
        this.isCreatingGame = false;
      }
    }
  }
}
</script>

<style scoped>
.choose-options-modal {
  position: fixed;
  z-index: 999;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(30, 34, 40, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.choose-options-content {
  background: #f7f7f788;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(54, 75, 63, 0.18);
  padding: 2.5em 2.5em 2em 2.5em;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
  animation: popin 0.5s cubic-bezier(.5, 1.8, .5, 1) 1;
}

@keyframes popin {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.choose-options-content h2 {
  font-size: 2.1em;
  font-weight: 700;
  margin-bottom: 0.5em;
  color: #364b3f;
  letter-spacing: 1px;
}

.choose-options-desc {
  color: #4f5442;
  font-size: 1.1em;
  margin-bottom: 2em;
}

.choose-options-btns {
  display: flex;
  justify-content: center;
  gap: 2em;
  margin-bottom: 2em;
}

.color-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.18em;
  font-weight: 700;
  padding: 1.1em 2.5em 1em 2.5em;
  border-radius: 14px;
  border: 2px solid #364b3f;
  box-shadow: 0 2px 12px 0 rgba(54, 75, 63, 0.10), 0 1px 8px 0 rgba(200, 220, 200, 0.10) inset;
  letter-spacing: 0.5px;
  transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s, transform 0.18s;
  min-width: 140px;
  background: linear-gradient(180deg, #fff 60%, #e6eae1 100%);
  color: #364b3f;
  margin: 0 0.5em;
  outline: none;
  cursor: pointer;
}

.color-btn.white .chess-svg svg circle {
  fill: #ffffff;
  stroke: #000000;
  stroke-width: 2.5;
}

.color-btn.black {
  background: linear-gradient(180deg, #364b3f 60%, #222e27 100%);
  color: #e0f5d8;
  border: 2px solid #364b3f;
  box-shadow: 0 2px 12px 0 rgba(54, 75, 63, 0.18), 0 1px 8px 0 rgba(34, 62, 44, 0.10) inset;
}

.color-btn.black .chess-svg svg circle {
  fill: #000000;
  stroke: #ffffff;
  stroke-width: 2.5;
}

.color-btn.white:hover,
.color-btn.white:focus,
.color-btn.black:hover,
.color-btn.black:focus {
  background: linear-gradient(180deg, #e6eae1 60%, #d2e0d2 100%);
  border: 2px solid #22382c;
  transform: translateY(-4px) scale(1.2);
  box-shadow: 0 8px 32px 0 rgba(54, 75, 63, 0.13), 0 2px 16px 0 rgba(200, 220, 200, 0.10) inset;
}

.color-btn.black:hover,
.color-btn.black:focus {
  background: linear-gradient(180deg, #364b3f 60%, #364b3f 800%);
  border: 2px solid #22382c;
}

.color-btn:active {
  transform: scale(0.98);
  border-color: #4f5442 !important;
}

.choose-options-row {
  display: flex;
  align-items: center;
  gap: 1.2em;
  font-size: 1.13em;
  border-radius: 8px;
  padding: 0.7em 1.2em;
  box-shadow: 0 1px 6px 0 rgba(54, 75, 63, 0.06);
  min-width: 240px;
  justify-content: center;
  margin-bottom: 2em;
}

.choose-options-row label {
  min-width: 90px;
  color: #364b3f;
  font-weight: 700;
  font-size: 1.08em;
  letter-spacing: 0.5px;
}

.choose-options-row select {
  font-size: 1.08em;
  padding: 0.35em 1.2em;
  border-radius: 7px;
  border: 2px solid #364b3f;
  background: #fff;
  color: #364b3f;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  font-weight: 600;
  box-shadow: 0 1px 4px 0 rgba(54, 75, 63, 0.04);
}

.choose-options-row select:focus {
  border: 2px solid #22382c;
  box-shadow: 0 0 0 2px #e6eae1;
}

.choose-options-actions {
  display: flex;
  justify-content: center;
  gap: 1.5em;
  margin-top: 2em;
}

.color-btn.notready {
  background: linear-gradient(180deg, #fff 60%, #e6eae1 100%);
  color: #364b3f;
  border: 2px solid #364b3f;
  font-size: 1.18em;
  font-weight: 700;
  border-radius: 14px;
  padding: 1.1em 2.5em 1em 2.5em;
  box-shadow: 0 2px 12px 0 rgba(54, 75, 63, 0.10), 0 1px 8px 0 rgba(200, 220, 200, 0.10) inset;
  letter-spacing: 0.5px;
  transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s, transform 0.18s;
  min-width: 140px;
}

.color-btn.notready:hover,
.color-btn.notready:focus {
  background: linear-gradient(180deg, #e6eae1 60%, #d2e0d2 100%);
  color: #364b3f;
  border: 2px solid #22382c;
  box-shadow: 0 8px 32px 0 rgba(54, 75, 63, 0.13), 0 2px 16px 0 rgba(200, 220, 200, 0.10) inset;
  transform: translateY(-4px) scale(1.06);
}

.color-btn.notready:active {
  border-color: #4f5442 !important;
}

.color-btn.confirm {
  background: linear-gradient(180deg, #fff 60%, #e6eae1 100%);
  color: #364b3f;
  border: 2px solid #364b3f;
  font-weight: 700;
  font-size: 1.18em;
  padding: 1.1em 2.5em 1em 2.5em;
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(54, 75, 63, 0.10), 0 1px 8px 0 rgba(200, 220, 200, 0.10) inset;
  letter-spacing: 0.5px;
  transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s, transform 0.18s;
  min-width: 140px;
}

.color-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.color-btn.confirm:hover,
.color-btn.confirm:focus {
  background: linear-gradient(180deg, #e6eae1 60%, #d2e0d2 100%);
  color: #364b3f;
  border: 2px solid #22382c;
  box-shadow: 0 8px 32px 0 rgba(54, 75, 63, 0.13), 0 2px 16px 0 rgba(200, 220, 200, 0.10) inset;
  transform: translateY(-4px) scale(1.06);
}

.color-btn.confirm:active {
  border-color: #4f5442 !important;
}

@media (max-width: 600px) {
  .choose-options-content {
    padding: 1.2em 0.5em 1em 0.5em;
    min-width: 0;
  }

  .choose-options-btns {
    flex-direction: column;
    gap: 1.2em;
  }

  .choose-options-row {
    flex-direction: column;
    min-width: 0;
    width: 100%;
    padding: 0.7em 0.5em;
  }

  .choose-options-group {
    gap: 1em;
  }
}
</style>