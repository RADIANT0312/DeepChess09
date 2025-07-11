<script>
import TopBar from './topbar.vue';

export default {
  name: 'Main',
  components: {
    MainTopBar: TopBar
  },
  data() {
    return {
      imageLoaded: false,
    };
  },
  methods: {
    onImageLoad() {
      this.imageLoaded = true;
    }
  }
}
</script>

<template>
  <div class="main-container">
    <MainTopBar />

    <br />

    <!-- 只有图片加载完才显示 -->
    <div class="main-image" v-show="imageLoaded">
      <img
        src="/polygon-background1061-final.jpg"
        alt="Chess"
        @load="onImageLoad"
      />
    </div>

    <h1 class="chess-title">♟️ Practice your chess skills ♟️</h1>

    <div class="main-btn-group">
      <router-link to="/game">
        <el-button class="main-btn" type="primary" plain>Start Chess Game</el-button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  position: relative;
  height: 100vh;
}

/* 图片位置保持不变 */
.main-image {
  position: absolute;
  top: 50%;
  left: 25%;
  width: 650px; /* 固定宽度 */
  transform: translate(-50%, -50%);
}

.main-image img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
}

.main-image img:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 45px rgba(0,0,0,0.5);
}

.chess-title {
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.25);
  margin-top: 80px;
  margin-bottom: 40px;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1s ease-out forwards;
  color: white;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮组放到右半部分中间 */
.main-btn-group {
  position: absolute;
  top: 50%;
  right: 25%;
  transform: translate(50%, -50%);
  display: flex;
  gap: 24px;
  justify-content: center;
  /* 宽度可根据按钮大小调整 */
}

.main-btn-group a {
  text-decoration: none;
}

.main-btn {
  font-size: 1.5rem;
  padding: 16px 40px;
  border-radius: 12px;
  font-weight: bold;
  letter-spacing: 1px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  box-shadow: 0 2px 10px rgba(0,0,0,0.10);
  transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
}

.main-btn:hover {
  background: rgba(255,255,255,0.25);
  color: #333;
  box-shadow: 0 4px 15px rgba(0,0,0,0.18);
  transform: translateY(-2px);
}
</style>


