<!--
  @컴포넌트: 바텀시트
  @위치: 공통 컴포넌트
  @설명: 하단에서 올라오는 모달 시트 (재사용 가능)
-->
<template>
  <transition name="bottomsheet">
    <div
      v-if="visible"
      class="fixed inset-0 flex flex-col justify-end"
      :class="containerPaddingClass"
      style="z-index: 60"
      @click.self="handleOverlayClick"
    >
      <div class="absolute inset-0 bg-black bg-opacity-50" @click="handleOverlayClick"></div>

      <div class="relative bg-white rounded-t-2xl shadow-2xl z-10 max-h-[85vh] overflow-y-auto">
        <div class="flex justify-center pt-3 pb-2">
          <div class="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        <!-- 헤더 -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
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

        <!-- 컨텐츠 -->
        <div class="px-4 py-4">
          <slot></slot>
        </div>

        <!-- 하단 버튼 -->
        <div v-if="showConfirmButton" class="px-4 pb-6 pt-2 border-t border-gray-100">
          <button
            class="w-full py-3 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            @click="handleConfirm"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'BottomSheet',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    showConfirmButton: {
      type: Boolean,
      default: true
    },
    confirmText: {
      type: String,
      default: '선택완료'
    },
    bottomPadding: {
      type: String,
      default: 'pb-16'
    },
    autoFooterPadding: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    ...mapGetters('app', ['menuVisible']),
    isLoginPage: function () {
      return this.$route && this.$route.path === '/login'
    },
    showFooter: function () {
      return (
        !this.isLoginPage && !this.menuVisible && !(this.$route.meta && this.$route.meta.hideFooter)
      )
    },
    containerPaddingClass: function () {
      return 'pb-0'
    }
  },
  watch: {
    visible: function (newVal) {
      if (newVal) {
        this.lockBodyScroll()
        this.pushBackState()
      } else {
        this.unlockBodyScroll()
        this.removeBackState()
      }
    }
  },
  beforeDestroy: function () {
    this.unlockBodyScroll()
    this.removeBackState()
  },
  methods: {
    handleOverlayClick: function () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleClose: function () {
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    handleConfirm: function () {
      this.$emit('confirm')
      this.$emit('update:visible', false)
      this.$emit('close')
    },
    pushBackState: function () {
      this._backHandler = this.onBackButton.bind(this)
      this._hasBackState = true
      window.history.pushState({ bottomSheet: true }, '')
      window.addEventListener('popstate', this._backHandler)
    },
    removeBackState: function () {
      if (this._backHandler) {
        window.removeEventListener('popstate', this._backHandler)
        this._backHandler = null
      }
      if (this._hasBackState) {
        this._hasBackState = false
        window.history.back()
      }
    },
    onBackButton: function () {
      this._hasBackState = false
      if (this.visible) {
        this.handleClose()
      }
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
.bottomsheet-enter-active,
.bottomsheet-leave-active {
  transition: opacity 0.3s ease;
}

.bottomsheet-enter-active .relative,
.bottomsheet-leave-active .relative {
  transition: transform 0.3s ease-out;
}

.bottomsheet-enter .relative,
.bottomsheet-leave-to .relative {
  transform: translateY(100%);
}

.bottomsheet-enter,
.bottomsheet-leave-to {
  opacity: 0;
}
</style>
