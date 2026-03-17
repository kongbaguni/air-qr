<!--
  @컴포넌트: 전체 화면 모달
  @위치: 공통 컴포넌트
  @설명: 전체 화면을 감싸는 모달 (우측 상단 닫기 버튼)
-->
<template>
  <transition name="modal-fade">
    <div
      v-if="visible"
      class="fixed inset-0 bg-white overflow-y-auto"
      style="z-index: 50;"
      @click.self="handleClose"
    >
      <!-- 헤더 (PageHeader 위에 표시) -->
      <div class="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div class="flex items-center justify-between px-4 py-3">
          <h2 class="text-lg font-bold text-gray-900">{{ title }}</h2>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
            @click="handleClose"
          >
            <svg
              class="w-5 h-5 text-gray-600"
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
          </button>
        </div>
      </div>

      <!-- 컨텐츠 -->
      <div class="p-4 pb-24">
        <slot></slot>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'FullScreenModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      required: true
    }
  },
  watch: {
    visible: function (newVal) {
      var self = this
      if (newVal) {
        this.lockBodyScroll()
        this.$nextTick(function () {
          if (self.$el && document.body) {
            document.body.appendChild(self.$el)
          }
        })
      } else {
        this.unlockBodyScroll()
      }
    }
  },
  mounted: function () {
    var self = this
    if (this.visible && this.$el && document.body) {
      this.$nextTick(function () {
        document.body.appendChild(self.$el)
      })
    }
  },
  beforeDestroy: function () {
    this.unlockBodyScroll()
    if (this.$el && this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
  },
  methods: {
    handleClose: function () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    lockBodyScroll: function () {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    },
    unlockBodyScroll: function () {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
