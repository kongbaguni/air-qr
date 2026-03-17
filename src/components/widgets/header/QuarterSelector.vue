<!--
  @컴포넌트: 분기 선택기
  @위치: 헤더 위젯
  @설명: 년도와 분기를 선택하는 컴포넌트
-->
<template>
  <div class="flex items-center justify-center px-4 py-2 bg-white">
    <button
      class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
      @click="prevQuarter"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </button>
    <span class="px-2 text-base font-bold text-gray-900 min-w-[120px] text-center">
      {{ formattedQuarter }}
    </span>
    <button
      class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
      @click="nextQuarter"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'QuarterSelector',
  props: {
    value: {
      type: Object,
      default: function () {
        var now = new Date()
        var quarter = Math.floor(now.getMonth() / 3) + 1
        return {
          year: now.getFullYear(),
          quarter: quarter
        }
      }
    }
  },
  computed: {
    formattedQuarter: function () {
      return this.value.year + '년 ' + this.value.quarter + '분기'
    }
  },
  methods: {
    prevQuarter: function () {
      var newValue = {
        year: this.value.year,
        quarter: this.value.quarter
      }
      if (newValue.quarter === 1) {
        newValue.quarter = 4
        newValue.year -= 1
      } else {
        newValue.quarter -= 1
      }
      this.$emit('input', newValue)
    },
    nextQuarter: function () {
      var newValue = {
        year: this.value.year,
        quarter: this.value.quarter
      }
      if (newValue.quarter === 4) {
        newValue.quarter = 1
        newValue.year += 1
      } else {
        newValue.quarter += 1
      }
      this.$emit('input', newValue)
    }
  }
}
</script>
