<!--
  @컴포넌트: 시간 선택 바텀시트
  @위치: 공통 컴포넌트
  @설명: 휠 형태의 시간 선택 바텀시트
-->
<template>
  <transition name="bottomsheet">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col justify-end"
      :class="containerPaddingClass"
      @click.self="handleOverlayClick"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleOverlayClick"></div>

      <div class="relative bg-white rounded-t-2xl shadow-2xl z-10 time-sheet">
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div class="flex items-center justify-between px-6 py-3">
          <h2 class="text-lg font-bold text-gray-900">{{ resolvedTitle }}</h2>
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            @click="handleCancel"
          >
            <svg
              class="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div class="px-6 pb-4">
          <div class="time-picker">
            <div class="time-column">
              <button
                v-for="hour in hours"
                :key="'h-' + hour"
                class="time-item"
                :class="{ selected: hour === tempHour }"
                @click="selectHour(hour)"
              >
                {{ formatNumber(hour) }}
              </button>
            </div>
            <div class="time-separator">:</div>
            <div class="time-column">
              <button
                v-for="minute in minutes"
                :key="'m-' + minute"
                class="time-item"
                :class="{ selected: minute === tempMinute }"
                @click="selectMinute(minute)"
              >
                {{ formatNumber(minute) }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex px-4 pb-6 pt-2 border-t border-gray-100">
          <button
            class="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 transition-colors mr-2"
            @click="handleCancel"
          >
            {{ $t('datePicker.close') }}
          </button>
          <button
            class="flex-1 py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors ml-2"
            @click="handleConfirm"
          >
            {{ $t('common.confirm') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'TimePickerBottomSheet',
  props: {
    value: {
      type: String,
      default: '00:00'
    },
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    minuteStep: {
      type: Number,
      default: 1
    }
  },
  data: function () {
    return {
      tempHour: 0,
      tempMinute: 0
    }
  },
  computed: {
    ...mapGetters('app', ['menuVisible']),
    hours: function () {
      return Array.from({ length: 24 }, function (_, i) {
        return i
      })
    },
    minutes: function () {
      var list = []
      for (var i = 0; i < 60; i += this.minuteStep) {
        list.push(i)
      }
      return list
    },
    isLoginPage: function () {
      return this.$route && this.$route.path === '/login'
    },
    showFooter: function () {
      return (
        !this.isLoginPage && !this.menuVisible && !(this.$route.meta && this.$route.meta.hideFooter)
      )
    },
    containerPaddingClass: function () {
      return this.showFooter ? 'pb-16' : 'pb-0'
    },
    resolvedTitle: function () {
      return this.title || this.$t('timePicker.title')
    }
  },
  watch: {
    visible: function (newVal) {
      if (newVal) {
        this.initTime()
        this.lockBodyScroll()
      } else {
        this.unlockBodyScroll()
      }
    }
  },
  beforeDestroy: function () {
    this.unlockBodyScroll()
  },
  methods: {
    initTime: function () {
      var parts = (this.value || '00:00').split(':')
      var hour = parseInt(parts[0], 10)
      var minute = parseInt(parts[1], 10)
      this.tempHour = isNaN(hour) ? 0 : hour
      this.tempMinute = isNaN(minute) ? 0 : minute
    },
    formatNumber: function (value) {
      return String(value).padStart(2, '0')
    },
    selectHour: function (hour) {
      this.tempHour = hour
    },
    selectMinute: function (minute) {
      this.tempMinute = minute
    },
    handleOverlayClick: function () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleCancel: function () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleConfirm: function () {
      var value = this.formatNumber(this.tempHour) + ':' + this.formatNumber(this.tempMinute)
      this.$emit('input', value)
      this.$emit('confirm', value)
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    lockBodyScroll: function () {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    },
    unlockBodyScroll: function () {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }
}
</script>

<style scoped>
.time-sheet {
  max-height: 70vh;
}

.time-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.time-column {
  width: 90px;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px 0;
  background: #fff;
}

.time-item {
  width: 100%;
  padding: 10px 0;
  text-align: center;
  font-size: 16px;
  color: #6b7280;
}

.time-item.selected {
  color: #111827;
  font-weight: 700;
  background: #f3f4f6;
}

.time-separator {
  font-size: 18px;
  font-weight: 700;
  color: #6b7280;
}
</style>
