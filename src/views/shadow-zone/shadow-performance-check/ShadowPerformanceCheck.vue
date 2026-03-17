<!--
  @페이지: 음영지역 성능점검
  @경로: /shadow-performance-check
  @설명: 오프라인 환경에서 다운로드된 성능점검 데이터를 조회
-->
<template>
  <div class="min-h-screen bg-gray-50">
    <PageTitle title="성능점검" />

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

      <StatusFilterTabs
        :tabs="statusTabs"
        :selected-id="statusFilter"
        @select="statusFilter = $event"
      />

      <SearchBar v-model="searchQuery" placeholder="시설명, 점검항목, 담당자로 검색" />

      <div class="mt-4">
        <FacilityAccordion :facilities="filteredFacilities" @item-click="goToDetail" />
      </div>
    </template>
  </div>
</template>

<script>
import PageTitle from '@/components/common/PageTitle.vue'
import DateSelector from '@/components/widgets/header/DateSelector.vue'
import StatusFilterTabs from '@/components/widgets/header/StatusFilterTabs.vue'
import SearchBar from '@/components/widgets/header/SearchBar.vue'
import FacilityAccordion from '@/components/widgets/detail/get/facility-status/FacilityAccordion.vue'
import { getInspectionData } from '@/utils/offlineStorage'

export default {
  name: 'ShadowPerformanceCheck',
  components: {
    PageTitle,
    DateSelector,
    StatusFilterTabs,
    SearchBar,
    FacilityAccordion
  },
  data: function () {
    var stored = getInspectionData('performanceCheck')
    return {
      selectedDate: new Date(),
      statusFilter: 'scheduled',
      searchQuery: '',
      hasData: !!stored,
      facilities: stored ? stored.data.facilities : []
    }
  },
  computed: {
    statusTabs: function () {
      var allItems = []
      this.facilities.forEach(function (f) {
        allItems = allItems.concat(f.items)
      })
      return [
        { id: 'scheduled', label: '오늘예정', count: allItems.length },
        { id: 'inProgress', label: '진행중', count: 3 },
        { id: 'completed', label: '완료', count: 0 }
      ]
    },
    filteredFacilities: function () {
      var query = this.searchQuery.trim().toLowerCase()
      if (!query) return this.facilities

      return this.facilities
        .map(function (facility) {
          var filteredItems = facility.items.filter(function (item) {
            return (
              item.title.toLowerCase().indexOf(query) > -1 ||
              facility.name.toLowerCase().indexOf(query) > -1
            )
          })
          return Object.assign({}, facility, { items: filteredItems })
        })
        .filter(function (facility) {
          return facility.items.length > 0
        })
    }
  },
  methods: {
    goToDetail: function (item) {
      this.$router.push('/shadow-performance-check/' + item.id)
    }
  }
}
</script>
