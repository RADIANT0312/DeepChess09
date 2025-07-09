<script>
import TopBar from '@components/TopBar/index.vue';
import Board from '@components/Board/index.vue';

export default {
  name: 'Main',
  components: {
    TopBar,
    Board
  },
  data() {
    return {
      isBarExpanded: false
    }
  },
  methods: {
    handleBarExpansion(isExpanded) {
      this.isBarExpanded = isExpanded;
    }
  }
}
</script>
<template>
  <div class="main">
    <TopBar @expansion-change="handleBarExpansion" />
    <div class="board-area" :style="{ height: `calc(100vh - ${isBarExpanded ? '56px' : '6px'})`, marginTop: isBarExpanded ? '56px' : '6px' }">
        <Board />
    </div>
  </div>
</template>

<style scoped>
.main {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
.board-area {
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>