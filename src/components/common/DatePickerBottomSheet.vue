<!--
  @컴포넌트: 날짜 선택 바텀시트
  @위치: 공통 컴포넌트
  @설명: 달력이 있는 날짜 선택 바텀시트 (재사용 가능)
-->
<template>
  <transition name="bottomsheet">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex flex-col justify-end"
      :class="containerPaddingClass"
      :style="{ zIndex: zIndex }"
      @click.self="handleOverlayClick"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleOverlayClick"></div>

      <div class="relative bg-white rounded-t-2xl shadow-2xl z-10 calendar-sheet">
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <div class="flex items-center justify-between px-6 py-3">
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            @click="prevMonth"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span class="text-lg font-bold text-gray-900">{{ calendarTitle }}</span>
          <button
            class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            @click="nextMonth"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-7 px-4 pb-2">
          <div
            v-for="(day, index) in weekDayLabels"
            :key="index"
            class="text-center text-xs font-medium py-2"
            :class="getWeekdayClass(index)"
          >
            {{ day }}
          </div>
        </div>

        <div class="calendar-grid px-4 pb-4">
          <button
            v-for="(dateObj, index) in calendarDays"
            :key="index"
            class="calendar-day flex flex-col items-center justify-center rounded-full relative transition-all"
            :class="getDateClasses(dateObj)"
            :disabled="!dateObj.currentMonth"
            @click="selectDate(dateObj)"
          >
            <span class="text-sm leading-none">{{ dateObj.date }}</span>
            <span
              v-if="dateObj.hasSchedule && dateObj.currentMonth"
              class="absolute schedule-dot w-1 h-1 rounded-full"
              :class="isSelectedDate(dateObj) ? 'bg-white' : 'bg-blue-500'"
            ></span>
          </button>
        </div>

        <div class="flex px-4 pb-6 pt-2">
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
            {{ $t('datePicker.changeDate') }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'DatePickerBottomSheet',
  props: {
    value: {
      type: Date,
      default: function () {
        return new Date()
      }
    },
    visible: {
      type: Boolean,
      default: false
    },
    zIndex: {
      type: Number,
      default: 50
    },
    forceBottomPaddingClass: {
      type: String,
      default: ''
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
      viewYear: 0,
      viewMonth: 0,
      tempSelectedDate: null
    }
  },
  computed: {
    ...mapGetters('app', ['menuVisible']),
    weekDayLabels: function () {
      return [
        this.$t('weekdays.sun').charAt(0),
        this.$t('weekdays.mon').charAt(0),
        this.$t('weekdays.tue').charAt(0),
        this.$t('weekdays.wed').charAt(0),
        this.$t('weekdays.thu').charAt(0),
        this.$t('weekdays.fri').charAt(0),
        this.$t('weekdays.sat').charAt(0)
      ]
    },
    calendarTitle: function () {
      return this.viewYear + '-' + String(this.viewMonth + 1).padStart(2, '0')
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
      if (this.forceBottomPaddingClass) {
        return this.forceBottomPaddingClass
      }
      return this.showFooter ? 'pb-16' : 'pb-0'
    },
    calendarDays: function () {
      var days = []
      var year = this.viewYear
      var month = this.viewMonth
      var firstDayOfMonth = new Date(year, month, 1).getDay()
      var lastDateOfMonth = new Date(year, month + 1, 0).getDate()
      var lastDateOfPrevMonth = new Date(year, month, 0).getDate()
      var scheduledDates = this.scheduledDates

      for (var i = firstDayOfMonth - 1; i >= 0; i--) {
        var prevDate = lastDateOfPrevMonth - i
        days.push({
          date: prevDate,
          fullDate: new Date(year, month - 1, prevDate),
          currentMonth: false,
          hasSchedule: false
        })
      }

      for (var d = 1; d <= lastDateOfMonth; d++) {
        var currentDate = new Date(year, month, d)
        var hasSchedule = scheduledDates.some(function (scheduledDate) {
          var sd = new Date(scheduledDate)
          return (
            sd.getFullYear() === currentDate.getFullYear() &&
            sd.getMonth() === currentDate.getMonth() &&
            sd.getDate() === currentDate.getDate()
          )
        })

        days.push({
          date: d,
          fullDate: currentDate,
          currentMonth: true,
          hasSchedule: hasSchedule
        })
      }

      var remainingDays = 42 - days.length
      for (var n = 1; n <= remainingDays; n++) {
        days.push({
          date: n,
          fullDate: new Date(year, month + 1, n),
          currentMonth: false,
          hasSchedule: false
        })
      }

      return days
    }
  },
  watch: {
    visible: function (newVal) {
      if (newVal) {
        this.initCalendar()
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
    initCalendar: function () {
      var date = this.value || new Date()
      this.viewYear = date.getFullYear()
      this.viewMonth = date.getMonth()
      this.tempSelectedDate = new Date(date)
    },
    prevMonth: function () {
      if (this.viewMonth === 0) {
        this.viewMonth = 11
        this.viewYear = this.viewYear - 1
      } else {
        this.viewMonth = this.viewMonth - 1
      }
    },
    nextMonth: function () {
      if (this.viewMonth === 11) {
        this.viewMonth = 0
        this.viewYear = this.viewYear + 1
      } else {
        this.viewMonth = this.viewMonth + 1
      }
    },
    selectDate: function (dateObj) {
      if (!dateObj.currentMonth) return
      this.tempSelectedDate = new Date(dateObj.fullDate)
    },
    isToday: function (dateObj) {
      var today = new Date()
      return (
        dateObj.fullDate.getFullYear() === today.getFullYear() &&
        dateObj.fullDate.getMonth() === today.getMonth() &&
        dateObj.fullDate.getDate() === today.getDate()
      )
    },
    isSelectedDate: function (dateObj) {
      if (!this.tempSelectedDate) return false
      return (
        dateObj.fullDate.getFullYear() === this.tempSelectedDate.getFullYear() &&
        dateObj.fullDate.getMonth() === this.tempSelectedDate.getMonth() &&
        dateObj.fullDate.getDate() === this.tempSelectedDate.getDate()
      )
    },
    getWeekdayClass: function (index) {
      if (index === 0) return 'text-red-400'
      if (index === 6) return 'text-blue-400'
      return 'text-gray-400'
    },
    getDateClasses: function (dateObj) {
      var classes = []

      if (!dateObj.currentMonth) {
        classes.push('text-gray-300 cursor-default')
        return classes.join(' ')
      }

      if (this.isSelectedDate(dateObj)) {
        classes.push('bg-blue-600 text-white font-semibold shadow-lg')
      } else if (this.isToday(dateObj)) {
        classes.push('text-blue-600 font-bold today-ring')
      } else {
        var dayOfWeek = dateObj.fullDate.getDay()
        if (dayOfWeek === 0) {
          classes.push('text-red-500')
        } else if (dayOfWeek === 6) {
          classes.push('text-blue-500')
        } else {
          classes.push('text-gray-900')
        }
        classes.push('hover:bg-gray-100 active:bg-gray-200')
      }

      return classes.join(' ')
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
      if (this.tempSelectedDate) {
        this.$emit('input', new Date(this.tempSelectedDate))
        this.$emit('confirm', new Date(this.tempSelectedDate))
      }
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
.calendar-sheet {
  max-height: 85vh;
  -webkit-animation: slideUp 0.3s ease-out;
  animation: slideUp 0.3s ease-out;
}

@-webkit-keyframes slideUp {
  from {
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
  }
  to {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
  }
  to {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
}

.bottomsheet-enter-active {
  -webkit-transition: opacity 0.3s ease-out;
  transition: opacity 0.3s ease-out;
}

.bottomsheet-enter-active .calendar-sheet {
  -webkit-animation: slideUp 0.3s ease-out;
  animation: slideUp 0.3s ease-out;
}

.bottomsheet-leave-active {
  -webkit-transition: opacity 0.2s ease-in;
  transition: opacity 0.2s ease-in;
}

.bottomsheet-leave-active .calendar-sheet {
  -webkit-animation: slideDown 0.2s ease-in forwards;
  animation: slideDown 0.2s ease-in forwards;
}

@-webkit-keyframes slideDown {
  from {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
  to {
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
  }
}

@keyframes slideDown {
  from {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
  to {
    -webkit-transform: translateY(100%);
    transform: translateY(100%);
  }
}

.bottomsheet-enter,
.bottomsheet-leave-to {
  opacity: 0;
}

.calendar-grid {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
}

.calendar-day {
  width: 14.28571%;
  height: 44px;
  position: relative;
  box-sizing: border-box;
}

.calendar-day > span:first-child {
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.schedule-dot {
  bottom: 6px;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}

.today-ring {
  -webkit-box-shadow: inset 0 0 0 2px #2563eb;
  box-shadow: inset 0 0 0 2px #2563eb;
}
</style>
