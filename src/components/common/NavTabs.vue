<template>
  <nav class="flex bg-white border-b border-gray-200">
    <router-link
      v-for="tab in tabs"
      :key="tab.path"
      :to="tab.path"
      class="flex-1 py-3 text-center text-sm font-medium"
      :class="isActive(tab.path) ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
    >
      {{ tab.label }}
    </router-link>
  </nav>
</template>

<script>
export default {
  name: 'NavTabs',
  props: {
    tabs: { type: Array, required: true }
  },
  methods: {
    isActive(path) {
      return this.$route.path === path
    }
  }
}
</script>
