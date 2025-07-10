<script>
import TopBar from './topbar.vue';
import SideBar from '@components/SideBar/index.vue';
import Board from '@components/Board/index.vue';

export default {
  name: 'Main',
  components: {
    TopBar,
    SideBar,
    Board
  },
  data() {
    return {
      isTopBarExpanded: false,
      isSideBarExpanded: false
    }
  },
  methods: {
    handleTopBarExpansion(isExpanded) {
      this.isTopBarExpanded = isExpanded;
    },
    handleSideBarExpansion(isExpanded) {
      this.isSideBarExpanded = isExpanded;
    }
  }
}
</script>
<template>
  <div class="main">
    <TopBar @expansion-change="handleTopBarExpansion" />
    <SideBar @expansion-change="handleSideBarExpansion" />
    <div class="board-area" :style="{ 
      '--top-bar-height': isTopBarExpanded ? '50px' : '10px',
      '--side-bar-width': isSideBarExpanded ? '350px' : '0px'
    }">
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