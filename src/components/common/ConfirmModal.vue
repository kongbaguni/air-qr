<!--
  @컴포넌트: 확인 모달
  @설명: 확인/취소 버튼이 있는 모달 다이얼로그
-->
<template>
  <transition name="confirm-modal-fade">
    <div
      v-if="visible"
      ref="modalRoot"
      class="confirm-modal-root"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? 'confirm-modal-title' : null"
    >
      <div class="confirm-modal-backdrop" @click="handleCancel"></div>

      <div class="confirm-modal-panel">
        <div v-if="title" class="confirm-modal-head">
          <h3 id="confirm-modal-title" class="confirm-modal-title">{{ title }}</h3>
        </div>

        <div class="confirm-modal-body">
          <p class="confirm-modal-message">{{ message }}</p>
        </div>

        <div class="confirm-modal-actions">
          <button
            v-if="showCancel"
            type="button"
            class="confirm-modal-button confirm-modal-button--cancel"
            @click="handleCancel"
          >
            {{ resolvedCancelText }}
          </button>
          <button
            type="button"
            class="confirm-modal-button confirm-modal-button--confirm"
            @click="handleConfirm"
          >
            {{ resolvedConfirmText }}
          </button>
        </div>
      </div>
    </div>
  </transition>
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
  watch: {
    visible: function (isVisible) {
      var self = this
      if (!isVisible) {
        this.unlockBodyScroll()
        return
      }
      this.$nextTick(function () {
        self.appendToBody()
        self.lockBodyScroll()
      })
    }
  },
  mounted: function () {
    var self = this
    if (this.visible) {
      this.$nextTick(function () {
        self.appendToBody()
        self.lockBodyScroll()
      })
    }
  },
  beforeDestroy: function () {
    this.unlockBodyScroll()
    this.removeFromBody()
  },
  computed: {
    resolvedConfirmText: function () {
      if (this.confirmText) return this.confirmText
      if (this.$t) return this.$t('common.confirm')
      return '확인'
    },
    resolvedCancelText: function () {
      if (this.cancelText) return this.cancelText
      if (this.$t) return this.$t('common.cancel')
      return '취소'
    }
  },
  methods: {
    appendToBody: function () {
      var el = this.$refs.modalRoot
      if (el && el.parentNode !== document.body) {
        document.body.appendChild(el)
      }
    },
    removeFromBody: function () {
      var el = this.$refs.modalRoot
      if (el && el.parentNode === document.body) {
        document.body.removeChild(el)
      }
    },
    lockBodyScroll: function () {
      if (typeof document === 'undefined') return
      document.body.style.overflow = 'hidden'
    },
    unlockBodyScroll: function () {
      if (typeof document === 'undefined') return
      document.body.style.overflow = ''
    },
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
.confirm-modal-root {
  position: fixed;
  /* Chrome 66: inset 미지원 → top/right/bottom/left 사용 */
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 10050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.confirm-modal-backdrop {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
}

.confirm-modal-panel {
  position: relative;
  width: 100%;
  max-width: 360px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.confirm-modal-head {
  padding: 20px 20px 0;
}

.confirm-modal-title {
  margin: 0;
  color: #18181b;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  line-height: 1.4;
}

.confirm-modal-body {
  padding: 16px 20px 20px;
}

.confirm-modal-message {
  margin: 0;
  color: #52525b;
  font-size: 14px;
  line-height: 1.55;
  text-align: center;
  white-space: pre-line;
  word-break: break-word;
}

.confirm-modal-actions {
  display: flex;
  border-top: 1px solid #e4e4e7;
}

.confirm-modal-button {
  flex: 1;
  border: 0;
  padding: 14px 12px;
  font-size: 14px;
  font-weight: 700;
  background: #fff;
  cursor: pointer;
}

.confirm-modal-button--cancel {
  color: #52525b;
}

.confirm-modal-button--confirm {
  color: #2563eb;
  border-left: 1px solid #e4e4e7;
}

.confirm-modal-button:active {
  background: #f4f4f5;
}

.confirm-modal-fade-enter-active,
.confirm-modal-fade-leave-active {
  transition: opacity 0.18s ease;
}

.confirm-modal-fade-enter-active .confirm-modal-panel,
.confirm-modal-fade-leave-active .confirm-modal-panel {
  transition: transform 0.18s ease;
}

.confirm-modal-fade-enter,
.confirm-modal-fade-leave-to {
  opacity: 0;
}

.confirm-modal-fade-enter .confirm-modal-panel,
.confirm-modal-fade-leave-to .confirm-modal-panel {
  transform: translateY(8px) scale(0.98);
}
</style>
