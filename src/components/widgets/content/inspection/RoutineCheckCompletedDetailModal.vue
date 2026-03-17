<template>
  <transition name="modal-fade">
    <div v-if="visible" class="fixed inset-0 bg-gray-100 overflow-y-auto" style="z-index: 60;">
      <header class="sticky top-0 left-0 right-0 z-10 h-14 bg-white border-b border-gray-200">
        <div class="relative flex items-center justify-center h-full px-4">
          <button
            class="absolute left-3 top-3 w-8 h-8 rounded-full  text-gray-700 flex items-center justify-center"
            @click="handleClose"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
        </div>
      </header>

      <div class="px-3 py-3 space-y-3">
        <section class="bg-white rounded-md border border-gray-200">
          <div class="px-3 py-3">
            <h3 class="text-sm font-bold text-gray-900">{{ checklistTitle }}</h3>
          </div>
          <ul class="divide-y divide-gray-200">
            <li
              v-for="(item, index) in completedChecklist"
              :key="index"
              class="px-3 py-2 flex items-center justify-between"
            >
              <span class="text-sm text-gray-800 pr-3">{{ item.name }}</span>
              <span
                :class="getStatusBadgeClass(item)"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700"
              >
                {{ item.statusLabel || '이상없음' }}
              </span>
            </li>
          </ul>
        </section>

        <section class="bg-white rounded-md border border-gray-200 px-3 py-2">
          <p class="text-xs text-gray-500 mb-1">점검자</p>
          <div class="text-sm text-gray-700">
            {{ detail.inspectors || '-' }}
          </div>
        </section>

        <section class="bg-white rounded-md border border-gray-200 px-3 py-2">
          <p class="text-xs text-gray-500 mb-1">점검날짜</p>
          <div class="text-sm text-gray-700">
            {{ detail.inspectionDate || '-' }}
          </div>
        </section>

        <section class="grid grid-cols-2 gap-2">
          <div class="bg-white rounded-md border border-gray-200 px-3 py-2">
            <p class="text-xs text-gray-500 mb-1">점검시작시간</p>
            <div class="text-sm text-gray-700">{{ detail.startTime || '-' }}</div>
          </div>
          <div class="bg-white rounded-md border border-gray-200 px-3 py-2">
            <p class="text-xs text-gray-500 mb-1">점검종료시간</p>
            <div class="text-sm text-gray-700">{{ detail.endTime || '-' }}</div>
          </div>
        </section>

        <section class="bg-white rounded-md border border-gray-200 px-3 py-2">
          <p class="text-xs text-gray-500 mb-1">조치현사항 / 조치사항</p>
          <div class="text-sm text-gray-500 whitespace-pre-wrap">
            {{ detail.content || '입력된 내용이 표시됩니다.' }}
          </div>
        </section>
      </div>
    </div>
  </transition>
</template>

<script>
var defaultChecklist = [
  { name: '장비동작상태', statusLabel: '이상없음' },
  { name: '장비파워 및 전기접속 상태', statusLabel: '이상없음' },
  { name: '누수여부(녹,곰팡이 유무 등)', statusLabel: '이상없음' },
  { name: '기계적인 노후, 손상,파손 유무', statusLabel: '이상없음' },
  { name: '예비전원 상태', statusLabel: '이상없음' },
  { name: '실내 온도 상태', statusLabel: '이상없음' },
  { name: '장애음 상태', statusLabel: '이상없음' },
  { name: '이상음 발생 상태', statusLabel: '이상없음' },
  { name: '주변장애물 상태', statusLabel: '이상없음' },
  { name: '예비품, 측정장비 등의 정품, 청결상태', statusLabel: '이상없음' }
]

export default {
  name: 'RoutineCheckCompletedDetailModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    facility: {
      type: Object,
      default: function () {
        return null
      }
    }
  },
  computed: {
    title: function () {
      return '평상점검'
    },
    checklistTitle: function () {
      if (!this.facility || !this.facility.name) {
        return '점검리스트 결과'
      }
      return this.facility.name + ' 점검리스트 결과'
    },
    completedChecklist: function () {
      if (this.facility && this.facility.completedChecklist && this.facility.completedChecklist.length) {
        return this.facility.completedChecklist
      }
      return defaultChecklist
    },
    detail: function () {
      var parsedInfo = this.parseCompletedInfo(this.facility && this.facility.completedInfo)
      var raw = (this.facility && this.facility.completedDetail) || {}

      return {
        inspectors: raw.inspectors || parsedInfo.inspectors || '',
        inspectionDate: raw.inspectionDate || parsedInfo.inspectionDate || '',
        startTime: raw.startTime || parsedInfo.startTime || '',
        endTime: raw.endTime || parsedInfo.endTime || '',
        content: raw.content || ''
      }
    }
  },
  methods: {
    getStatusBadgeClass: function (item) {
      var status = item && item.status ? String(item.status).toLowerCase() : ''
      var label = item && item.statusLabel ? String(item.statusLabel) : ''

      if (status === 'action' || label === '조치필요') {
        return 'bg-red-100 text-red-700'
      }
      if (status === 'na' || label === '미해당') {
        return 'bg-gray-100 text-gray-700'
      }
      return 'bg-green-100 text-green-700'
    },
    handleClose: function () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    parseCompletedInfo: function (completedInfo) {
      var emptyResult = {
        inspectors: '',
        inspectionDate: '',
        startTime: '',
        endTime: ''
      }
      if (!completedInfo || typeof completedInfo !== 'string') {
        return emptyResult
      }

      var match = completedInfo.match(/^(.*)\((\d{4})[.\-/](\d{2})[.\-/](\d{2})\s+(\d{2}:\d{2})\s*~\s*(\d{2}:\d{2})\)$/)
      if (!match) {
        return {
          inspectors: completedInfo,
          inspectionDate: '',
          startTime: '',
          endTime: ''
        }
      }

      var inspectors = match[1].trim()
      var year = Number(match[2])
      var month = Number(match[3]) - 1
      var day = Number(match[4])
      var dateObj = new Date(year, month, day)
      var dayNames = ['일', '월', '화', '수', '목', '금', '토']
      var dayName = dayNames[dateObj.getDay()]

      return {
        inspectors: inspectors,
        inspectionDate: match[2] + '-' + match[3] + '-' + match[4] + '(' + dayName + ')',
        startTime: match[5],
        endTime: match[6]
      }
    }
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
