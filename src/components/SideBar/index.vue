<template>
  <div 
    class="side-bar" 
    :class="{ 'expanded': isExpanded, 'dragging': isDragging }" 
    :style="sidebarStyle"
    @mousedown.left="handleMouseDown"
    @contextmenu.prevent="expandSidebar"
  >
    <img src="/sidebar-logo.svg" alt="DeepChess Logo" class="collapsed-logo" />
    <div class="side-bar-content">
      <div class="header">
        <div class="logo">
          <img src="/sidebar-logo.svg" alt="DeepChess Logo" width="50" height="50" />
        </div>
        <span class="brand-name" v-show="isExpanded">DeepChess</span>
      </div>

      <div class="nav-items">
        <ul>
          <li v-for="item in navItems" :key="item.name" :class="{ 'active': item.active }">
            <a :href="item.link">
              <div class="nav-icon" v-html="item.icon"></div>
              <span class="nav-text" v-show="isExpanded">{{ item.name }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="footer">
        <div class="time-display" v-show="isExpanded">{{ currentTime }}</div>
        <button class="collapse-button" @click.stop="collapseSidebar" v-show="isExpanded">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  data() {
    return {
      isExpanded: false,
      currentTime: '',
      timeInterval: null,
      isDragging: false,
      position: { top: 10, right: 5 }, // Initial position in percentage and pixels
      dragStartOffset: { x: 0, y: 0 },
      navItems: [
        { name: 'Dashboard', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>', link: '#', active: true },
        { name: 'New Game', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14m-7-7h14"></path></svg>', link: '#', active: false },
        { name: 'Profile', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', link: '#', active: false },
        { name: 'Settings', icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>', link: '#', active: false },
      ]
    }
  },
  emits: ['expansion-change'],
  computed: {
    sidebarStyle() {
      if (this.isExpanded) {
        return {
          // Expanded styles remain fixed
          top: '50%',
          right: '15px',
          transform: 'translateY(-50%)'
        };
      }
      // Collapsed and draggable styles
      return {
        top: `${this.position.top}px`,
        right: `${this.position.right}px`,
        transform: 'translateY(0)' // Use a simpler transform when dragging
      };
    }
  },
  mounted() {
    this.startTimeUpdater();
    // Set initial position based on viewport
    this.position.top = window.innerHeight * 0.1;
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    window.removeEventListener('mousemove', this.onDrag);
    window.removeEventListener('mouseup', this.stopDrag);
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

    handleMouseDown(event) {
      // Only allow dragging when collapsed
      if (this.isExpanded) return;
      this.startDrag(event);
    },

    startDrag(event) {
      this.isDragging = true;
      
      const rect = this.$el.getBoundingClientRect();
      this.dragStartOffset.x = event.clientX - rect.left;
      this.dragStartOffset.y = event.clientY - rect.top;

      window.addEventListener('mousemove', this.onDrag);
      window.addEventListener('mouseup', this.stopDrag);
    },

    onDrag(event) {
      if (!this.isDragging) return;
      
      // Prevent text selection while dragging
      event.preventDefault();

      this.position.top = event.clientY - this.dragStartOffset.y;
      this.position.right = window.innerWidth - (event.clientX - this.dragStartOffset.x + this.$el.offsetWidth);
    },

    stopDrag() {
      // Use a timeout to distinguish between a click and a drag
      setTimeout(() => {
        this.isDragging = false;
      }, 0);
      window.removeEventListener('mousemove', this.onDrag);
      window.removeEventListener('mouseup', this.stopDrag);
    },

    expandSidebar() {
      if (!this.isExpanded && !this.isDragging) {
        this.isExpanded = true;
        this.emitExpansionChange();
      }
    },

    collapseSidebar() {
      if (this.isExpanded) {
        this.isExpanded = false;
        this.emitExpansionChange();
      }
    },

    emitExpansionChange() {
      this.$emit('expansion-change', this.isExpanded);
    }
  }
}
</script>

<style scoped>
.sidebar-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: auto;
  transition: opacity 0.3s ease-in-out;
}

.side-bar.expanded .sidebar-logo {
  opacity: 0;
  pointer-events: none;
}

.side-bar {
  position: fixed;
  /* top and right are now handled by :style */
  height: 6vh;
  width: 6vh;
  background: #364b3f;
  z-index: 1000;
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.side-bar:not(.expanded):not(.dragging) {
  cursor: grab;
}

.side-bar.dragging {
  cursor: grabbing;
  transition: none; /* Disable transition while dragging for responsiveness */
}

.side-bar:not(.expanded):not(.dragging):hover {
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}

.side-bar.expanded {
  height: 90vh;
  width: 350px;
  cursor: default; /* Change cursor back when expanded */
}

.collapsed-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  transition: opacity 0.2s ease-out;
  opacity: 1;
}

.side-bar.expanded .collapsed-logo {
  opacity: 0;
}

.side-bar-content {
  display: flex;
  flex-direction: column;
  height: 95%;
  width: 350px;
  padding: 20px 0;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.side-bar.expanded .side-bar-content {
  opacity: 1;
  transform: translateX(0);
}

.header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  margin-bottom: 30px;
  min-height: 40px;
}

.logo {
  margin-right: 16px;
  color: #fff;
  min-width: 32px;
}

.brand-name {
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
}

.nav-items {
  flex-grow: 1;
}

.nav-items ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-items li a {
  display: flex;
  align-items: center;
  padding: 15px 28px;
  color: #e0e0e0;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
  white-space: nowrap;
}

.nav-items li a:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}

.nav-items li.active a {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.5), rgba(118, 75, 162, 0.5));
  color: #fff;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.2);
}

.nav-items li.active a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  bottom: 25%;
  width: 4px;
  background: #fff;
  border-radius: 0 4px 4px 0;
}

.nav-icon {
  margin-right: 20px;
  display: flex;
  align-items: center;
  min-width: 24px;
}

.nav-text {
  font-size: 16px;
}

.footer {
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
}

.time-display {
  color: #e0e0e0;
  font-size: 14px;
}

.collapse-button {
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.collapse-button:hover {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.collapse-button svg {
  width: 24px;
  height: 24px;
}
</style>
