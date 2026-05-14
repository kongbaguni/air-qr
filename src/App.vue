<template>
  <div id="app-shell">
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
@import './assets/styles/main.css';

#app-shell {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: #f4f4f5;
}

.app-main {
  height: 100%;
}
</style>
