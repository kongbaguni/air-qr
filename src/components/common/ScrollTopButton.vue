<!--
  @컴포넌트: 상단 이동 버튼
  @위치: 공통 컴포넌트
  @설명: 클릭 시 화면 최상단으로 이동
-->
<template>
  <div class="fixed bottom-4 right-4" :style="{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }">
    <button
      class="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
      @click="scrollToTop"
    >
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ScrollTopButton',
  props: {
    scrollContainer: {
      type: String,
      default: ''
    }
  },
  methods: {
    scrollToTop: function () {
      var container = null

      if (this.scrollContainer && typeof document !== 'undefined') {
        container = document.querySelector(this.scrollContainer)
      }

      if (container) {
        if (typeof container.scrollTo === 'function') {
          container.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          container.scrollTop = 0
        }
        return
      }

      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      if (document && document.documentElement) {
        document.documentElement.scrollTop = 0
      }
      if (document && document.body) {
        document.body.scrollTop = 0
      }
    }
  }
}
</script>
