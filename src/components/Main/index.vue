<script>
import TopBar from './topbar.vue';

export default {
  name: 'Main',
  components: {
    MainTopBar: TopBar
  }
}
</script>

<template>
  <div>
    <MainTopBar>
    </MainTopBar>

    <br />
    <h1>Practice your chess skills.</h1>
    <div class="main-image">
      <img src="/public/polygon-background1061-final.jpg" alt="Chess" />
    </div>
    <div class="main-btn-group">
      <router-link to="/game">
        <el-button class="main-btn" type="primary" plain>Start Chess Game</el-button>
      </router-link>
      <router-link to="/profile">
        <el-button class="main-btn" type="primary" plain>Profile</el-button>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.main-btn-group {
  display: flex;
  gap: 24px;
  margin-top: 32px;
  justify-content: center;
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
h1 {
  /* 调整水平位置：居中 */
  text-align: center;

  /* 或者左对齐 */
  /* text-align: left; */

  /* 调整上下外边距 */
  margin-top: 100px;
  margin-bottom: 40px;

  /* 你还可以用 padding 调整内边距 */
  /* padding-left: 20px; */
}
.main-image img {
  width: 300px;
  height: auto;
  border-radius: 1px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

</style>

