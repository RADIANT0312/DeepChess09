<template>
  <div>
    <!-- 颜色选择弹窗 -->
    <div v-if="!userColor && !showModeSelect" class="color-select-modal">
      <div class="color-select-content">
        <h2>Choose Your Side</h2>
        <p class="color-select-desc">Please select the color you want to play. The AI will play the other side.</p>
        <div class="color-select-btns">
          <button class="color-btn white" @click="selectColor('white')">
            <span class="chess-svg">
              <svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#fff" stroke="#364b3f" stroke-width="2.5"/></svg>
            </span>
            <span>Play as White</span>
          </button>
          <button class="color-btn black" @click="selectColor('black')">
            <span class="chess-svg">
              <svg width="36" height="36" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" fill="#22382c" stroke="#e0f5d8" stroke-width="2.5"/></svg>
            </span>
            <span>Play as Black</span>
          </button>
        </div>
        <button class="color-btn notready" @click="goToMain">I'm not ready</button>
      </div>
    </div>
    <!-- 难度和模式选择弹窗 -->
    <div v-if="showModeSelect" class="color-select-modal">
      <div class="color-select-content">
        <h2>Select AI Difficulty & Mode</h2>
        <div class="mode-select-group">
          <div class="mode-select-row">
            <label>Difficulty:</label>
            <select v-model="difficulty">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div class="mode-select-row">
            <label>Mode:</label>
            <select v-model="mode">
              <option value="game">Play vs AI</option>
              <option value="teaching">Teaching</option>
            </select>
          </div>
        </div>
        <div class="mode-btn-row">
          <button class="color-btn back" @click="resetAll">Back</button>
          <button class="color-btn confirm" @click="selectDifficultyAndMode">Start Game</button>
        </div>
      </div>
    </div>
    <!-- 棋盘内容和教学评价 -->
    <div v-else-if="userColor && !showModeSelect" class="board-container-with-teaching">
      <div v-if="mode==='teaching'" class="teaching-panel">
        <h3>AI Feedback</h3>
        <div v-if="teachingFeedback">
          <div v-if="teachingFeedback.moveRating"><b>Move Rating:</b> {{ teachingFeedback.moveRating }}</div>
          <div v-if="teachingFeedback.aiComment"><b>AI Comment:</b> {{ teachingFeedback.aiComment }}</div>
          <div v-if="teachingFeedback.userComment"><b>Your Move:</b> {{ teachingFeedback.userComment }}</div>
        </div>
        <div v-else style="color:#888;">No feedback yet.</div>
      </div>
      <section id="view">
        <div id="board" ref="boardElement"></div>
      </section>
    </div>
  </div>
</template>

<script>
import { ChessEngine } from './utils/ChessEngine.js';
import { game, teaching } from '@/api';

export default {
  name: 'Board',
  data() {
    return {
      userColor: null,      // 用户选择的颜色
      gameId: null,         // 当前对局ID
      difficulty: 'medium', // AI难度
      mode: 'game',         // 模式 game/teaching
      showModeSelect: false,
      teachingId: null,     // 教学模式下lessonId或教学对局id
      teachingFeedback: null, // 教学AI评价
      game: null,           // 棋盘引擎实例
      view: null,           // 棋盘视图实例
      boardFEN: '',         // 当前棋盘FEN
      isLoading: false,     // 加载状态
    };
  },
  mounted() {
    this.initializeGame();
  },
  beforeUnmount() {
    if (this.autoplayInterval) {
      clearTimeout(this.autoplayInterval);
    }
  },
  watch: {
    perspective(newVal) {
      if (this.view) {
        this.view.setPerspective(newVal);
      }
    },
    speed() {
      // 速度变化时重启自动播放
      this.restartAutoplay();
    },
    autoWhite() {
      this.restartAutoplay();
    },
    autoBlack() {
      this.restartAutoplay();
    }
  },
  methods: {
    selectColor(color) {
      this.userColor = color;
      this.showModeSelect = true;
    },
    resetAll() {
      this.userColor = null;
      this.showModeSelect = false;
      this.difficulty = 'medium';
      this.mode = 'game';
      this.teachingId = null;
      this.teachingFeedback = null;
      this.gameId = null;
      this.game = null;
      this.view = null;
      this.boardFEN = '';
    },
    async selectDifficultyAndMode() {
      this.isLoading = true;
      this.showModeSelect = false;
      try {
        if (this.mode === 'game') {
          // 对弈模式
          const newGame = await game.createMatch({
            color: this.userColor,
            difficulty: this.difficulty
          });
          this.gameId = newGame.gameId;
          await this.initializeGame();
        } else {
          // 教学模式
          // 假设教学API有获取lessonId的接口，否则用固定id或教学API的走子接口
          // 这里只做演示，实际可根据API调整
          // 1. 获取教学课程列表，取第一个lessonId
          const lessons = await teaching.getLessons();
          const lessonId = lessons.lessons?.[0]?.id || lessons[0]?.id || 'default_lesson_id';
          this.teachingId = lessonId;
          // 2. 获取初始棋盘状态
          const lesson = await teaching.getLesson(lessonId);
          this.boardFEN = lesson.boardState || lesson.fen || '';
          this.initChessEngineFromFEN(this.boardFEN, lesson.turn || this.userColor.toUpperCase());
        }
      } catch (e) {
        alert('创建对局失败：' + (e?.response?.status ? e.response.status + ' ' : '') + (e?.response?.data?.message || e?.message || '请重试'));
        this.resetAll();
      }
      this.isLoading = false;
    },
    async initializeGame() {
      const gameState = await game.getGameState(this.gameId);
      this.boardFEN = gameState.fen;
      this.initChessEngineFromFEN(this.boardFEN, gameState.turn);
      if (gameState.turn !== this.userColor) {
        await this.handleAIMove();
      }
    },
    initChessEngineFromFEN(fen, turn) {
      const pieces = ChessEngine.Utils.getInitialPieces();
      const positions = ChessEngine.Utils.getInitialPiecePositions();
      this.game = new ChessEngine.Game(pieces, positions, turn);
      if (this.view) {
        this.view = null;
      }
      this.$nextTick(() => {
        this.view = new ChessEngine.View(this.$refs.boardElement, this.game, this.userColor.toUpperCase());
        this.overrideTileClick();
      });
    },
    overrideTileClick() {
      const origHandle = this.view.handleTileClick.bind(this.view);
      this.view.handleTileClick = async (location) => {
        if (this.game.turn !== this.userColor.toUpperCase()) return;
        const fromPiece = this.game.board.tileFind(location);
        const activePiece = this.game.active;
        origHandle(location);
        if (activePiece && this.game.turn !== this.userColor.toUpperCase()) {
          const moveStr = this.getMoveString(activePiece, location);
          if (moveStr) {
            if (this.mode === 'game') {
              await this.handleUserMove(moveStr);
            } else {
              await this.handleTeachingMove(moveStr);
            }
          }
        }
      };
    },
    getMoveString(piece, toLocation) {
      const from = piece ? piece.data : null;
      if (!from) return null;
      const fromCol = from.col ? from.col.toLowerCase() : '';
      const fromRow = from.row ? from.row : '';
      const toCol = toLocation.col ? toLocation.col.toLowerCase() : '';
      const toRow = toLocation.row ? toLocation.row : '';
      if (fromCol && fromRow && toCol && toRow) {
        return `${fromCol}${fromRow}${toCol}${toRow}`;
      }
      return null;
    },
    async handleUserMove(moveStr) {
      this.isLoading = true;
      try {
        const moveResult = await game.makeMove(this.gameId, moveStr);
        this.boardFEN = moveResult.fen;
        this.initChessEngineFromFEN(this.boardFEN, moveResult.turn);
        if (moveResult.turn !== this.userColor) {
          await this.handleAIMove();
        }
      } catch (e) {
        alert('走法无效或网络错误');
      }
      this.isLoading = false;
    },
    async handleAIMove() {
      this.isLoading = true;
      try {
        const gameState = await game.getGameState(this.gameId);
        this.boardFEN = gameState.fen;
        this.initChessEngineFromFEN(this.boardFEN, gameState.turn);
      } catch (e) {
        alert('AI走棋失败');
      }
      this.isLoading = false;
    },
    async handleTeachingMove(moveStr) {
      this.isLoading = true;
      try {
        // 调用教学API走子
        const result = await teaching.makeMove(this.teachingId, moveStr);
        this.teachingFeedback = {
          moveRating: result.moveRating,
          aiComment: result.aiComment,
          userComment: result.userComment
        };
        this.boardFEN = result.boardState || result.fen || '';
        this.initChessEngineFromFEN(this.boardFEN, result.turn || this.userColor.toUpperCase());
      } catch (e) {
        alert('教学走法无效或网络错误');
      }
      this.isLoading = false;
    },
    goToMain() {
      this.$router.push('/main');
    }
  }
}
</script>

<style>
/* 棋盘相关的 CSS 变量 */
:root {
  --border-width: calc(var(--diameter-tile) / 60);
  --diameter-board: min(85vw, 85vh);
  --diameter-tile: calc(1 / 8 * var(--diameter-board));
  --edge-width: calc((min(100vw, 100vh) - var(--diameter-board)) * 0.3);
  --color-danger: tomato;
  --color-success: #1d83e0;
  --color-white: #f0f0f0;
  --color-black: #222;
  --color-board-hue: 180;
  --color-board-sat: 12.7%;
  --color-shadow: hsl(var(--color-board-hue), var(--color-board-sat), 15.9%);
  --color-shadow-lighter: hsl(var(--color-board-hue), var(--color-board-sat), 25%);
  --transition-ease: cubic-bezier(0.25, 1, 0.5, 1);
  --color-background: var(--color-black);
}

.board-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 页面内容根据bar状态调整 */
#view {
  background: var(--color-shadow-lighter);
  box-shadow: 0 0 0 calc(var(--border-width) * 3) var(--color-shadow-lighter),
    0 0 0 var(--edge-width) var(--color-shadow);
  height: var(--diameter-board);
  position: relative;
  width: var(--diameter-board);
}

/* 棋盘样式 */
#board {
  height: 100%;
  width: 100%;
}

.board {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  width: 100%;
}

.board .row {
  display: flex;
  height: var(--diameter-tile);
  width: 100%;
}

.perspective-black .board .row {
  flex-direction: row-reverse;
}

.perspective-black .board {
  flex-direction: column;
}

.board .row .tile {
  background-color: currentcolor;
  border: none;
  box-shadow: inset 0 0 0 var(--border-width) var(--color-shadow-lighter);
  display: flex;
  flex-direction: column;
  height: var(--diameter-tile);
  justify-content: space-between;
  padding: 0;
  position: relative;
  transition: background-color 350ms var(--transition-ease);
  width: var(--diameter-tile);
}

.perspective-black .board .row:nth-child(even) .tile:nth-child(odd),
.perspective-black .board .row:nth-child(odd) .tile:nth-child(even),
.perspective-white .board .row:nth-child(even) .tile:nth-child(even),
.perspective-white .board .row:nth-child(odd) .tile:nth-child(odd) {
  color: hsl(var(--color-board-hue), var(--color-board-sat), 62%);
}

.perspective-black .board .row:nth-child(even) .tile:nth-child(even),
.perspective-black .board .row:nth-child(odd) .tile:nth-child(odd),
.perspective-white .board .row:nth-child(even) .tile:nth-child(odd),
.perspective-white .board .row:nth-child(odd) .tile:nth-child(even) {
  color: hsl(var(--color-board-hue), var(--color-board-sat), 70%);
}

.board .row .tile .move,
.board .row .tile .moves,
.board .row .tile .captures {
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  height: var(--diameter-tile);
  justify-content: center;
  left: 0;
  padding: calc(var(--diameter-tile) * 0.025);
  position: absolute;
  top: 0;
  width: var(--diameter-tile);
  z-index: 9;
}

.board .row .tile .move,
.board .row .tile .moves {
  align-content: center;
  align-items: center;
}
.board .row .tile .captures {
  align-items: flex-start;
  justify-content: space-between;
}
.board .row .tile:not(.occupied) .captures {
  align-items: center;
  justify-content: center;
}

.board .row .tile > div > svg {
  --stroke: transparent;
  box-sizing: border-box;
  height: var(--di);
  line-height: var(--di);
  width: var(--di);
}

.board .row .tile .move svg {
  --di: calc(var(--diameter-tile) / 4);
  --fill: var(--color-shadow);
}

.board .row .tile .moves svg,
.board .row .tile .captures svg {
  --di: calc(var(--diameter-tile) / 4);
  --fill: var(--color-shadow);
  opacity: 0.4;
}

.board .row .tile.occupied .captures svg { position: absolute; }
.board .row .tile.occupied .captures svg:nth-child(1) { top: 0; left: 0; }
.board .row .tile.occupied .captures svg:nth-child(2) { top: 0; right: 0; }
.board .row .tile.occupied .captures svg:nth-child(3) { bottom: calc(var(--di) * 0.1); left: 0; }
.board .row .tile.occupied .captures svg:nth-child(4) { bottom: calc(var(--di) * 0.1); right: 0; }
.board .row .tile.occupied .captures svg:nth-child(5) { top: calc(50% - var(--di) * 0.55); left: 0; }
.board .row .tile.occupied .captures svg:nth-child(6) { top: calc(50% - var(--di) * 0.55); right: 0; }
.board .row .tile.occupied .captures svg:nth-child(7) { top: 0; left: calc(50% - var(--di) * 0.5); }
.board .row .tile.occupied .captures svg:nth-child(8) { bottom: calc(var(--di) * 0.1); left: calc(50% - var(--di) * 0.5); }

.touching .board .row .tile .moves,
.touching .board .row .tile .captures,
.turn-black .board .row .tile .moves .white,
.turn-black .board .row .tile .captures .white,
.turn-white .board .row .tile .moves .black,
.turn-white .board .row .tile .captures .black {
  display: none;
}

.board .row .tile[class*="highlight-"] .moves,
.board .row .tile[class*="highlight-"] .captures {
  display: none;  
}

button:focus {
  outline: none;
  position: relative;
  z-index: 9;
}

svg {
  --fill: var(--color-black);
  --stroke: var(--color-shadow);
  fill: var(--fill);
}

svg.white { --fill: var(--color-white); }
svg.black { --fill: var(--color-black); }

.pieces {
  display: block;
  height: var(--diameter-board);
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: var(--diameter-board);
  z-index: 99;
}

.pieces .piece.white {
  --pos-row: -1;
}
.pieces .piece.black {
  --pos-row: 8;
}
.pieces .piece {
  --pos-col: 3.5;
  --scale: 0;
  --transition-delay: 0ms;
  --transition-duration: 200ms;
  bottom: 0;
  display: block;
  height: var(--diameter-tile);
  position: absolute;
  left: 0;
  transform: translate(
      calc(var(--pos-col) * 100%),
      calc(var(--pos-row) * -100%)
    )
    translateZ(0);
  transform-origin: 50% 50%;
  transition: all var(--transition-duration) var(--transition-ease)
    var(--transition-delay);
  width: var(--diameter-tile);
}
.perspective-black .pieces .piece {
  transform: translate(
      calc((7 - var(--pos-col)) * 100%),
      calc((7 - var(--pos-row)) * -100%)
    )
    translateZ(0);
}
.pieces .piece svg {
  display: block;
  left: 50%;
  opacity: 1;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%) translateZ(0) scale(var(--scale));
  transform-origin: 50% 50%;
  transition: transform var(--transition-duration) var(--transition-ease),
    fill var(--transition-duration) var(--transition-ease),
    opacity var(--transition-duration) var(--transition-ease);
}
.turn-white .pieces .piece:not(.highlight-capture) svg.black,
.turn-black .pieces .piece:not(.highlight-capture) svg.white,
.turn-black .pieces .piece:not(.can-move):not(.can-capture) svg.black,
.turn-white .pieces .piece:not(.can-move):not(.can-capture) svg.white {
  --stroke: transparent;
  opacity: 0.8;
}

@-webkit-keyframes wobble {
  0%, 50%, 100% { transform: translate(-50%, -50%) translateZ(0) scale(1) rotate(0deg); }
  25% { transform: translate(-50%, -50%) translateZ(0) scale(1.1) rotate(-2deg); }
  75% { transform: translate(-50%, -50%) translateZ(0) scale(1.1) rotate(2deg); }
}

@keyframes wobble {
  0%, 50%, 100% { transform: translate(-50%, -50%) translateZ(0) scale(1) rotate(0deg); }
  25% { transform: translate(-50%, -50%) translateZ(0) scale(1.1) rotate(-2deg); }
  75% { transform: translate(-50%, -50%) translateZ(0) scale(1.1) rotate(2deg); }
}
.pieces .piece.highlight-active svg {
  -webkit-animation: wobble 500ms linear infinite;
          animation: wobble 500ms linear infinite;
  --stroke: var(--color-success);
}

.pieces .piece.highlight-capture svg {
  --stroke: var(--color-danger);
}

.piece svg {
  --svg-di: calc(var(--diameter-tile) * 0.666);
  display: block;
  font-weight: bold;
  height: var(--svg-di);
  left: 50%;
  line-height: var(--svg-di);
  position: absolute;
  stroke-linejoin: round;
  text-align: center;
  top: 50%;
  transform: translate(-50%, -50%);
  width: var(--svg-di);
}
.color-select-modal {
  position: fixed;
  z-index: 999;
  left: 0; right: 0; top: 0; bottom: 0;
  background: rgba(30, 34, 40, 0.45); /* 恢复原背景色 */
  backdrop-filter: blur(4px); /* 恢复原模糊 */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}
.color-select-content {
  background: #f8faf7;
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(54, 75, 63, 0.18);
  padding: 2.5em 2.5em 2em 2.5em;
  min-width: 320px;
  max-width: 90vw;
  text-align: center;
  animation: popin 0.5s cubic-bezier(.5,1.8,.5,1) 1;
}
@keyframes popin {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.color-select-content h2 {
  font-size: 2.1em;
  font-weight: 700;
  margin-bottom: 0.5em;
  color: #364b3f;
  letter-spacing: 1px;
}
.color-select-desc {
  color: #4f5442;
  font-size: 1.1em;
  margin-bottom: 2em;
}
.color-select-btns {
  display: flex;
  justify-content: center;
  gap: 2em;
}
.color-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.3em;
  font-weight: 600;
  padding: 1.2em 2.2em 1em 2.2em;
  border-radius: 14px;
  border: 2px solid #364b3f;
  box-shadow: 0 2px 12px 0 rgba(54,75,63,0.10);
  background: #f8faf7;
  color: #364b3f;
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, background 0.18s, color 0.18s, border 0.18s;
  margin: 0 0.5em;
  min-width: 110px;
  position: relative;
  outline: none;
}
.color-btn .chess-svg {
  margin-bottom: 0.5em;
  display: block;
}
.color-btn.white {
  background: linear-gradient(180deg, #fff 60%, #e6eae1 100%);
  color: #364b3f;
  border: 2px solid #364b3f;
  box-shadow: 0 2px 12px 0 rgba(54,75,63,0.10), 0 1px 8px 0 rgba(200,220,200,0.10) inset;
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}
.color-btn.white .chess-svg svg circle {
  fill: #fff;
  stroke: #364b3f;
  stroke-width: 2.5;
}
.color-btn.black {
  background: linear-gradient(180deg, #364b3f 60%, #222e27 100%);
  color: #e0f5d8;
  border: 2px solid #364b3f;
  box-shadow: 0 2px 12px 0 rgba(54,75,63,0.18), 0 1px 8px 0 rgba(34,62,44,0.10) inset;
  font-weight: 700;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}
.color-btn.black .chess-svg svg circle {
  fill: #22382c;
  stroke: #e0f5d8;
  stroke-width: 2.5;
}
.color-btn.white:hover, .color-btn.white:focus {
  background: linear-gradient(180deg, #e6eae1 60%, #d2e0d2 100%);
  color: #364b3f;
  border: 2px solid #22382c;
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 8px 32px 0 rgba(54,75,63,0.13), 0 2px 16px 0 rgba(200,220,200,0.10) inset;
}
.color-btn.black:hover, .color-btn.black:focus {
  background: linear-gradient(180deg, #22382c 60%, #181f1a 100%);
  color: #b6ffb0;
  border: 2px solid #22382c;
  transform: translateY(-4px) scale(1.06);
  box-shadow: 0 8px 32px 0 rgba(34,62,44,0.18), 0 2px 16px 0 rgba(54,75,63,0.10) inset;
}
.color-btn:active {
  transform: scale(0.98);
  border-color: #4f5442 !important; /* 选中时边框为原背景色 */
}
.color-btn.black:active {
  border-color: #4f5442 !important;
}
.color-btn.white:active {
  border-color: #4f5442 !important;
}
.color-btn.notready {
  margin-top: 2.2em;
  background: linear-gradient(180deg, #fff 60%, #e6eae1 100%);
  color: #364b3f;
  border: 2px solid #364b3f;
  font-size: 1.18em;
  font-weight: 700;
  border-radius: 14px;
  padding: 1.1em 2.5em 1em 2.5em;
  box-shadow: 0 2px 12px 0 rgba(54,75,63,0.10), 0 1px 8px 0 rgba(200,220,200,0.10) inset;
  letter-spacing: 0.5px;
  transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s, transform 0.18s;
  display: block;
  margin-left: auto;
  margin-right: auto;
  min-width: 140px;
}
.color-btn.notready:hover, .color-btn.notready:focus {
  background: linear-gradient(180deg, #e6eae1 60%, #d2e0d2 100%);
  color: #364b3f;
  border: 2px solid #22382c;
  box-shadow: 0 8px 32px 0 rgba(54,75,63,0.13), 0 2px 16px 0 rgba(200,220,200,0.10) inset;
  transform: translateY(-4px) scale(1.06);
}
.color-btn.notready:active {
  border-color: #4f5442 !important;
}
@media (max-width: 600px) {
  .color-select-content {
    padding: 1.2em 0.5em 1em 0.5em;
    min-width: 0;
  }
  .color-select-btns {
    flex-direction: column;
    gap: 1.2em;
  }
}
.board-container-with-teaching {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
}
.teaching-panel {
  width: 260px;
  min-width: 220px;
  max-width: 320px;
  height: 100%;
  background: linear-gradient(135deg, #364b3f 80%, #4f5442 100%);
  border-radius: 18px 0 0 18px;
  box-shadow: 4px 0 24px 0 rgba(54,75,63,0.13);
  margin-right: 0;
  margin-left: 0;
  padding: 2.2em 1.3em 1.3em 1.3em;
  font-size: 1.08em;
  color: #f8faf7;
  min-height: 320px;
  margin-top: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  border-right: 4px solid #1d83e0;
  box-sizing: border-box;
  overflow-y: auto;
}
.teaching-panel h3 {
  margin-top: 0;
  margin-bottom: 1.2em;
  color: #1d83e0;
  font-size: 1.25em;
  font-weight: 800;
  letter-spacing: 1px;
  text-align: left;
}
.teaching-panel > div {
  margin-bottom: 1.2em;
  padding-bottom: 1.2em;
  border-bottom: 1.5px solid #4f5442;
}
.teaching-panel > div:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.teaching-panel b {
  color: #b6ffb0;
  font-weight: 700;
}
.teaching-panel .feedback-section {
  margin-bottom: 1.1em;
}
.teaching-panel .feedback-label {
  color: #e0f5d8;
  font-weight: 600;
  margin-right: 0.5em;
}
.teaching-panel .feedback-value {
  color: #fff;
  font-weight: 500;
}
@media (max-width: 900px) {
  .teaching-panel {
    min-width: 120px;
    width: 38vw;
    padding: 1.2em 0.5em 1em 0.5em;
    font-size: 0.98em;
    border-radius: 12px 0 0 12px;
  }
}
.mode-select-group {
  margin-bottom: 1.5em;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
  align-items: center;
}
.mode-select-row {
  display: flex;
  align-items: center;
  gap: 1.2em;
  font-size: 1.13em;
  background: #f8faf7;
  border-radius: 8px;
  padding: 0.7em 1.2em;
  box-shadow: 0 1px 6px 0 rgba(54,75,63,0.06);
  min-width: 240px;
}
.mode-select-row label {
  min-width: 90px;
  color: #364b3f;
  font-weight: 700;
  font-size: 1.08em;
  letter-spacing: 0.5px;
}
.mode-select-row select {
  font-size: 1.08em;
  padding: 0.35em 1.2em;
  border-radius: 7px;
  border: 2px solid #364b3f;
  background: #fff;
  color: #364b3f;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  font-weight: 600;
  box-shadow: 0 1px 4px 0 rgba(54,75,63,0.04);
}
.mode-select-row select:focus {
  border: 2px solid #22382c;
  box-shadow: 0 0 0 2px #e6eae1;
}
@media (max-width: 600px) {
  .mode-select-row {
    flex-direction: column;
    min-width: 0;
    width: 100%;
    padding: 0.7em 0.5em;
  }
  .mode-select-group {
    gap: 1em;
  }
}
.color-btn.confirm, .color-btn.back {
  background: linear-gradient(180deg, #fff 60%, #e6eae1 100%);
  color: #364b3f;
  border: 2px solid #364b3f;
  font-weight: 700;
  font-size: 1.18em;
  padding: 1.1em 2.5em 1em 2.5em;
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(54,75,63,0.10), 0 1px 8px 0 rgba(200,220,200,0.10) inset;
  letter-spacing: 0.5px;
  transition: background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s, transform 0.18s;
  min-width: 140px;
}
.color-btn.confirm:hover, .color-btn.confirm:focus,
.color-btn.back:hover, .color-btn.back:focus {
  background: linear-gradient(180deg, #e6eae1 60%, #d2e0d2 100%);
  color: #364b3f;
  border: 2px solid #22382c;
  box-shadow: 0 8px 32px 0 rgba(54,75,63,0.13), 0 2px 16px 0 rgba(200,220,200,0.10) inset;
  transform: translateY(-4px) scale(1.06);
}
.color-btn.confirm:active, .color-btn.back:active {
  border-color: #4f5442 !important;
}
.mode-btn-row {
  display: flex;
  justify-content: center;
  gap: 1.5em;
  margin-top: 2em;
}
</style>
