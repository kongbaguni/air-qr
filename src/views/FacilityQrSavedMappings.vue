<template>
  <div class="saved-page">
    <section class="panel-card">
      <div class="panel-header">
        <div>
          <p class="panel-step">저장 목록</p>
          <h1 class="panel-title">저장된 QR 매칭</h1>
        </div>
        <div class="header-actions">
          <router-link class="ghost-button" to="/">매칭 화면</router-link>
          <button class="ghost-button" type="button" :disabled="exportingCsv" @click="exportMatchingCsv">
            {{ exportingCsv ? 'CSV 생성 중…' : 'CSV 생성' }}
          </button>
          <button class="accent-button" type="button" :disabled="reloading" @click="reloadSavedMappings">
            다시 불러오기
          </button>
        </div>
      </div>

      <div v-if="reloading" class="saved-loading-overlay" aria-hidden="false">
        <div class="saved-loading-overlay-backdrop"></div>
        <div class="saved-loading-overlay-content">
          <div class="saved-loading-spinner"></div>
          <p class="saved-loading-text">저장된 매칭을 불러오는 중입니다…</p>
        </div>
      </div>
      <p class="summary-line">
        기기 QR 저장소에서 <strong>{{ mappings.length }}</strong>건을 불러왔습니다.
        <template v-if="selectedDateKey">
          · <strong>{{ displayedMappings.length }}</strong>건 표시 중
        </template>
      </p>

      <label v-if="mappings.length" class="field-label">
        저장 일자
        <select v-model="selectedDateKey" class="text-input">
          <option value="">전체 ({{ mappings.length }}건)</option>
          <option
            v-for="option in dateFilterOptions"
            :key="option.key"
            :value="option.key"
          >
            {{ option.label }} ({{ option.count }}건)
          </option>
        </select>
      </label>

      <p v-if="reloadMessage" class="reload-message">{{ reloadMessage }}</p>
      <p v-if="reloadError" class="reload-error">{{ reloadError }}</p>

      <div class="mapping-list">
        <div v-if="!mappings.length" class="empty-list">
          저장된 매칭이 없습니다. 매칭 화면에서 저장한 뒤 다시 불러오기를 눌러 주세요.
        </div>

        <div v-else-if="!displayedMappings.length" class="empty-list">
          선택한 날짜에 저장된 매칭이 없습니다.
        </div>

        <div
          v-for="mapping in displayedMappings"
          :key="mapping.facilityId + mapping.qr.code"
          class="mapping-row"
        >
          <div class="mapping-main" @click="openInMatcher(mapping)">
            <strong>{{ mapping.facilityName }}</strong>
            <p>{{ mapping.facilityId }} · {{ mapping.category }} · {{ mapping.location }}</p>
            <p class="mono">{{ mapping.qr.code }}</p>
            <p class="updated-at">{{ formatUpdatedAt(mapping.updatedAt) }}</p>
          </div>
          <div class="mapping-actions">
            <button class="ghost-button" type="button" @click="openInMatcher(mapping)">매칭 화면으로</button>
            <button
              class="danger-button"
              type="button"
              @click.stop="removeMapping(mapping)"
            >
              삭제
            </button>
          </div>
        </div>
      </div>
    </section>

    <ScrollTopButton scroll-container=".saved-page" />

    <ConfirmModal
      :visible.sync="deleteModalVisible"
      title="매칭 삭제"
      :message="deleteModalMessage"
      confirm-text="삭제"
      cancel-text="취소"
      @confirm="confirmRemoveMapping"
      @cancel="cancelRemoveMapping"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ScrollTopButton from '@/components/common/ScrollTopButton.vue'
import { DEV_FACILITY_CSV_NAME, getFacilityCatalog, loadFacilityCatalog } from '@/utils/facilityStore'
import { hydrateMappingsWithCatalog } from '@/utils/facilityIndex'
import { vibrate } from '@/utils/native'
import {
  filterMappingsByDate,
  getMappingDateOptions,
  getQrStoredValue,
  sortMappingsByRecent
} from '@/utils/qrMatcher'
import {
  deleteQrMappingFromNative,
  loadQrMappingsFromNative,
  requestExportCsv
} from '@/utils/qrNativeStorage'
export default {
  name: 'FacilityQrSavedMappings',
  components: {
    ConfirmModal,
    ScrollTopButton
  },
  data: function () {
    return {
      facilities: [],
      mappings: [],
      reloadMessage: '',
      reloadError: '',
      reloading: false,
      exportingCsv: false,
      deleteModalVisible: false,
      pendingDeleteMapping: null,
      selectedDateKey: ''
    }
  },
  computed: {
    dateFilterOptions: function () {
      return getMappingDateOptions(this.mappings)
    },
    displayedMappings: function () {
      return filterMappingsByDate(this.mappings, this.selectedDateKey)
    },
    deleteModalMessage: function () {
      var mapping = this.pendingDeleteMapping
      if (!mapping) return '삭제하시겠습니까?'

      var lines = ['삭제하시겠습니까?', '']
      if (mapping.facilityName) lines.push(mapping.facilityName)
      if (mapping.facilityId) lines.push(mapping.facilityId)
      if (mapping.qr && mapping.qr.code) lines.push(mapping.qr.code)
      return lines.join('\n')
    }
  },
  watch: {
    mappings: function (next) {
      if (!this.selectedDateKey) return
      var stillExists = getMappingDateOptions(next).some(
        function (option) {
          return option.key === this.selectedDateKey
        }.bind(this)
      )
      if (!stillExists) this.selectedDateKey = ''
    }
  },
  mounted: function () {
    this.attachMappingsRefreshListeners()
    this.reloadSavedMappings()
  },
  beforeDestroy: function () {
    this.detachMappingsRefreshListeners()
  },
  methods: {
    loadFacilityReference: function () {
      var self = this
      var cached = getFacilityCatalog()

      if (cached) {
        self.facilities = cached.list
        return Promise.resolve()
      }

      return loadFacilityCatalog(DEV_FACILITY_CSV_NAME)
        .then(function (result) {
          self.facilities = result.catalog.list
        })
        .catch(function () {
          self.facilities = []
        })
    },
    attachMappingsRefreshListeners: function () {
      if (this._refreshListenersAttached || typeof window === 'undefined') return

      this._refreshListenersAttached = true
      this._handleMappingsChanged = this.handleMappingsChanged.bind(this)
      this._handleVisibilityChange = this.handleVisibilityChange.bind(this)

      window.addEventListener('qr-mappings-changed', this._handleMappingsChanged)
      window.addEventListener('focus', this._handleMappingsChanged)
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', this._handleVisibilityChange)
      }
    },
    detachMappingsRefreshListeners: function () {
      if (!this._refreshListenersAttached || typeof window === 'undefined') return

      this._refreshListenersAttached = false
      if (this._handleMappingsChanged) {
        window.removeEventListener('qr-mappings-changed', this._handleMappingsChanged)
        window.removeEventListener('focus', this._handleMappingsChanged)
      }
      if (this._handleVisibilityChange && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', this._handleVisibilityChange)
      }
    },
    handleMappingsChanged: function () {
      this.reloadSavedMappings()
    },
    handleVisibilityChange: function () {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        this.reloadSavedMappings()
      }
    },
    reloadSavedMappings: function () {
      var self = this
      var loadFacilitiesPromise = this.facilities.length
        ? Promise.resolve()
        : this.loadFacilityReference()

      this.reloading = true
      this.reloadError = ''
      loadFacilitiesPromise
        .catch(function () {
          return null
        })
        .finally(function () {
          loadQrMappingsFromNative(self.facilities)
            .then(function (mappings) {
              var catalog = getFacilityCatalog()
              self.mappings = catalog
                ? hydrateMappingsWithCatalog(catalog, mappings)
                : mappings
              self.reloadMessage = '기기 QR 저장소에서 저장된 매칭을 다시 불러왔습니다.'
            })
            .catch(function () {
              self.reloadError = '저장된 QR 매칭을 불러오지 못했습니다.'
            })
            .finally(function () {
              self.reloading = false
            })
        })
    },
    formatUpdatedAt: function (value) {
      if (!value) return '저장 시각 없음'
      var date = new Date(value)
      if (isNaN(date.getTime())) return String(value)
      return date.toLocaleString('ko-KR')
    },
    openInMatcher: function (mapping) {
      this.$router.push({
        path: '/',
        query: {
          facilityId: mapping.facilityId,
          qr: mapping.qr.raw || mapping.qr.code
        }
      })
    },
    removeMapping: function (mapping) {
      this.pendingDeleteMapping = mapping
      this.deleteModalVisible = true
    },
    cancelRemoveMapping: function () {
      this.pendingDeleteMapping = null
    },
    confirmRemoveMapping: function () {
      var self = this
      var mapping = this.pendingDeleteMapping

      this.pendingDeleteMapping = null
      if (!mapping) return

      deleteQrMappingFromNative(mapping)
        .then(function () {
          self.mappings = sortMappingsByRecent(
            self.mappings.filter(function (item) {
              return !(
                item.facilityId === mapping.facilityId &&
                getQrStoredValue(item.qr) === getQrStoredValue(mapping.qr)
              )
            })
          )
          self.reloadMessage = '기기 QR 저장소에서 삭제했습니다.'
          self.reloadError = ''
          vibrate(80)
        })
        .catch(function () {
          self.reloadError = 'QR 매칭 삭제에 실패했습니다.'
        })
    },
    exportMatchingCsv: function () {
      var self = this

      if (this.exportingCsv) return

      this.exportingCsv = true
      this.reloadError = ''
      requestExportCsv()
        .then(function () {
          self.reloadMessage = 'CSV 생성을 요청했습니다.'
          vibrate(80)
        })
        .catch(function () {
          self.reloadError = 'CSV 생성에 실패했습니다.'
        })
        .finally(function () {
          self.exportingCsv = false
        })
    }
  }
}
</script>

<style scoped>
.saved-page {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  color: #18181b;
}

.panel-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e4e4e7;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(24, 24, 27, 0.06);
}

.panel-header,
.mapping-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.panel-step {
  margin: 0 0 4px;
  color: #71717a;
  font-size: 12px;
  font-weight: 700;
}

.panel-title {
  margin: 0;
  font-size: 20px;
}

.summary-line {
  margin: 0;
  color: #52525b;
  font-size: 14px;
}

.field-label {
  display: block;
  color: #52525b;
  font-size: 14px;
  font-weight: 600;
}

.text-input {
  width: 100%;
  margin-top: 8px;
  padding: 12px 14px;
  border: 1px solid #d4d4d8;
  border-radius: 14px;
  background: #fff;
  color: #18181b;
  font-size: 14px;
}

.reload-message,
.reload-error {
  margin: 0;
  color: #52525b;
  font-size: 13px;
}

.reload-error {
  color: #3f3f46;
}

.ghost-button,
.accent-button,
.danger-button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
}

.ghost-button {
  background: #f4f4f5;
  color: #3f3f46;
}

.accent-button {
  background: #2563eb;
  color: #fff;
}

.danger-button {
  background: #f4f4f5;
  color: #52525b;
  border: 1px solid #d4d4d8;
}

.export-button {
  align-self: flex-end;
}

.accent-button[disabled] {
  opacity: 0.5;
}

.mapping-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mapping-row {
  align-items: stretch;
  border: 1px solid #e4e4e7;
  border-radius: 18px;
  background: #fff;
  padding: 14px 16px;
}

.mapping-main {
  flex: 1;
  cursor: pointer;
}

.mapping-main strong {
  display: block;
  margin-bottom: 6px;
}

.mapping-main p,
.updated-at {
  margin: 0 0 4px;
  color: #71717a;
  font-size: 13px;
}

.mapping-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.saved-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.saved-loading-overlay-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
}

.saved-loading-overlay-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 28px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
}

.saved-loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(37, 99, 235, 0.18);
  border-top-color: #2563eb;
  border-radius: 50%;
  animation: saved-spinner 0.9s linear infinite;
}

.saved-loading-text {
  margin: 0;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

@keyframes saved-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-list {
  border: 1px dashed #d4d4d8;
  border-radius: 18px;
  padding: 20px;
  color: #71717a;
  text-align: center;
}

.mono {
  font-family: Consolas, 'Courier New', monospace;
}

@media (max-width: 768px) {
  .saved-page {
    padding: 12px;
  }

  .panel-card {
    border-radius: 20px;
  }

  .panel-header,
  .mapping-row {
    flex-direction: column;
    align-items: stretch;
  }

  .mapping-actions {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
</style>
