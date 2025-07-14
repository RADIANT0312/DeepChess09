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
  data() {
    return {
      mode: 'game',
      gameId: null,
      lessonId: null,
      game: null,
      view: null,
      boardFEN: '',
      isLoading: false,
      color: 'white',
      difficulty: 'medium',
      selected: null, // 记录选中的棋子
      testMode: this.$route.query.test === '1' // URL参数test=1时启用本地测试
    };
  },
  async mounted() {
    this.mode = this.$route.query.mode || 'game';
    this.color = this.$route.query.color || 'white';
    this.difficulty = this.$route.query.difficulty || 'medium';

    if (this.testMode) {
      // 本地测试模式：只用本地引擎
      const pieces = ChessEngine.Utils.getInitialPieces();
      const piecePositions = ChessEngine.Utils.getInitialPiecePositions();
      this.game = new ChessEngine.Game(pieces, piecePositions, this.color.toUpperCase());
      this.view = new ChessEngine.View(this.$refs.boardElement, this.game, this.color.toUpperCase());
      this.view.element.onclick = this.handleLocalBoardClick;
      this.selected = null;
    } else {
      if (this.mode === 'game') {
        await this.createGameMatch();
      } else if (this.mode === 'teaching') {
        await this.startTeachingLesson();
      }
    }
  },
  methods: {
    async createGameMatch() {
      this.isLoading = true;
      try {
        const res = await game.createMatch({
          color: this.color,
          difficulty: this.difficulty
        });
        this.gameId = res.data.id;
        this.boardFEN = res.data.fen;
        this.initBoardFromFEN(this.boardFEN, this.color);
        if (res.data.turn && res.data.turn !== this.color) {
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
        this.boardFEN = lessonDetail.data.fen;
        this.initBoardFromFEN(this.boardFEN, this.color);
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
      this.view.element.onclick = this.handleBoardClick;
      this.selected = null;
    },
    // 棋盘点击事件（API模式）
    handleBoardClick(e) {
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
      const move = this.convertToMoveString(from, to);
      this.selected = null;
      if (this.mode === 'game') {
        this.handleUserMove(move);
      } else if (this.mode === 'teaching') {
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
        this.boardFEN = res.data.fen;
        this.initBoardFromFEN(this.boardFEN, this.color);
        if (res.data.turn && res.data.turn !== this.color) {
          await this.handleAIMove();
        }
      } catch (e) {
        alert('走子失败: ' + (e?.response?.data?.message || e.message));
      }
    },
    async handleAIMove() {
      try {
        const res = await game.getGameState(this.gameId);
        this.boardFEN = res.data.fen;
        this.initBoardFromFEN(this.boardFEN, this.color);
      } catch (e) {
        alert('AI走子失败: ' + (e?.response?.data?.message || e.message));
      }
    },
    async handleTeachingMove(move) {
      try {
        const res = await teaching.makeMove(this.lessonId, move);
        this.boardFEN = res.data.boardState;
        this.initBoardFromFEN(this.boardFEN, this.color);
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
