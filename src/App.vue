<template>
  <div id="app">
    <!-- 全局 topbar，根据当前路由显示不同的 topbar -->
    <component :is="currentTopbar" v-if="currentTopbar" />

    <!-- 页面内容区域 -->
    <router-view v-slot="{ Component, route }">
      <transition name="page-content" mode="out-in">
        <!-- 
          已修改：
          1. 移除了外层的 div。
          2. 将 :key 和 class 直接应用在 <component> 上。
          这使得 Transition 直接作用于要切换的组件，结构更清晰，避免了竞态条件。
        -->
        <component :is="Component" :key="route.path" class="page-content" />
      </transition>
    </router-view>
  </div>
</template>

<script>
import ProfileTopbar from './components/Profile/topbar.vue';
import MainTopbar from './components/Main/topbar.vue';
import GameTopbar from './components/Game/topbar.vue';
import SelectModeTopBar from './components/SelectMode/topbar.vue';

export default {
  name: 'App',
  components: {
    ProfileTopbar,
    MainTopbar,
    GameTopbar,
    SelectModeTopBar
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
        case 'SelectMode':
          return 'SelectModeTopBar';
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
  font-family: "Palatin Linotype";
  /* 添加一个 overflow: hidden 可以防止在过渡期间出现滚动条 */
  overflow: hidden;
}

/* 页面内容动画 */
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

/* 页面内容容器样式 */
.page-content {
  min-height: calc(100vh - 60px); 
  /* 减去 topbar 的大概高度 */
  /* 确保内容不会因为 position:absolute 的动画而塌陷 */
  box-sizing: border-box;
}
</style>
