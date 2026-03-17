<!--
  @컴포넌트: 시설 아코디언
  @위치: 상세 위젯
  @설명: 시설별 점검항목 아코디언 리스트
-->
<template>
  <div class="bg-white">
    <div v-for="facility in facilities" :key="facility.id" class="border-b border-gray-100">
      <button
        class="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50"
        @click="toggle(facility.id)"
      >
        <span class="text-xs font-bold text-gray-900">{{ facility.name }}</span>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform"
          :class="{ 'rotate-180': isExpanded(facility.id) }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div v-show="isExpanded(facility.id)" class="pb-1.5">
        <div
          v-for="item in facility.items"
          :key="item.id"
          class="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
          @click="handleItemClick(item)"
        >
          <div class="flex items-center gap-1.5 flex-1 min-w-0">
            <span
              :class="[
                'px-1 py-0.5 text-[10px] rounded flex-shrink-0',
                getPeriodClass(item.period)
              ]"
            >
              {{ item.period }}
            </span>
            <span v-if="item.isImportant" class="text-red-500 flex-shrink-0 text-xs">★</span>
            <div class="flex-1 min-w-0">
              <p class="text-xs text-gray-900 truncate">{{ item.title }}</p>
              <p v-if="item.status" class="text-[10px] text-gray-400">{{ item.status }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0 ml-1.5">
            <span class="text-xs text-gray-500">{{ item.progress }}</span>
            <svg
              class="w-3.5 h-3.5 text-gray-400"
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FacilityAccordion',
  props: {
    facilities: {
      type: Array,
      default: function () {
        return []
      }
    },
    defaultExpanded: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data: function () {
    return {
      expandedIds: []
    }
  },
  created: function () {
    this.expandedIds = this.defaultExpanded.slice()
    if (this.expandedIds.length === 0 && this.facilities.length > 0) {
      this.expandedIds.push(this.facilities[0].id)
    }
  },
  methods: {
    isExpanded: function (id) {
      return this.expandedIds.indexOf(id) > -1
    },
    toggle: function (id) {
      var index = this.expandedIds.indexOf(id)
      if (index > -1) {
        this.expandedIds.splice(index, 1)
      } else {
        this.expandedIds.push(id)
      }
    },
    getPeriodClass: function (period) {
      if (period === '월간') return 'bg-purple-100 text-purple-700'
      if (period === '분기') return 'bg-orange-100 text-orange-700'
      if (period === '일일') return 'bg-gray-100 text-gray-600'
      return 'bg-gray-100 text-gray-600'
    },
    handleItemClick: function (item) {
      this.$emit('item-click', item)
    }
  }
}
</script>
