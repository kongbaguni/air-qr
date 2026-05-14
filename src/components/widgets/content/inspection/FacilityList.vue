<!--
  @컴포넌트: 시설 목록
  @위치: 위젯 컴포넌트
  @설명: 시설 그룹별 점검 항목 목록 - 자체 상태 관리
-->
<template>
  <div class="bg-white">
    <div class="px-4 py-3 border-b border-gray-100">
      <h3 class="text-sm font-bold text-gray-900 mb-1">시설 리스트</h3>
      <p v-if="!isCompletedTab" class="text-xs text-gray-500 mb-3">
        <span
          class="inline-block w-3.5 h-3.5 bg-blue-100 text-blue-600 rounded-full text-center leading-3.5 text-[10px] font-bold mr-1 align-middle"
        >
          ?
        </span>
        1개 이상 항목을 체크하고 아래 점검 버튼을 클릭해주세요.
      </p>
      <div v-if="!isCompletedTab" class="flex flex-col space-y-3">
        <div class="w-full">
          <StatusButtons :selected="localStatusFilter" @select="handleStatusSelect" />
        </div>
        <label class="flex items-center">
          <input
            type="checkbox"
            :checked="allChecked"
            class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @change="toggleAll($event.target.checked)"
          />
          <span class="ml-2 text-sm font-medium text-gray-900">전체 선택</span>
        </label>
      </div>
    </div>

    <div class="divide-y divide-gray-100">
      <FacilityItem
        v-for="facility in displayedFacilities"
        :key="facility.id"
        :facility="facility"
        :checked="facility.checked"
        :show-checkbox="!isCompletedTab"
        :show-status-badge="!isCompletedTab"
        :show-completed-meta="isCompletedTab"
        :clickable="true"
        @check="handleCheck(facility.id, $event)"
        @open-detail="openDetail(facility)"
      />
    </div>

    <div v-if="displayedFacilities.length === 0" class="py-8 text-center text-gray-400 text-sm">
      점검 목록이 없습니다.
    </div>

    <InspectionForm
      v-if="!isCompletedTab"
      :inspectors-list="inspectorsList"
      :embedded="true"
      @submit="handleSubmit"
      @cancel="handleCancel"
    />

    <InspectionDetailModal
      :visible.sync="showDetailModal"
      :facility="selectedFacility"
      :inspectors-list="inspectorsList"
      :selected-date="selectedDate"
      @close="handleDetailClose"
      @save="handleDetailSave"
    />

    <RoutineCheckCompletedDetailModal
      :visible.sync="showCompletedDetailModal"
      :facility="selectedFacility"
      @close="handleCompletedDetailClose"
    />
  </div>
</template>

<script>
import StatusButtons from './StatusButtons.vue'
import FacilityItem from './FacilityItem.vue'
import InspectionDetailModal from './InspectionDetailModal.vue'
import InspectionForm from './InspectionForm.vue'
import RoutineCheckCompletedDetailModal from './RoutineCheckCompletedDetailModal.vue'
import { modalAlert } from '@/utils/modalAlert'

export default {
  name: 'FacilityList',
  components: {
    StatusButtons,
    FacilityItem,
    InspectionDetailModal,
    InspectionForm,
    RoutineCheckCompletedDetailModal
  },
  props: {
    facilities: {
      type: Array,
      default: function () {
        return []
      }
    },
    filterTab: {
      type: String,
      default: 'all'
    },
    searchQuery: {
      type: String,
      default: ''
    },
    statusTab: {
      type: String,
      default: 'scheduled'
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
      localFacilities: [],
      localStatusFilter: '',
      showDetailModal: false,
      showCompletedDetailModal: false,
      selectedFacility: null
    }
  },
  computed: {
    filteredFacilities: function () {
      var self = this
      var result = this.localFacilities

      if (this.filterTab !== 'all') {
        result = result.filter(function (f) {
          return f.type === self.filterTab
        })
      }

      if (this.searchQuery) {
        var query = this.searchQuery.toLowerCase()
        result = result.filter(function (f) {
          return (
            f.name.toLowerCase().indexOf(query) > -1 || f.category.toLowerCase().indexOf(query) > -1
          )
        })
      }

      return result
    },
    displayedFacilities: function () {
      return this.filteredFacilities
    },
    isCompletedTab: function () {
      return this.statusTab === 'completed'
    },
    allChecked: function () {
      if (this.displayedFacilities.length === 0) return false
      return this.displayedFacilities.every(function (f) {
        return f.checked
      })
    },
    checkedFacilities: function () {
      return this.localFacilities.filter(function (f) {
        return f.checked
      })
    },
    hasCheckedFacilities: function () {
      return this.checkedFacilities.length > 0
    }
  },
  watch: {
    facilities: {
      immediate: true,
      deep: true,
      handler: function (newVal) {
        this.localFacilities = this.deepCopy(newVal)
      }
    }
  },
  methods: {
    deepCopy: function (arr) {
      return JSON.parse(JSON.stringify(arr))
    },
    findFacility: function (id) {
      return this.localFacilities.find(function (f) {
        return f.id === id
      })
    },
    toggleAll: function (checked) {
      var self = this
      this.displayedFacilities.forEach(function (displayed) {
        var facility = self.findFacility(displayed.id)
        if (facility) {
          facility.checked = checked
        }
      })
    },
    handleStatusSelect: function (status) {
      if (this.checkedFacilities.length === 0) {
        return
      }
      var self = this
      this.checkedFacilities.forEach(function (f) {
        var facility = self.findFacility(f.id)
        if (facility) {
          facility.status = status
        }
      })
      this.localStatusFilter = status
    },
    handleCheck: function (id, checked) {
      var facility = this.findFacility(id)
      if (facility) {
        facility.checked = checked
      }
    },
    openDetail: function (facility) {
      this.selectedFacility = facility
      if (this.isCompletedTab) {
        this.showCompletedDetailModal = true
        return
      }
      this.showDetailModal = true
    },
    handleDetailSave: function (payload) {
      var facility = this.findFacility(payload.facilityId)
      if (facility) {
        facility.status = payload.status
        facility.subItems = this.deepCopy(payload.subItems || [])
      }
      this.handleDetailClose()
      this.$emit('detail-saved', payload)
    },
    handleDetailClose: function () {
      this.showDetailModal = false
      this.selectedFacility = null
    },
    handleCompletedDetailClose: function () {
      this.showCompletedDetailModal = false
      this.selectedFacility = null
    },
    handleSubmit: function (formData) {
      if (this.checkedFacilities.length === 0) {
        modalAlert('1개 이상 점검항목을 선택해주세요.')
        return
      }
      if (!this.localStatusFilter) {
        modalAlert('상태(이상없음/조치필요/미해당)를 선택해주세요.')
        return
      }
      var self = this
      this.checkedFacilities.forEach(function (f) {
        var facility = self.findFacility(f.id)
        if (facility) {
          facility.status = self.localStatusFilter
        }
      })
      this.$emit('submit', {
        formData: formData,
        statusFilter: this.localStatusFilter,
        checkedFacilities: this.checkedFacilities
      })
    },
    handleCancel: function () {
      this.localFacilities.forEach(function (f) {
        f.checked = false
      })
      this.localStatusFilter = ''
    }
  }
}
</script>
