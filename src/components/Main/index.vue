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

    <h1 class="chess-title">Practice your chess skills!</h1>

    <div class="main-btn-group">
      <router-link to="/game">
        <el-button class="main-btn" type="primary" plain>
          <span class="btn-content">
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 4C2 3.44772 2.44772 3 3 3H7C7.55228 3 8 3.44772 8 4V5.5C8 5.77614 8.22386 6 8.5 6C8.77614 6 9 5.77614 9 5.5V4C9 3.44772 9.44772 3 10 3H14C14.5523 3 15 3.44772 15 4V5.5C15 5.77614 15.2239 6 15.5 6C15.7761 6 16 5.77614 16 5.5V4C16 3.44772 16.4477 3 17 3H21C21.5523 3 22 3.44772 22 4V7C22 8.86384 20.7252 10.4299 19 10.874V19H20C20.4304 19 20.8126 19.2754 20.9487 19.6838L21.7208 22H22C22.5523 22 23 22.4477 23 23C23 23.5523 22.5523 24 22 24H21H3H2C1.44772 24 1 23.5523 1 23C1 22.4477 1.44772 22 2 22H2.27924L3.05132 19.6838C3.18743 19.2754 3.56957 19 4 19H5V10.874C3.27477 10.4299 2 8.86384 2 7V4ZM7 11V19H17V11H7ZM4.38743 22H19.6126L19.2792 21H18H6H4.72076L4.38743 22ZM4 5V7C4 8.10457 4.89543 9 6 9H18C19.1046 9 20 8.10457 20 7V5H18V5.5C18 6.88071 16.8807 8 15.5 8C14.1193 8 13 6.88071 13 5.5V5H11V5.5C11 6.88071 9.88071 8 8.5 8C7.11929 8 6 6.88071 6 5.5V5H4Z"/>
            </svg>
            Start Chess Game
          </span>
        </el-button>
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
  align-items: center;
  display: flex;
}

.main-btn:hover {
  background: rgba(255,255,255,0.25);
  color: #333;
  box-shadow: 0 4px 15px rgba(0,0,0,0.18);
  transform: translateY(-2px);
}
.btn-icon {
  color: inherit;
  fill: currentColor;
  width: 30px;
  height: 30px;
  margin-right: 20px;
  display: block;
}
.btn-content {
  display: flex;
  align-items: center; /* 垂直居中图标和文字 */
  gap: 12px;
}
</style>


