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
          <button class="accent-button" type="button" :disabled="reloading" @click="reloadSavedMappings">
            다시 불러오기
          </button>
        </div>
      </div>

      <p class="summary-line">
        기기 QR 저장소에서 <strong>{{ mappings.length }}</strong>건을 불러왔습니다.
      </p>
      <p v-if="reloadMessage" class="reload-message">{{ reloadMessage }}</p>
      <p v-if="reloadError" class="reload-error">{{ reloadError }}</p>

      <div class="mapping-list">
        <div v-if="!mappings.length" class="empty-list">
          저장된 매칭이 없습니다. 매칭 화면에서 저장한 뒤 다시 불러오기를 눌러 주세요.
        </div>

        <div
          v-for="mapping in mappings"
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
            <button class="danger-button" type="button" @click="removeMapping(mapping)">삭제</button>
          </div>
        </div>
      </div>
    </section>

    <ScrollTopButton scroll-container=".saved-page" />

    <ConfirmModal
      :visible.sync="deleteModalVisible"
      title="매칭 삭제"
      message="선택한 매칭을 삭제할까요?"
      confirm-text="삭제"
      cancel-text="취소"
      @confirm="confirmRemoveMapping"
    />
  </div>
</template>

<script>
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ScrollTopButton from '@/components/common/ScrollTopButton.vue'
import { facilityRecordsFromCsvText } from '@/utils/facilityCsv'
import {
  DEV_FACILITY_CSV_NAME,
  loadPublicFacilityCsv
} from '@/utils/facilityCsvSource'
import { vibrate } from '@/utils/native'
import { getQrStoredValue } from '@/utils/qrMatcher'
import {
  deleteQrMappingFromNative,
  loadQrMappingsFromNative
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
      deleteModalVisible: false,
      pendingDeleteMapping: null
    }
  },
  mounted: function () {
    var self = this
    this.loadFacilityReference().finally(function () {
      self.reloadSavedMappings()
    })
  },
  methods: {
    loadFacilityReference: function () {
      var self = this

      return loadPublicFacilityCsv(DEV_FACILITY_CSV_NAME)
        .then(function (text) {
          self.facilities = facilityRecordsFromCsvText(text)
        })
        .catch(function () {
          self.facilities = []
        })
    },
    reloadSavedMappings: function () {
      var self = this

      this.reloading = true
      this.reloadError = ''
      loadQrMappingsFromNative(this.facilities)
        .then(function (mappings) {
          self.mappings = mappings
          self.reloadMessage = '기기 QR 저장소에서 저장된 매칭을 다시 불러왔습니다.'
        })
        .catch(function () {
          self.reloadError = '저장된 QR 매칭을 불러오지 못했습니다.'
        })
        .finally(function () {
          self.reloading = false
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
    confirmRemoveMapping: function () {
      var self = this
      var mapping = this.pendingDeleteMapping

      this.pendingDeleteMapping = null
      if (!mapping) return

      deleteQrMappingFromNative(mapping)
        .then(function () {
          self.mappings = self.mappings.filter(function (item) {
            return !(
              item.facilityId === mapping.facilityId &&
              getQrStoredValue(item.qr) === getQrStoredValue(mapping.qr)
            )
          })
          self.reloadMessage = '기기 QR 저장소에서 삭제했습니다.'
          self.reloadError = ''
          vibrate(80)
        })
        .catch(function () {
          self.reloadError = 'QR 매칭 삭제에 실패했습니다.'
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
