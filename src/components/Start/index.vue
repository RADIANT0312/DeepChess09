<template>
  <div class="start">
      <router-link to="/main" class="play-button">DEEP ♜ CHESS</router-link>
  </div>
</template>

<script>
export default {
  name: 'Start'
}
</script>

<style scoped>
.start {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.play-button {
  display: inline-block;
  font-size: 10rem;
  color: white;
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid white;
  border-radius: 50px;
  font-family: "Palatino Linotype", cursive;
  font-style: normal;
  /* font-style: italic; */
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  width: calc(100vw - 4rem);
  height: calc(100vh - 4rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}
</style>