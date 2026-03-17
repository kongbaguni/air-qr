<template>
  <div class="px-4 py-3 bg-white border-b border-gray-200">
    <h1 class="text-lg font-bold text-gray-900">{{ title }}</h1>
  </div>
</template>

<script>
export default {
  name: 'PageTitle',
  props: {
    title: { type: String, required: true }
  }
}
</script>
