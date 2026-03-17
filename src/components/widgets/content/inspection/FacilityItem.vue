<!--
  @컴포넌트: 시설 항목
  @위치: 위젯 컴포넌트
  @설명: 개별 시설 점검 항목 카드
-->
<template>
  <div class="border-b border-gray-100 last:border-b-0">
    <div
      class="flex items-center px-4 py-3 bg-white"
      :class="{ 'cursor-pointer': clickable }"
      @click="handleClick"
    >
      <label v-if="showCheckbox" class="flex items-center" @click.stop>
        <input
          type="checkbox"
          :checked="checked"
          class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          @change="$emit('check', $event.target.checked)"
        />
      </label>
      <div class="flex-1 min-w-0" :class="showCheckbox ? 'ml-3' : ''">
        <p class="text-sm font-medium text-gray-900 truncate">{{ facility.name }}</p>
        <p class="text-xs text-gray-500 truncate mt-0.5">{{ facility.category }}</p>
        <p v-if="showCompletedMeta" class="text-xs text-gray-500 truncate mt-1">
          {{ completedMetaText }}
        </p>
      </div>
      <span
        v-if="showStatusBadge && facility.status"
        :class="statusBadgeClass"
        class="ml-2 flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
      >
        {{ statusLabel }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FacilityItem',
  props: {
    facility: {
      type: Object,
      required: true
    },
    checked: {
      type: Boolean,
      default: false
    },
    showCheckbox: {
      type: Boolean,
      default: true
    },
    showStatusBadge: {
      type: Boolean,
      default: true
    },
    showCompletedMeta: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    completedMetaText: function () {
      if (this.facility.completedInfo) return this.facility.completedInfo
      return '유재석, 박명수, 정준하, 하하(2025.10.21 14:00 ~ 15:00)'
    },
    statusLabel: function () {
      if (this.facility.status === 'normal') return '이상없음'
      if (this.facility.status === 'action') return '조치필요'
      if (this.facility.status === 'na') return '미해당'
      return ''
    },
    statusBadgeClass: function () {
      if (this.facility.status === 'normal') return 'bg-green-100 text-green-700'
      if (this.facility.status === 'action') return 'bg-red-100 text-red-700'
      if (this.facility.status === 'na') return 'bg-gray-100 text-gray-600'
      return ''
    }
  },
  methods: {
    handleClick: function () {
      if (!this.clickable) {
        return
      }
      this.$emit('open-detail')
    }
  }
}
</script>
