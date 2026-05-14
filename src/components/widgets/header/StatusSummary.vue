<!--
  @컴포넌트: 상태 요약 탭
  @위치: 공통 컴포넌트
  @설명: 오늘예정/진행중/완료 탭 형태 - 클릭 시 선택 상태 변경
-->
<template>
  <div class="flex items-center justify-center bg-gray-50 py-3 px-4">
    <div class="flex items-center gap-2">
      <button
        :class="[
          'px-5 py-2 text-sm font-semibold rounded-full transition-all',
          selectedTab === 'scheduled'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-transparent text-gray-500 hover:bg-gray-100'
        ]"
        @click="$emit('select', 'scheduled')"
      >
        {{ $t('common.todayScheduled') }} <span class="font-bold">{{ scheduled }}</span>
      </button>
      <!-- <button
        :class="[
          'px-5 py-2 text-sm font-semibold rounded-full transition-all',
          selectedTab === 'inProgress'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-transparent text-gray-500 hover:bg-gray-100'
        ]"
        @click="$emit('select', 'inProgress')"
      >
        {{ $t('common.inProgress') }} <span class="font-bold">{{ inProgress }}</span>
      </button> -->
      <button
        :class="[
          'px-5 py-2 text-sm font-semibold rounded-full transition-all',
          selectedTab === 'completed'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'bg-transparent text-gray-500 hover:bg-gray-100'
        ]"
        @click="$emit('select', 'completed')"
      >
        {{ $t('common.complete') }} <span class="font-bold">{{ completed }}</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatusSummary',
  props: {
    scheduled: {
      type: Number,
      default: 0
    },
    inProgress: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    selectedTab: {
      type: String,
      default: 'scheduled' // 'scheduled' | 'inProgress' | 'completed'
    }
  }
}
</script>
