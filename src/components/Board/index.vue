<template>
  <div>
    <div class="board-container-with-teaching">
      <section id="view">
        <div
          id="board"
          class="board"
          :class="userColor.toLowerCase() === 'black' ? 'perspective-black' : 'perspective-white'"
          v-if="boardState && Object.keys(boardState).length === 8"
        >
          <div v-for="row in rowOrder" :key="row" class="row">
            <button
              v-for="colIdx in colOrder"
              :key="colIdx"
              class="tile"
              :class="getTileClass(row, colIdx)"
              @click="handleTileClick(row, colIdx)"
              v-html="getPieceSVG(row, colIdx)"
            ></button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ChessEngine } from './utils/ChessEngine.js';
import { game, teaching } from '@/api';

// 新增：FEN解析函数
function parseFEN(fen) {
  const [position, turn] = fen.split(' ');
  const rows = position.split('/');
  const piecePositions = {};
  const pieces = {};
  const pieceMap = {
    p: 'PAWN', n: 'KNIGHT', b: 'BISHOP', r: 'ROOK', q: 'QUEEN', k: 'KING'
  };
  for (let i = 0; i < 8; i++) {
    let colIdx = 0;
    for (const char of rows[i]) {
      if (/\d/.test(char)) {
        colIdx += parseInt(char);
      } else {
        const row = 8 - i;
        const col = String.fromCharCode('A'.charCodeAt(0) + colIdx);
        const id = col + row;
        const player = char === char.toUpperCase() ? 'WHITE' : 'BLACK';
        const type = pieceMap[char.toLowerCase()];
        // 新增log
        console.log('[parseFEN] row:', row, 'col:', col, 'char:', char, 'player:', player, 'type:', type);
        piecePositions[id] = { active: true, row: String(row), col };
        pieces[id] = new ChessEngine.Piece({ id, player, type });
        colIdx++;
      }
    }
  }
  return {
    pieces,
    piecePositions,
    turn: turn === 'w' ? 'WHITE' : 'BLACK'
  };
}

export default {
  name: 'Board',
  props: {
    boardFEN: {
      type: String,
      default: ''
    },
    moves: {
      type: Array,
      default: () => []
    },
    currentPlayer: {
      type: String,
      default: 'white'
    },
    userColor: {
      type: String,
      default: 'white'
    },
    gameStatus: {
      type: String,
      default: 'ongoing'
    },
    gameResult: {
      type: String,
      default: 'ongoing'
    },
    mode: {
      type: String,
      default: 'game'
    },
    isTimeout: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      boardState: {},
      pieces: {},
      piecePositions: {},
      turn: 'WHITE',
      gameId: null,
      lessonId: null,
      game: null,
      view: null,
      isLoading: false,
      difficulty: 'medium',
      selected: null, // 记录选中的棋子
      testMode: this.$route?.query?.test === '1' // URL参数test=1时启用本地测试
    };
  },
  computed: {
    rowOrder() {
      const order = this.userColor && this.userColor.toLowerCase() === 'black'
        ? [1,2,3,4,5,6,7,8]
        : [8,7,6,5,4,3,2,1];
      console.log('[Board] rowOrder value:', order, 'userColor:', this.userColor);
      return order;
    },
    colOrder() {
      // 始终返回 [0,1,2,3,4,5,6,7]，通过 visualToBoard 实现左右翻转
      return [0,1,2,3,4,5,6,7];
    }
  },
  async mounted() {
    console.log('[Board] mounted userColor:', this.userColor);
    console.log('[Board] boardFEN:', this.boardFEN);
    this.difficulty = this.$route?.query?.difficulty || 'medium';

    if (this.testMode) {
      // 本地测试模式：只用本地引擎
      this.initLocalTestMode();
    } else {
      // 不做初始化，等 watch 触发
    }
  },
  watch: {
    // 监听prop变化，更新棋盘状态
    boardFEN(newFEN) {
      console.log('[Board] watch boardFEN:', newFEN);
      if (newFEN && !this.testMode) {
        this.initBoardFromFEN(newFEN, this.userColor);
      }
    },
    isTimeout(newValue) {
      // 当超时时禁用棋盘交互
      if (newValue && this.view) {
        this.view.element.onclick = null;
      } else if (!newValue && this.view) {
        this.view.element.onclick = this.handleBoardClick;
      }
    }
  },
  methods: {
    visualToBoard(row, colIdx) {
      if (this.userColor.toLowerCase() === 'black') {
        return {
          row: 9 - row,
          colIdx: 9 - colIdx
        };
      }
      return { row, colIdx };
    },
    initLocalTestMode() {
      const pieces = ChessEngine.Utils.getInitialPieces();
      const piecePositions = ChessEngine.Utils.getInitialPiecePositions();
      this.pieces = pieces;
      this.piecePositions = piecePositions;
      this.turn = this.userColor.toUpperCase();
      this.updateBoardState();
      this.selected = null;
    },
    
    initDefaultBoard() {
      const pieces = ChessEngine.Utils.getInitialPieces();
      const piecePositions = ChessEngine.Utils.getInitialPiecePositions();
      this.pieces = pieces;
      this.piecePositions = piecePositions;
      this.turn = this.userColor.toUpperCase();
      this.updateBoardState();
      this.selected = null;
    },

    async createGameMatch() {
      this.isLoading = true;
      try {
        const res = await game.createMatch({
          color: this.userColor,
          difficulty: this.difficulty
        });
        this.gameId = res.data.id;
        const fen = res.data.fen;
        this.initBoardFromFEN(fen, this.userColor);
        if (res.data.turn && res.data.turn !== this.userColor) {
          await this.handleAIMove();
        }
      } catch (e) {
        alert('创建对局失败: ' + (e?.response?.data?.message || e.message));
      } finally {
        this.isLoading = false;
      }
    },
    
    async startTeachingLesson() {
      this.isLoading = true;
      try {
        const lessons = await teaching.getLessons();
        const lesson = lessons.data.lessons[0];
        this.lessonId = lesson.id;
        const lessonDetail = await teaching.getLesson(this.lessonId);
        const fen = lessonDetail.data.fen;
        this.initBoardFromFEN(fen, this.userColor);
      } catch (e) {
        alert('教学初始化失败: ' + (e?.response?.data?.message || e.message));
      } finally {
        this.isLoading = false;
      }
    },
    
    // 用FEN初始化棋盘（这里只用初始布局，实际应写FEN转化）
    initBoardFromFEN(fen, color) {
      const { pieces, piecePositions, turn } = parseFEN(fen);
      this.pieces = pieces;
      this.piecePositions = piecePositions;
      this.turn = turn;
      this.updateBoardState();
      this.selected = null;
    },
    
    // 棋盘点击事件（API模式）
    handleBoardClick(e) {
      if (!e.target.classList.contains('tile')) return;
      if (this.isTimeout) return; // 超时时不允许操作
      if (this.gameStatus !== 'ongoing') return; // 游戏结束时不允许操作

      const tile = e.target;
      const rowIdx = Array.from(tile.parentNode.parentNode.children).indexOf(tile.parentNode);
      const colIdx = Array.from(tile.parentNode.children).indexOf(tile);
      const row = ChessEngine.Utils.intToRow(rowIdx);
      const col = ChessEngine.Utils.intToCol(colIdx);
      
      if (!this.selected) {
        this.selected = { row, col };
        return;
      }
      
      const from = this.selected;
      const to = { row, col };
      const move = this.convertToMoveString(from, to);
      this.selected = null;
      
      // 触发用户交互事件
      this.$emit('user-interaction');
      
      if (this.mode === 'game') {
        this.handleUserMove(move);
      } else if (this.mode === 'learning') {
        this.handleTeachingMove(move);
      }
    },
    
    // 棋盘点击事件（本地测试模式）
    handleLocalBoardClick(e) {
      if (!e.target.classList.contains('tile')) return;
      const tile = e.target;
      const rowIdx = Array.from(tile.parentNode.parentNode.children).indexOf(tile.parentNode);
      const colIdx = Array.from(tile.parentNode.children).indexOf(tile);
      const row = ChessEngine.Utils.intToRow(rowIdx);
      const col = ChessEngine.Utils.intToCol(colIdx);
      if (!this.selected) {
        this.selected = { row, col };
        return;
      }
      const from = this.selected;
      const to = { row, col };
      this.selected = null;
      // 本地走子
      this.game.activate(from); // 选中
      this.game.activate(to);   // 走子
      this.view.drawPiecePositions();
    },
    
    // 将坐标转为如"e2e4"格式
    convertToMoveString(from, to) {
      return (
        from.col.toLowerCase() + from.row + to.col.toLowerCase() + to.row
      );
    },
    
    async handleUserMove(move) {
      try {
        const res = await game.makeMove(this.gameId, move);
        const fen = res.data.fen;
        this.initBoardFromFEN(fen, this.userColor);
        if (res.data.turn && res.data.turn !== this.userColor) {
          await this.handleAIMove();
        }
      } catch (e) {
        alert('走子失败: ' + (e?.response?.data?.message || e.message));
      }
    },
    
    async handleAIMove() {
      try {
        const res = await game.getGameState(this.gameId);
        const fen = res.data.fen;
        this.initBoardFromFEN(fen, this.userColor);
      } catch (e) {
        alert('AI走子失败: ' + (e?.response?.data?.message || e.message));
      }
    },
    
    async handleTeachingMove(move) {
      try {
        const res = await teaching.makeMove(this.lessonId, move);
        const fen = res.data.boardState;
        this.initBoardFromFEN(fen, this.userColor);
        // 可根据res.data.aiComment等显示教学反馈
      } catch (e) {
        alert('教学走子失败: ' + (e?.response?.data?.message || e.message));
      }
    },

    initBoard() {
      // 默认初始局面
      this.pieces = ChessEngine.Utils.getInitialPieces();
      this.piecePositions = ChessEngine.Utils.getInitialPiecePositions();
      this.turn = 'WHITE';
      this.updateBoardState();
    },
    updateBoardState() {
      // 生成 boardState: {1:{A:pieceId,...},...}
      this.boardState = ChessEngine.Utils.getInitialBoardState();
      for (const pieceId in this.piecePositions) {
        const pos = this.piecePositions[pieceId];
        if (pos.active) {
          const { row, col } = pos;
          if (!this.boardState[row]) this.boardState[row] = {};
          this.boardState[row][col] = pieceId;
        }
      }
    },
    getPieceSVG(row, colIdx) {
      const { row: realRow, colIdx: realColIdx } = this.visualToBoard(row, colIdx);
      const colChar = String.fromCharCode('A'.charCodeAt(0) + realColIdx);
      const rowObj = this.boardState && this.boardState[String(realRow)];
      if (!rowObj) return '';
      const pieceId = rowObj[colChar];
      if (pieceId && this.pieces[pieceId]) {
        // 新增：输出棋子归属和类型，便于调试底线棋子
        console.log(`[Board] piece at visual row ${row}, col ${colIdx} (real row ${realRow}, col ${colChar}):`, this.pieces[pieceId]);
        return this.pieces[pieceId].shape();
      }
      return '';
    },
    getTileClass(row, colIdx) {
      const { row: realRow, colIdx: realColIdx } = this.visualToBoard(row, colIdx);
      return (realRow + realColIdx) % 2 === 0 ? 'light' : 'dark';
    },
    handleTileClick(row, colIdx) {
      const { row: realRow, colIdx: realColIdx } = this.visualToBoard(row, colIdx);
      // TODO: 保持原有点击逻辑，可根据需要补充
    }
  }
};
</script>

<style>
.board-container-with-teaching {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
}
</style>
