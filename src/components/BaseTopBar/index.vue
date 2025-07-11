<template>
  <div class="top-bar" :class="{ 'expanded': fixed }">
    <div class="top-bar-content">
      <slot name="content"></slot>
      <slot name="content2"></slot>
      <slot name="content3"></slot>
      <slot name="content4"></slot>
      <slot name="content5"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseTopBar',
  props: {
    fixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  },
  emits: ['expansion-change'],
  methods: {

    emitExpansionChange() {
      this.$emit('expansion-change', this.isExpanded || this.isPinned);
    }
  }
}
</script>

<style scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #364b3f;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
}

.top-bar:hover {
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 100%;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

</style>
