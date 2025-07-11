<template>
  <BaseTopBar @expansion-change="emitExpansionChange" :fixed="true">
    <template #user-avatar>
      <div class="user-avatar-wrapper" @click="togglePin">
        <router-link to="/profile">
          <img v-if="avatar" :src="avatar" alt="avatar" class="user-avatar" />
        </router-link>
      </div>
    </template>
    <template #content>
      <div class="date-display-wrapper">
        <div class="date-display">{{ currentDate }}</div>
      </div>
    </template>
    <template #controls>
      <div class="controls">
        <el-button
          class="topbar-white-btn"
          plain
          @click="$router.push('/start')"
        >
          Back to Start Page
        </el-button>
      </div>
    </template>
  </BaseTopBar>
</template>


<script>
import BaseTopBar from '../BaseTopBar/index.vue';

export default {
  name: 'MainTopBar',
  components: {
    BaseTopBar
  },
  data() {
    return {
      currentDate: '',
      isPinned: false,
      avatar: ''
    }
  },
  emits: ['expansion-change'],
  mounted() {
    this.updateDate();
    this.fetchAvatar();
  },
  methods: {
    updateDate() {
      const now = new Date();
      this.currentDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    emitExpansionChange(isExpanded) {
      this.$emit('expansion-change', isExpanded);
    },
    togglePin() {
      this.isPinned = !this.isPinned;
    },
     goBack() {
      this.$router.push('/'); // 或者你想跳转的起始页面路径
    },
    async fetchAvatar() {
      const fallback =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABu0lEQVR4nO3ZsU3DMBBF0Xu5F9+gTk2DRKfk4iK2pXRE9K4GGLSVJvYrZkqCGxZkz4XOA7+h/ewrhEEIAAAAAAAAAAAAgPqjwVupP9edW+o/n/2l10fAvz/Lue4HGzXlzMq/Wb2oAgw6kJgFEl8LYlWLUyRxyK5AsUPJlCSHcyIUtjlCK3GRMhjHJZJ8vHAYJMOxXYp1QllXaiCShyw5Cah7EpBSqxKl2pTwq9DxCrvtdMFuShQO9hwJUisAqPVaxCajP8DZfWxgr9kUyzqMZ8G6tlmQ0NgG51Ktp9XqPT+vKyO8E0JWEo0csMo5Cah6GpBShxgrChkpJcL1CklQk5TPwZ3i7EFL3aKLfZa5nO+Lu0rc6AYzJhJoPN2whJUikBq8KnC4xCyS1Qk5QPAMpCLwwAAAB4/M5dFv+X+HZp3weAghvkzOKiR91BAAAAAAAAAAAAQHi7/4Brb5N0G8B+bwAAAABJRU5ErkJggg==';
      try {
        const res = await fetch('/api/user/avatar', {
          headers: {
            Authorization: 'Bearer ' + localStorage.getItem('token')
          }
        });
        if (res.ok) {
          const data = await res.json();
          this.avatar = data.avatar.startsWith('data:image')
            ? data.avatar
            : 'data:image/png;base64,' + data.avatar;
        } else {
          this.avatar = fallback;
        }
      } catch (err) {
        console.error('头像加载失败：', err);
        this.avatar = fallback;
      }
    }
  }
}
</script>

<style scoped>
.date-display-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none; /* 保证不挡点击 */
}
.date-display {
  color: #ffffff;
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  pointer-events: none;
}
.controls {
  display: flex;
  align-items: center;
  gap: 10px;
}
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
.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
}
a > .user-avatar {
  display: block;
}
.top-bar.expanded {
  height: 60px;
}
</style>