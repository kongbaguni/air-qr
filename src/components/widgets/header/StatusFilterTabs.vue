<!--
  @컴포넌트: 상태 필터 탭
  @위치: 공통 컴포넌트
  @설명: 상태별 필터 탭 (건수 포함) - 오늘예정/진행중/완료
-->
<template>
  <div class="flex items-center gap-2 px-4 py-3 bg-white">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="[
        'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors',
        selectedId === tab.id
          ? 'border-gray-900 text-gray-900 bg-white'
          : 'border-gray-200 text-gray-500 bg-white'
      ]"
      @click="handleSelect(tab.id)"
    >
      {{ tab.label }}
      <span :class="['ml-1 font-bold', selectedId === tab.id ? 'text-gray-900' : 'text-gray-500']">
        {{ tab.count }}
      </span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'StatusFilterTabs',
  props: {
    tabs: {
      type: Array,
      default: function () {
        return []
      }
    },
    selectedId: {
      type: String,
      default: ''
    }
  },
  methods: {
    handleSelect: function (id) {
      this.$emit('select', id)
      this.$emit('update:selectedId', id)
    }
  }
}
</script>
