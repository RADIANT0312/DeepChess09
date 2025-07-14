<script>
export default {
  name: 'Main',
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
    <div class="vs-button" v-show="imageLoaded">
      <router-link :to="{ path: '/choose-options', query: { mode: 'game' } }">
        <img
          src="/polygon-ai-game.jpg"
          alt="Chess"
          @load="onImageLoad"
        />
      </router-link>
    </div>
    <h1 class="chess-title">Practice your chess skills!</h1>

    <div class="teaching-button" v-show="imageLoaded">
      <router-link :to="{ path: '/choose-options', query: { mode: 'teaching' } }">
        <img
          src="/polygon-ai-learning.jpg"
          alt="Chess"
          @load="onImageLoad"
        />
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
.vs-button {
  position: absolute;
  top: 50%;
  left: 25%;
  width: 600px; /* 固定宽度 */
  transform: translate(-50%, -50%);
}

.vs-button img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
}

.vs-button img:hover {
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

.teaching-button {
  position: absolute;
  top: 50%;
  left: 75%;
  width: 600px; /* 固定宽度 */
  transform: translate(-50%, -50%);
}

.teaching-button img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94);
}

.teaching-button img:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 45px rgba(0,0,0,0.5);
}

</style>


