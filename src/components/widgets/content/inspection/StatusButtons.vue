<!--
  @컴포넌트: 상태 버튼
  @위치: 위젯 컴포넌트
  @설명: 점검 상태 선택 버튼 그룹 (이상없음/조치필요/미해당)
-->
<template>
  <div class="flex items-center justify-center mx-auto space-x-5" style="width: 320px">
    <button
      :class="getButtonClass('normal')"
      style="width: 90px; min-width: 90px; max-width: 90px; box-sizing: border-box"
      @click="$emit('select', 'normal')"
    >
      <svg class="w-3.5 h-3.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      {{ $t('statusButtons.normal') }}
    </button>
    <button
      :class="getButtonClass('action')"
      style="width: 90px; min-width: 90px; max-width: 90px; box-sizing: border-box"
      @click="$emit('select', 'action')"
    >
      <svg class="w-3.5 h-3.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      {{ $t('statusButtons.action') }}
    </button>
    <button
      :class="getButtonClass('na')"
      style="width: 90px; min-width: 90px; max-width: 90px; box-sizing: border-box"
      @click="$emit('select', 'na')"
    >
      <svg class="w-3.5 h-3.5 mr-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
      {{ $t('statusButtons.na') }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'StatusButtons',
  props: {
    selected: {
      type: String,
      default: ''
    }
  },
  methods: {
    getButtonClass: function (type) {
      var base =
        'flex items-center justify-center flex-shrink-0 py-1 rounded-lg text-[10px] font-medium tracking-tight whitespace-nowrap transition-all border-2'
      if (type === 'normal') {
        if (this.selected === 'normal') {
          return base + ' bg-green-50 text-green-800 border-green-500'
        }
        return base + ' bg-white text-green-700 border-green-200 hover:border-green-300'
      }
      if (type === 'action') {
        if (this.selected === 'action') {
          return base + ' bg-red-50 text-red-800 border-red-500'
        }
        return base + ' bg-white text-red-700 border-red-200 hover:border-red-300'
      }
      if (type === 'na') {
        if (this.selected === 'na') {
          return base + ' bg-gray-100 text-gray-800 border-gray-500'
        }
        return base + ' bg-white text-gray-600 border-gray-200 hover:border-gray-300'
      }
      return base
    }
  }
}
</script>
