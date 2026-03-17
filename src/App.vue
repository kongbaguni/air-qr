<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <NavTabs :tabs="navTabs" />
    <main class="pb-8">
      <router-view />
    </main>
  </div>
</template>

<script>
import NavTabs from '@/components/common/NavTabs.vue'

export default {
  name: 'App',
  components: { NavTabs },
  data() {
    return {
      navTabs: [
        { path: '/shadow-download', label: '데이터' },
        { path: '/shadow-routine-check', label: '평상점검' },
        { path: '/shadow-performance-check', label: '성능점검' },
        { path: '/shadow-performance-verification', label: '성능확인' }
      ]
    }
  }
}
</script>

<style>
@import './assets/styles/main.css';
</style>
