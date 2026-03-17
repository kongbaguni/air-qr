<!--
  @페이지: 점검다운로드
  @경로: /shadow-download
  @설명: 음영지역 점검 데이터를 다운로드하여 오프라인에서 사용할 수 있도록 관리
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <PageTitle title="점검 데이터" />

    <!-- 데이터 카드 목록 -->
    <div class="px-4 pt-4 space-y-3">
      <div
        v-for="item in downloadList"
        :key="item.type"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-base font-semibold text-gray-900">{{ item.label }}</h3>
            <p v-if="item.hasData" class="text-xs text-gray-500 mt-1">
              저장: {{ formatDate(item.downloadedAt) }}
            </p>
            <p v-else class="text-xs text-gray-400 mt-1">미저장</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              v-if="item.hasData"
              class="px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg"
              @click="handleDelete(item.type)"
            >
              삭제
            </button>
            <button
              class="px-3 py-2 text-xs font-medium rounded-lg"
              :class="item.hasData ? 'text-blue-600 bg-blue-50' : 'text-white bg-blue-500'"
              :disabled="downloading === item.type"
              @click="handleSave(item.type)"
            >
              <span v-if="downloading === item.type">저장 중...</span>
              <span v-else-if="item.hasData">다시 저장</span>
              <span v-else>데이터 불러오기</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="px-4 pt-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <p class="text-xs text-blue-700 leading-relaxed">
          데이터를 불러오면 점검 항목을 조회·입력·저장할 수 있습니다. 기기 로컬에 저장됩니다.
        </p>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <ConfirmModal
      :visible.sync="deleteModalVisible"
      title="데이터 삭제"
      message="다운로드된 데이터를 삭제하시겠습니까?"
      confirm-text="삭제"
      cancel-text="취소"
      @confirm="confirmDelete"
    />

    <ConfirmModal
      :visible.sync="completeModalVisible"
      title="저장 완료"
      :message="completeModalMessage"
      :show-cancel="false"
      confirm-text="확인"
    />
  </div>
</template>

<script>
import PageTitle from '@/components/common/PageTitle.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import {
  saveInspectionData,
  getDownloadedList,
  removeInspectionData
} from '@/utils/offlineStorage'
import { filterTabs, inspectors, facilities, statusCounts } from '@/mocks/routineCheck'
import { facilities as performanceCheckFacilities } from '@/mocks/performanceCheck'
import { performanceVerificationFacilities } from '@/mocks/performanceVerification'

export default {
  name: 'ShadowDownload',
  components: {
    PageTitle,
    ConfirmModal
  },
  data: function () {
    return {
      downloadList: getDownloadedList(),
      downloading: null,
      deleteModalVisible: false,
      deleteTargetType: null,
      completeModalVisible: false,
      completeModalMessage: ''
    }
  },
  methods: {
    handleSave: function (type) {
      var self = this
      self.downloading = type

      var mockDataMap = {
        routineCheck: {
          filterTabs: filterTabs,
          inspectors: inspectors,
          facilities: facilities,
          statusCounts: statusCounts
        },
        performanceCheck: {
          facilities: performanceCheckFacilities
        },
        performanceVerification: {
          facilities: performanceVerificationFacilities
        }
      }

      setTimeout(function () {
        var data = mockDataMap[type]
        if (data) {
          saveInspectionData(type, data)
          self.downloadList = getDownloadedList()
          self.completeModalMessage = '데이터가 저장되었습니다.'
          self.completeModalVisible = true
        }
        self.downloading = null
      }, 400)
    },
    handleDelete: function (type) {
      this.deleteTargetType = type
      this.deleteModalVisible = true
    },
    confirmDelete: function () {
      if (this.deleteTargetType) {
        removeInspectionData(this.deleteTargetType)
        this.downloadList = getDownloadedList()
        this.deleteTargetType = null
      }
    },
    formatDate: function (isoString) {
      if (!isoString) return ''
      var d = new Date(isoString)
      var year = d.getFullYear()
      var month = ('0' + (d.getMonth() + 1)).slice(-2)
      var day = ('0' + d.getDate()).slice(-2)
      var hours = ('0' + d.getHours()).slice(-2)
      var minutes = ('0' + d.getMinutes()).slice(-2)
      return year + '.' + month + '.' + day + ' ' + hours + ':' + minutes
    }
  }
}
</script>
