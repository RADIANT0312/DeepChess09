<script>
import SideBar from '@components/SideBar/index.vue';
import Board from '@components/Board/index.vue';

export default {
  name: 'Main',
  components: {
    SideBar,
    Board
  },
  data() {
  },
  methods: {
  }
}
</script>
<template>
  <div class="main">
    <SideBar />
    <div class="board-area" >
        <Board />
    </div>
  </div>
</template>

<style scoped>
.main {
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
    width: calc(100% - var(--side-bar-width) - 20px); /* 20px for padding */
    margin-right: calc(var(--side-bar-width) + 10px); /* 10px is the sidebar's right offset */
    padding-left: 10px;
}
</style>