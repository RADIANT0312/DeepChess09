<template>
  <div>
    <div class="board-container-with-teaching">
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
  async mounted() {
    this.difficulty = this.$route?.query?.difficulty || 'medium';

    if (this.testMode) {
      // 本地测试模式：只用本地引擎
      this.initLocalTestMode();
    } else {
      // 使用父组件传递的数据初始化棋盘
      if (this.boardFEN) {
        this.initBoardFromFEN(this.boardFEN, this.userColor);
      } else {
        // 如果没有传递FEN，使用默认初始局面
        this.initDefaultBoard();
      }
    }
  },
  watch: {
    // 监听prop变化，更新棋盘状态
    boardFEN(newFEN) {
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
    initLocalTestMode() {
      const pieces = ChessEngine.Utils.getInitialPieces();
      const piecePositions = ChessEngine.Utils.getInitialPiecePositions();
      this.game = new ChessEngine.Game(pieces, piecePositions, this.userColor.toUpperCase());
      this.view = new ChessEngine.View(this.$refs.boardElement, this.game, this.userColor.toUpperCase());
      this.view.element.onclick = this.handleLocalBoardClick;
      this.selected = null;
    },
    
    initDefaultBoard() {
      const pieces = ChessEngine.Utils.getInitialPieces();
      const piecePositions = ChessEngine.Utils.getInitialPiecePositions();
      this.game = new ChessEngine.Game(pieces, piecePositions, this.userColor.toUpperCase());
      this.view = new ChessEngine.View(this.$refs.boardElement, this.game, this.userColor.toUpperCase());
      this.view.element.onclick = this.isTimeout ? null : this.handleBoardClick;
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
      // TODO: FEN转化为piecePositions，当前仅支持初始局面
      const pieces = ChessEngine.Utils.getInitialPieces();
      const piecePositions = ChessEngine.Utils.getInitialPiecePositions();
      this.game = new ChessEngine.Game(pieces, piecePositions, color.toUpperCase());
      this.view = new ChessEngine.View(this.$refs.boardElement, this.game, color.toUpperCase());
      this.view.element.onclick = this.isTimeout ? null : this.handleBoardClick;
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
