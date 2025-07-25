<template>
  <BaseTopBar @expansion-change="emitExpansionChange" :fixed="true">
    <template #content>
      <div class="user-avatar-wrapper" @click="togglePin">
        <router-link to="/profile">
          <img v-if="avatar" :src="avatar" alt="avatar" class="user-avatar" />
        </router-link>
      </div>
    </template>
    <template #content2>
      <div class="date-display-wrapper">
        <div class="date-display">{{ currentDate }}</div>
      </div>
    </template>
    <template #content3>
      <div class="controls">
        <button
          class="resign-button"
          @click.stop="handleResign"
          :disabled="isResigning"
          type="button"
        >
          <span v-if="isResigning">
            {{ mode === 'game' ? 'Resigning...' : 'Exiting...' }}
          </span>
          <span v-else>
            {{ getButtonText() }}
          </span>
        </button>
      </div>
    </template>
  </BaseTopBar>
</template>


<script>
import BaseTopBar from '../BaseTopBar/index.vue';
import { user } from '@/api';

export default {
  name: 'MainTopBar',
  components: {
    BaseTopBar
  },
  data() {
    return {
      currentDate: '',
      isPinned: false,
      avatar: '',
      isResigning: false,
      mode: 'game' // 'game' or 'start'
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
      this.avatar = await user.getAvatar();
    },
    handleResign() {
      this.isResigning = true;
      // 模拟退出或重新开始
      setTimeout(() => {
        this.isResigning = false;
        this.$router.push('/start'); // 重新开始
      }, 2000); // 模拟退出/重新开始需要的时间
    },
    getButtonText() {
      return this.mode === 'game' ? 'Back to Start Page' : 'Back to Start Page';
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