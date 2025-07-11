<template>
  <BaseTopBar @expansion-change="emitExpansionChange" :fixed="true">
    <template #content>
      <div class="date-display">{{ currentDate }}</div>
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
    }
  },
  emits: ['expansion-change'],
  mounted() {
    this.updateDate();
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
    }
  }
}
</script>

<style scoped>
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
</style>