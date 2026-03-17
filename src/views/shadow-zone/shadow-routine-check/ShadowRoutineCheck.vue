<!--
  @페이지: 음영지역 평상점검
  @경로: /shadow-routine-check
  @설명: 오프라인 환경에서 다운로드된 평상점검 데이터를 조회
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <PageTitle title="평상점검" />

    <!-- 데이터 없음 안내 -->
    <div v-if="!hasData" class="px-4 pt-20 text-center">
      <div class="text-gray-400 text-5xl mb-4">
        <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      </div>
      <p class="text-gray-500 text-sm font-medium mb-2">저장된 데이터가 없습니다</p>
      <p class="text-gray-400 text-xs mb-6">데이터 탭에서 먼저 데이터를 불러오세요</p>
      <router-link
        to="/shadow-download"
        class="inline-block px-6 py-2.5 bg-blue-500 text-white text-sm font-medium rounded-lg"
      >
        데이터로 이동
      </router-link>
    </div>

    <!-- 점검 데이터 표시 -->
    <template v-else>
      <DateSelector v-model="selectedDate" />

      <StatusSummary
        :scheduled="storedData.statusCounts.scheduled"
        :in-progress="storedData.statusCounts.inProgress"
        :completed="storedData.statusCounts.completed"
      />

      <SearchBar v-model="searchQuery" />

      <FilterTabs :tabs="storedData.filterTabs" :selected-id="selectedTab" @select="selectedTab = $event" />

      <FacilityList
        :facilities="storedData.facilities"
        :filter-tab="selectedTab"
        :search-query="searchQuery"
        :inspectors-list="storedData.inspectors"
        @submit="handleSubmit"
        @temp-save="handleTempSave"
      />
    </template>

    <!-- 완료/저장 모달 -->
    <ConfirmModal
      :visible.sync="modalVisible"
      :message="modalMessage"
      :show-cancel="false"
      confirm-text="확인"
    />
  </div>
</template>

<script>
import PageTitle from '@/components/common/PageTitle.vue'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import DateSelector from '@/components/widgets/header/DateSelector.vue'
import StatusSummary from '@/components/widgets/header/StatusSummary.vue'
import SearchBar from '@/components/widgets/header/SearchBar.vue'
import FilterTabs from '@/components/widgets/header/FilterTabs.vue'
import FacilityList from '@/components/widgets/content/inspection/FacilityList.vue'
import { getInspectionData } from '@/utils/offlineStorage'

export default {
  name: 'ShadowRoutineCheck',
  components: {
    PageTitle,
    ConfirmModal,
    DateSelector,
    StatusSummary,
    SearchBar,
    FilterTabs,
    FacilityList
  },
  data: function () {
    var stored = getInspectionData('routineCheck')
    return {
      selectedDate: new Date(),
      searchQuery: '',
      selectedTab: 'all',
      hasData: !!stored,
      storedData: stored ? stored.data : null,
      modalVisible: false,
      modalMessage: ''
    }
  },
  methods: {
    showModal: function (message) {
      this.modalMessage = message
      this.modalVisible = true
    },
    handleSubmit: function () {
      this.showModal('점검이 완료되었습니다.')
    },
    handleTempSave: function () {
      this.showModal('임시 저장되었습니다.')
    }
  }
}
</script>
