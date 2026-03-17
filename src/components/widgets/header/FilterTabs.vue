<!--
  @컴포넌트: 필터 탭
  @위치: 공통 컴포넌트
  @설명: 가로 스크롤 필터 탭 버튼 그룹 (재사용 가능)
-->
<template>
  <div class="bg-white border-b border-gray-100">
    <div class="overflow-x-auto scrollbar-hide">
      <div class="flex px-4 py-2 space-x-2 min-w-max">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="[
            'px-4 py-2 text-sm rounded-full whitespace-nowrap transition-colors',
            selectedId === tab.id
              ? tab.id === 'all'
                ? 'bg-gray-900 text-white font-medium'
                : 'bg-blue-600 text-white font-medium'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          ]"
          @click="$emit('select', tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterTabs',
  props: {
    tabs: {
      type: Array,
      default: function () {
        return []
      }
    },
    selectedId: {
      type: String,
      default: 'all'
    }
  }
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
