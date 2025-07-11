<template>
  <div id="app">
    <!-- 全局 topbar，根据当前路由显示不同的 topbar -->
    <component :is="currentTopbar" v-if="currentTopbar" />
    
    <!-- 页面内容区域，只有这部分参与动画 -->
    <transition name="page-content" mode="out-in">
      <router-view v-slot="{ Component, route }">
        <div class="page-content" :key="route.path">
          <component :is="Component" />
        </div>
      </router-view>
    </transition>
  </div>
</template>

<script>
import ProfileTopbar from './components/Profile/topbar.vue';
import MainTopbar from './components/Main/topbar.vue';
import GameTopbar from './components/Game/topbar.vue';

export default {
  name: 'App',
  components: {
    ProfileTopbar,
    MainTopbar,
    GameTopbar
  },
  computed: {
    // 根据当前路由确定要显示的 topbar
    currentTopbar() {
      const routeName = this.$route.name;
      switch (routeName) {
        case 'Profile':
          return 'ProfileTopbar';
        case 'Main':
          return 'MainTopbar';
        case 'Game':
          return 'GameTopbar';
        default:
          return null;
      }
    }
  }
}
</script>

<style>
#app {
  width: 100%;
  height: 100vh;
  background-color: #4f5442;
  font-family: "Palatin Linotype", cursive;
}

/* 页面内容动画 - 只对内容区域应用动画，topbar 保持静态 */
.page-content-enter-active,
.page-content-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-content-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-content-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 页面内容容器 */
.page-content {
  min-height: calc(100vh - 60px); /* 减去 topbar 的大概高度 */
}
</style>
