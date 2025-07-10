<template>
  <BaseTopBar @expansion-change="emitExpansionChange">
    <template #content>
      <div class="time-display">{{ currentTime }}</div>
    </template>
  </BaseTopBar>
</template>

<script>
import BaseTopBar from '../BaseTopBar/index.vue';

export default {
  name: 'TopBar',
  components: {
    BaseTopBar
  },
  data() {
    return {
      currentTime: '',
      timeInterval: null
    }
  },
  emits: ['expansion-change'],
  mounted() {
    this.startTimeUpdater();
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  methods: {
    startTimeUpdater() {
      this.updateTime();
      this.timeInterval = setInterval(() => {
        this.updateTime();
      }, 1000);
    },

    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    },

    emitExpansionChange(isExpanded) {
      this.$emit('expansion-change', isExpanded);
    }
  }
}
</script>

<style scoped>
.time-display {
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
</style>
