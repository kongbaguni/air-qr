<!--
  @컴포넌트: 하단 액션 바
  @위치: 상세 위젯
  @설명: 폼 하단 고정 액션 버튼 (임시저장/저장하기 등)
-->
<template>
  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
    <div class="flex w-full">
      <button
        v-if="showSecondary"
        class="flex-1 py-3 text-xs font-medium text-gray-700 bg-white border-0 border-r border-gray-200 hover:bg-gray-50"
        @click="$emit('secondary-click')"
      >
        {{ resolvedSecondaryText }}
      </button>
      <button
        class="flex-1 py-3 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
        :class="{ 'opacity-50 cursor-not-allowed': disabled }"
        :disabled="disabled"
        @click="$emit('primary-click')"
      >
        {{ resolvedPrimaryText }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BottomActions',
  props: {
    primaryText: {
      type: String,
      default: ''
    },
    secondaryText: {
      type: String,
      default: ''
    },
    showSecondary: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    resolvedPrimaryText: function () {
      return this.primaryText || this.$t('common.save')
    },
    resolvedSecondaryText: function () {
      return this.secondaryText || this.$t('common.tempSave')
    }
  }
}
</script>
