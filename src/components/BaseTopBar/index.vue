<template>
  <div class="top-bar" :class="{ 'expanded': isExpanded || isPinned || fixed }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="top-bar-content">
      <slot name="content"></slot>
      <div class="controls">
        <slot name="controls">
          <button class="pin-button" @click="togglePin" :class="{ 'pinned': isPinned }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path v-if="!isPinned" d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12M8.8,14L10,12.8V4H14V12.8L15.2,14H8.8Z"/>
              <path v-else d="M14,4V8.5L12,6.5L10,8.5V4H14M16,2H8V10L12,6L16,10V2M18,12.5V11H16.5V12.5H18M18,16V14.5H16.5V16H18M12,20V18.5H10.5V20H12M8,20V18.5H6.5V20H8M8,16V14.5H6.5V16H8M12,16V14.5H10.5V16H12M8,12.5V11H6.5V12.5H8M12,12.5V11H10.5V12.5H12"/>
            </svg>
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaseTopBar',
  props: {
    initialPinned: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isExpanded: false,
      isPinned: this.initialPinned,
    }
  },
  emits: ['expansion-change'],
  methods: {
    handleMouseEnter() {
      if (!this.isPinned && !this.fixed) {
        this.isExpanded = true;
        this.emitExpansionChange();
      }
    },

    handleMouseLeave() {
      if (!this.isPinned && !this.fixed) {
        this.isExpanded = false;
        this.emitExpansionChange();
      }
    },

    togglePin() {
      if (this.initialPinned) return;
      this.isPinned = !this.isPinned;
      if (this.isPinned) {
        this.isExpanded = true;
      }
      this.emitExpansionChange();
    },

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
  height: 10px;
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

.top-bar.expanded {
  height: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.top-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 100%;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.top-bar.expanded .top-bar-content {
  opacity: 1;
  transform: translateY(0);
}

.pin-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  padding: 8px 8px;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.pin-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.pin-button.pinned {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.pin-button.pinned:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
}

.pin-button svg {
  width: 14px;
  height: 14px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}
</style>
