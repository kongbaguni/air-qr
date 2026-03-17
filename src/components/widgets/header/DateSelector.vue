<!--
  @컴포넌트: 날짜 선택기
  @위치: 헤더 위젯
  @설명: 이전/다음 날짜 네비게이션 및 날짜 피커
-->
<template>
  <div class="flex items-center justify-center py-3 bg-white">
    <button
      class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
      @click="prevDate"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
    <button
      class="mx-2 px-3 py-1.5 text-lg font-bold text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
      @click="openDatePicker"
    >
      {{ formattedDate }}
    </button>
    <button
      class="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-full transition-colors"
      @click="nextDate"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>

    <DatePickerBottomSheet
      :value="value"
      :visible.sync="showDatePicker"
      :scheduled-dates="scheduledDates"
      @input="handleDateSelect"
      @close="showDatePicker = false"
    />
  </div>
</template>

<script>
import DatePickerBottomSheet from '@/components/common/DatePickerBottomSheet.vue'

export default {
  name: 'DateSelector',
  components: {
    DatePickerBottomSheet
  },
  props: {
    value: {
      type: Date,
      default: function () {
        return new Date()
      }
    },
    scheduledDates: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      showDatePicker: false
    }
  },
  computed: {
    formattedDate: function () {
      var days = ['일', '월', '화', '수', '목', '금', '토']
      var year = this.value.getFullYear()
      var month = String(this.value.getMonth() + 1).padStart(2, '0')
      var date = String(this.value.getDate()).padStart(2, '0')
      var day = days[this.value.getDay()]
      return year + '.' + month + '.' + date + ' ' + day
    }
  },
  methods: {
    prevDate: function () {
      var newDate = new Date(this.value)
      newDate.setDate(newDate.getDate() - 1)
      this.$emit('input', newDate)
    },
    nextDate: function () {
      var newDate = new Date(this.value)
      newDate.setDate(newDate.getDate() + 1)
      this.$emit('input', newDate)
    },
    openDatePicker: function () {
      this.showDatePicker = true
    },
    handleDateSelect: function (date) {
      this.$emit('input', date)
    }
  }
}
</script>
