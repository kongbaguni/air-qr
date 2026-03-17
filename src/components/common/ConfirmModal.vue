<!--
  @컴포넌트: 확인 모달
  @설명: 확인/취소 버튼이 있는 모달 다이얼로그
-->
<template>
  <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- 배경 오버레이 -->
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleCancel"></div>

    <!-- 모달 컨텐츠 -->
    <div class="relative bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
      <!-- 타이틀 -->
      <div v-if="title" class="px-6 pt-6 pb-4">
        <h3 class="text-lg font-bold text-gray-900 text-center">{{ title }}</h3>
      </div>

      <!-- 메시지 -->
      <div class="px-6 pb-6">
        <p class="text-sm text-gray-600 text-center whitespace-pre-line">{{ message }}</p>
      </div>

      <!-- 버튼 영역 -->
      <div class="flex border-t border-gray-200">
        <button
          v-if="showCancel"
          class="flex-1 py-4 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          @click="handleCancel"
        >
          {{ resolvedCancelText }}
        </button>
        <div v-if="showCancel" class="w-px bg-gray-200"></div>
        <button
          class="flex-1 py-4 text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors"
          @click="handleConfirm"
        >
          {{ resolvedConfirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true
    },
    confirmText: {
      type: String,
      default: ''
    },
    cancelText: {
      type: String,
      default: ''
    },
    showCancel: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    resolvedConfirmText: function () {
      return this.confirmText || this.$t('common.confirm')
    },
    resolvedCancelText: function () {
      return this.cancelText || this.$t('common.cancel')
    }
  },
  methods: {
    handleConfirm: function () {
      this.$emit('confirm')
      this.$emit('update:visible', false)
    },
    handleCancel: function () {
      this.$emit('cancel')
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>
/* 모달 애니메이션 */
</style>
