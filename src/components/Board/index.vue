<template>
  <div class="board-container">
    <section id="view">
      <div id="board" ref="boardElement"></div>
    </section>
  </div>
</template>

<script>
import { ChessEngine } from './utils/ChessEngine.js';

export default {
  name: 'Board',
  props: {},
  data() {
    return {
      autoWhite: false,
      autoBlack: true,
      speed: 'medium',
      perspective: 'WHITE',
      game: null,
      view: null,
      control: null,
      autoplayInterval: null
    }
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
    initializeGame() {
      console.clear();

      // 初始化游戏
      const initialPositions = ChessEngine.Utils.getInitialPiecePositions();
      const initialTurn = "WHITE";

      this.game = new ChessEngine.Game(ChessEngine.Utils.getInitialPieces(), initialPositions, initialTurn);
      this.view = new ChessEngine.View(this.$refs.boardElement, this.game, this.perspective);

      this.startAutoplay();
    },

    getSpeedValue() {
      const speeds = {
        'slow': 1000,
        'medium': 500,
        'fast': 250,
        'asap': 50
      };
      return speeds[this.speed] || 500;
    },

    startAutoplay() {
      this.autoplayInterval = setTimeout(() => {
        this.autoplayTick();
      }, this.getSpeedValue());
    },

    autoplayTick() {
      const shouldAutoplay = this.game.turn === "WHITE" ? this.autoWhite : this.autoBlack;

      if (shouldAutoplay) {
        const position = this.game.randomMove();
        this.view.handleTileClick(position);
      }

      this.autoplayInterval = setTimeout(() => {
        this.autoplayTick();
      }, this.getSpeedValue());
    },

    restartAutoplay() {
      if (this.autoplayInterval) {
        clearTimeout(this.autoplayInterval);
      }
      this.startAutoplay();
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
</style>
