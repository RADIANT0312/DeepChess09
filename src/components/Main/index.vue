<script>
import TopBar from '../TopBar/index.vue';

export default {
  name: 'Main',
  components: {
    TopBar
  }
}
</script>

<template>
  <div>
    <TopBar>
      <template #center>
        <el-button
          class="topbar-white-btn"
          plain
          @click="$router.push('/start')"
        >
          Back to Start Page
        </el-button>
      </template>
    </TopBar>
    <h1>Main page of the application.</h1>
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
.topbar-white-btn {
  background: rgba(255,255,255,0.15) !important;
  color: #fff !important;
  border: 1px solid rgba(255,255,255,0.3) !important;
  border-radius: 8px !important;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  transition: all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);
  padding: 10px 24px;
  font-size: 16px;
  backdrop-filter: blur(8px);
}
.topbar-white-btn:hover {
  background: rgba(255,255,255,0.25) !important;
  color: #333 !important;
  box-shadow: 0 4px 15px rgba(0,0,0,0.25);
  transform: translateY(-1px);
}
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
</style>

