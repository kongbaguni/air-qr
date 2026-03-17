<!--
  @컴포넌트: 검색바
  @위치: 공통 컴포넌트
  @설명: 검색 입력창 (재사용 가능)
-->
<template>
  <div class="px-4 py-2 bg-white border-b border-gray-100">
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <input
          type="text"
          :value="value"
          :placeholder="computedPlaceholder"
          class="w-full h-10 pl-4 pr-10 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="$emit('input', $event.target.value)"
        />
        <button
          class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="handleRightIconClick"
        >
          <svg
            v-if="value"
            class="w-4 h-4"
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
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    showCalendar: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedPlaceholder: function () {
      return this.placeholder || this.$t('common.search')
    }
  },
  methods: {
    handleRightIconClick: function () {
      if (this.value) this.$emit('input', '')
    }
  }
}
</script>
