<template>
  <FullScreenModal :visible.sync="localVisible" title="평상점검" @close="handleClose">
    <div class="space-y-4 pb-32">
      <p class="text-xs text-gray-500">1개 이상 항목을 체크하고 아래 점검 버튼을 클릭해주세요.</p>

      <StatusButtons :selected="selectedStatus" @select="applyStatusToChecked" />

      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-gray-900">{{ facilityTitle }}</h3>
        <div class="flex items-center space-x-2 text-xs">
          <button
            class="px-2 py-1 rounded border border-gray-200 text-gray-600"
            @click="selectAllSubItems"
          >
            전체선택
          </button>
          <button
            class="px-2 py-1 rounded border border-gray-200 text-gray-600"
            @click="clearAllSubItems"
          >
            전체해제
          </button>
        </div>
      </div>

      <div class="border border-gray-100 rounded-lg divide-y divide-gray-100">
        <label
          v-for="(subItem, index) in localSubItems"
          :key="index"
          class="flex items-center justify-between px-3 py-2"
        >
          <span class="flex items-center min-w-0">
            <input
              type="checkbox"
              :checked="subItem.checked"
              class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              @change="toggleSubItem(index, $event.target.checked)"
            />
            <span class="ml-2 text-sm text-gray-800 truncate">{{ subItem.name }}</span>
          </span>
          <span
            :class="subItemStatusBadgeClass(subItem.status)"
            class="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
          >
            {{ subItemStatusLabel(subItem.status) }}
          </span>
        </label>
      </div>

      <div class="space-y-3 border-t border-gray-100 pt-3">
        <InspectorSearch
          :value="inspectors"
          :list="inspectorsList"
          label="점검자"
          @input="inspectors = $event"
        />

        <div>
          <p class="text-xs text-gray-500 mb-1">점검날짜</p>
          <input
            type="text"
            :value="formattedDate"
            readonly
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 cursor-pointer"
            @click="showDatePicker = true"
          />
        </div>

        <div>
          <p class="text-xs text-gray-500 mb-1">점검시간</p>
          <div class="flex items-center space-x-2">
            <input
              type="text"
              :value="startTime"
              readonly
              class="w-24 px-2 py-2 text-sm border border-gray-200 rounded-lg bg-white"
              @click="showStartPicker = true"
            />
            <span class="text-gray-400">~</span>
            <input
              type="text"
              :value="endTime"
              readonly
              class="w-24 px-2 py-2 text-sm border border-gray-200 rounded-lg bg-white"
              @click="showEndPicker = true"
            />
          </div>
        </div>

        <div>
          <p class="text-xs text-gray-500 mb-1">조치한사항 / 조치사항</p>
          <textarea
            v-model="content"
            rows="4"
            placeholder="내용을 입력해주세요"
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none"
          ></textarea>
        </div>
      </div>
    </div>

    <div
      class="fixed left-0 right-0 bottom-0 px-4 py-3 bg-white border-t border-gray-100"
      style="z-index: 55"
    >
      <div class="flex items-center space-x-2">
        <button
          class="flex-1 py-3 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200"
          @click="handleCancel"
        >
          취소
        </button>
        <button :disabled="!canSubmit" :class="submitButtonClass" @click="handleSave">
          저장
        </button>
      </div>
    </div>

    <TimePickerBottomSheet
      :value="startTime"
      :visible.sync="showStartPicker"
      title="점검시작시간"
      @input="updateStartTime"
    />
    <TimePickerBottomSheet
      :value="endTime"
      :visible.sync="showEndPicker"
      title="점검종료시간"
      @input="updateEndTime"
    />
    <DatePickerBottomSheet
      :value="localDate"
      :visible.sync="showDatePicker"
      @input="handleDateSelect"
      @close="showDatePicker = false"
    />
  </FullScreenModal>
</template>

<script>
import FullScreenModal from '@/components/common/FullScreenModal.vue'
import StatusButtons from './StatusButtons.vue'
import TimePickerBottomSheet from '@/components/common/TimePickerBottomSheet.vue'
import DatePickerBottomSheet from '@/components/common/DatePickerBottomSheet.vue'
import InspectorSearch from '@/components/widgets/detail/post/common/InspectorSearch.vue'

export default {
  name: 'InspectionDetailModal',
  components: {
    FullScreenModal: FullScreenModal,
    StatusButtons: StatusButtons,
    TimePickerBottomSheet: TimePickerBottomSheet,
    DatePickerBottomSheet: DatePickerBottomSheet,
    InspectorSearch: InspectorSearch
  },
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
    },
    inspectorsList: {
      type: Array,
      default: function () {
        return []
      }
    },
    selectedDate: {
      type: Date,
      default: function () {
        return new Date()
      }
    }
  },
  data: function () {
    return {
      localSubItems: [],
      selectedStatus: '',
      inspectors: [],
      localDate: null,
      startTime: '09:00',
      endTime: '18:00',
      content: '',
      showStartPicker: false,
      showEndPicker: false,
      showDatePicker: false
    }
  },
  computed: {
    localVisible: {
      get: function () {
        return this.visible
      },
      set: function (val) {
        this.$emit('update:visible', val)
      }
    },
    facilityTitle: function () {
      if (!this.facility || !this.facility.name) {
        return '점검리스트'
      }
      return this.facility.name + ' 점검리스트'
    },
    formattedDate: function () {
      if (!this.localDate) {
        return ''
      }
      var days = ['일', '월', '화', '수', '목', '금', '토']
      var date = new Date(this.localDate)
      var year = String(date.getFullYear())
      var month = String(date.getMonth() + 1).padStart(2, '0')
      var day = String(date.getDate()).padStart(2, '0')
      var dayName = days[date.getDay()]
      return year + '-' + month + '-' + day + '(' + dayName + ')'
    },
    hasCheckedSubItems: function () {
      return this.localSubItems.some(function (item) {
        return !!item.checked
      })
    },
    checkedSubItems: function () {
      return this.localSubItems.filter(function (item) {
        return item.checked
      })
    },
    computedFacilityStatus: function () {
      var checked = this.checkedSubItems
      if (checked.length === 0) return ''
      var assigned = checked.filter(function (item) {
        return item.status === 'normal' || item.status === 'action' || item.status === 'na'
      })
      if (assigned.length === 0) return ''
      var hasAction = assigned.some(function (item) {
        return item.status === 'action'
      })
      if (hasAction) return 'action'
      var allNa = assigned.every(function (item) {
        return item.status === 'na'
      })
      if (allNa) return 'na'
      return 'normal'
    },
    canSubmit: function () {
      return (
        this.inspectors.length > 0 &&
        this.hasCheckedSubItems &&
        this.computedFacilityStatus !== ''
      )
    },
    submitButtonClass: function () {
      var base = 'flex-1 py-3 rounded-lg text-sm font-semibold transition-colors '
      if (this.canSubmit) {
        return base + 'bg-blue-600 text-white hover:bg-blue-700'
      }
      return base + 'bg-gray-200 text-gray-500 cursor-not-allowed'
    }
  },
  watch: {
    visible: function (newVal) {
      if (newVal) {
        this.initializeForm()
      }
    },
    facility: {
      deep: true,
      handler: function () {
        if (this.visible) {
          this.initializeForm()
        }
      }
    }
  },
  methods: {
    initializeForm: function () {
      this.selectedStatus = ''
      this.startTime = '09:00'
      this.endTime = '18:00'
      this.content = ''
      this.localDate = this.selectedDate ? new Date(this.selectedDate) : new Date()
      this.inspectors = []
      var source = []
      if (this.facility && this.facility.subItems) {
        source = this.facility.subItems
      }
      this.localSubItems = source.map(function (item) {
        return {
          name: item.name,
          checked: !!item.checked,
          status: item.status || ''
        }
      })
    },
    toggleSubItem: function (index, checked) {
      if (!this.localSubItems[index]) {
        return
      }
      this.localSubItems[index].checked = checked
    },
    selectAllSubItems: function () {
      this.localSubItems.forEach(function (item) {
        item.checked = true
      })
    },
    clearAllSubItems: function () {
      this.localSubItems.forEach(function (item) {
        item.checked = false
      })
    },
    applyStatusToChecked: function (status) {
      this.selectedStatus = status
      this.localSubItems.forEach(function (item) {
        if (item.checked) {
          item.status = status
        }
      })
    },
    subItemStatusBadgeClass: function (status) {
      if (status === 'normal') {
        return 'bg-green-100 text-green-700'
      }
      if (status === 'action') {
        return 'bg-red-100 text-red-700'
      }
      if (status === 'na') {
        return 'bg-gray-100 text-gray-700'
      }
      return 'bg-gray-100 text-gray-400'
    },
    subItemStatusLabel: function (status) {
      if (status === 'normal') {
        return '이상없음'
      }
      if (status === 'action') {
        return '조치필요'
      }
      if (status === 'na') {
        return '미해당'
      }
      return ''
    },
    updateStartTime: function (value) {
      this.startTime = value
    },
    updateEndTime: function (value) {
      this.endTime = value
    },
    handleDateSelect: function (date) {
      this.localDate = date
    },
    handleClose: function () {
      this.$emit('close')
    },
    handleCancel: function () {
      this.localVisible = false
      this.$emit('close')
    },
    handleSave: function () {
      if (!this.canSubmit || !this.facility) {
        return
      }
      this.$emit('save', {
        facilityId: this.facility.id,
        status: this.computedFacilityStatus,
        subItems: this.localSubItems,
        inspectors: this.inspectors,
        inspectionDate: this.localDate,
        startTime: this.startTime,
        endTime: this.endTime,
        content: this.content
      })
    }
  }
}
</script>
