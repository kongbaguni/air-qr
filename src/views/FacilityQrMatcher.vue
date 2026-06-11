<template>
  <div class="matcher-page" infinite-wrapper>
    <section class="workspace-stack">
      <article class="panel-card compact">
        <div class="panel-header">
          <div>
            <p class="panel-step">QR 확인</p>
            <h2 class="panel-title">QR 스캔</h2>
          </div>
          <div class="panel-header-actions">
            <router-link class="ghost-button" to="/saved-mappings">저장 목록</router-link>
            <button class="accent-button" type="button" @click="startQrScan">네이티브 QR 스캔</button>
          </div>
        </div>

        <div class="inline-status-grid">
          <div class="status-chip" :class="{ active: selectedFacilityCount > 0 }">
            <span class="status-chip-label">시설</span>
            <strong>{{ selectedFacilityStatusLabel }}</strong>
          </div>
          <div class="status-chip" :class="{ active: parsedQr.isValid }">
            <span class="status-chip-label">QR</span>
            <strong>{{ parsedQr.isValid ? parsedQr.code : '미스캔' }}</strong>
          </div>
        </div>

        <label class="field-label">
          QR 원문
          <div class="readonly-value mono" :class="{ empty: !qrInput }">
            {{ qrInput || 'QR 코드 값이 비어 있습니다.' }}
          </div>
        </label>

        <div v-if="qrInput" class="qr-status" :class="{ invalid: !parsedQr.isValid }">
          <template v-if="parsedQr.isValid">
            <p><strong>QR 코드:</strong> <span class="mono">{{ parsedQr.code }}</span></p>
          </template>
          <template v-else><p>{{ parsedQr.reason }}</p></template>
        </div>

        <div class="binding-card">
          <div>
            <p class="selected-label">현재 매칭 대상</p>
            <strong class="selected-name">{{ selectedFacilityBindingLabel }}</strong>
            <p class="selected-meta mono">
              {{ parsedQr.isValid ? parsedQr.code : 'QR 미입력' }}
            </p>
          </div>
        </div>

        <button class="save-button flow-save" type="button" :disabled="!canSaveMapping" @click="saveCurrentMapping">
          {{ saveMappingButtonLabel }}
        </button>

        <div class="conflict-box" v-if="facilityConflicts.length">
          <p v-for="conflict in facilityConflicts" :key="conflict.facilityId">
            <strong>{{ conflict.facilityName }}</strong> 은(는) 이미
            <strong>{{ conflict.qr.code }}</strong> 와 연결되어 있습니다.
          </p>
          <p>저장하면 선택한 시설의 기존 연결은 새 QR로 교체됩니다.</p>
        </div>

        <p class="saved-page-hint">
          저장한 매칭은 <router-link to="/saved-mappings">저장 목록</router-link>에서 다시 불러와 확인할 수 있습니다.
        </p>

      </article>

            <article class="panel-card compact">
        <div class="panel-header">
          <div>
            <p class="panel-step">시설 찾기</p>
            <h2 class="panel-title">시설 선택</h2>
          </div>
          <button class="ghost-button" type="button" @click="resetFacilityFilters">필터 초기화</button>
        </div>

        <label class="field-label field-label--search">
          {{ facilitySearchLabel }}
          <input
            ref="facilitySearchInput"
            v-model.trim="queryInput"
            class="text-input"
            type="search"
            enterkeyhint="search"
            autocomplete="off"
            :placeholder="facilitySearchPlaceholder"
            @focus="onFacilitySearchFocus"
            @input="onSearchInput"
          />
        </label>

        <label class="toggle-row">
          <input v-model="showMatchedFacilities" type="checkbox" class="toggle-checkbox" />
          <span>매칭된 것도 보기</span>
        </label>

        <p v-if="facilitiesLoading" class="dev-csv-hint loading">시설 CSV 불러오는 중…</p>
        <p v-else-if="facilitiesLoadError" class="dev-csv-hint error">
          public CSV 로드 실패: {{ facilitiesLoadError }}
        </p>
        <p v-else-if="facilitiesDevNotice" class="dev-csv-hint ok">{{ facilitiesDevNotice }}</p>

        <div class="filter-mobile">
          <button
            class="filter-toggle"
            type="button"
            :aria-expanded="filterPanelOpen ? 'true' : 'false'"
            @click="toggleFilterPanel"
          >
            <span class="filter-toggle-main">
              <span class="filter-toggle-title">상세 필터</span>
              <span class="filter-toggle-meta">
                {{ filterPanelOpen ? '접기' : '열기' }}
                <span v-if="activeFilterCount" class="filter-toggle-count">{{ activeFilterCount }}</span>
              </span>
            </span>
            <span class="filter-toggle-chevron" :class="{ open: filterPanelOpen }" aria-hidden="true">⌄</span>
          </button>

          <div v-if="activeFilterChips.length" class="filter-chip-row">
            <button
              v-for="chip in activeFilterChips"
              :key="chip.key"
              type="button"
              class="filter-chip"
              @click="clearFilterChip(chip)"
            >
              <span class="filter-chip-label">{{ chip.label }}</span>
              <span class="filter-chip-remove" aria-hidden="true">×</span>
            </button>
          </div>

          <div v-show="filterPanelOpen" class="filter-panel">
            <div class="filter-axis-tabs" role="tablist" aria-label="필터 구분">
              <button
                type="button"
                class="filter-axis-tab"
                :class="{ active: filterAxis === 'f' }"
                role="tab"
                :aria-selected="filterAxis === 'f' ? 'true' : 'false'"
                @click="filterAxis = 'f'"
              >
                기능 F
              </button>
              <button
                type="button"
                class="filter-axis-tab"
                :class="{ active: filterAxis === 'l' }"
                role="tab"
                :aria-selected="filterAxis === 'l' ? 'true' : 'false'"
                @click="filterAxis = 'l'"
              >
                위치 L
              </button>
            </div>

            <div v-show="filterAxis === 'f'" class="filter-stack" role="tabpanel">
              <label v-if="showF1Filter" class="field-label field-label--compact">
                F1(대)
                <select v-model="selectedF1" class="text-input text-input--compact">
                  <option value="">전체</option>
                  <option v-for="option in f1Options" :key="'f1-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showF2Filter" class="field-label field-label--compact">
                F2(중)
                <select
                  v-model="selectedF2"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in f2Options" :key="'f2-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showF3Filter" class="field-label field-label--compact">
                F3(소)
                <select
                  v-model="selectedF3"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in f3Options" :key="'f3-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showF4Filter" class="field-label field-label--compact">
                F4(세)
                <select
                  v-model="selectedF4"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in f4Options" :key="'f4-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <p v-if="!hasVisibleFFilters" class="filter-empty-hint">
                선택 가능한 기능 필터가 없습니다.
              </p>
            </div>

            <div v-show="filterAxis === 'l'" class="filter-stack" role="tabpanel">
              <label v-if="showL2Filter" class="field-label field-label--compact">
                L2(단지)
                <select
                  v-model="selectedL2"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in l2Options" :key="'l2-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showL3Filter" class="field-label field-label--compact">
                L3(건물)
                <select
                  v-model="selectedL3"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in l3Options" :key="'l3-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showL4Filter" class="field-label field-label--compact">
                L4(층)
                <select
                  v-model="selectedL4"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in l4Options" :key="'l4-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showL5Filter" class="field-label field-label--compact">
                L5(섹터)
                <select
                  v-model="selectedL5"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in l5Options" :key="'l5-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showL6Filter" class="field-label field-label--compact">
                L6(룸)
                <select
                  v-model="selectedL6"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in l6Options" :key="'l6-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <label v-if="showL7Filter" class="field-label field-label--compact">
                L7(상세)
                <select
                  v-model="selectedL7"
                  class="text-input text-input--compact"
                >
                  <option value="">전체</option>
                  <option v-for="option in l7Options" :key="'l7-' + option" :value="option">{{ option }}</option>
                </select>
              </label>
              <p v-if="!hasVisibleLFilters" class="filter-empty-hint">
                선택 가능한 위치 필터가 없습니다. 기능(F) 필터를 먼저 조정해 보세요.
              </p>
            </div>
          </div>
        </div>

        <div v-if="selectedFacilityCount" class="selected-card">
          <div class="selected-card-head">
            <div>
              <p class="selected-label">선택된 시설 {{ selectedFacilityCount }}건</p>
              <p class="selected-meta">{{ selectedFacilityMetaLabel }}</p>
            </div>
            <button class="ghost-button" type="button" @click="clearFacilitySelection">전체 해제</button>
          </div>
          <ul class="selected-multi-list">
            <li
              v-for="facility in selectedFacilities"
              :key="facility.id"
              class="selected-multi-row"
            >
              <div class="selected-multi-main">
                <strong>{{ displayFacilityName(facility) }}</strong>
                <p class="selected-meta">
                  {{ displayFacilityNumber(facility) || '—' }} · {{ facility.id }} ·
                  {{ displayFChainSummary(facility) }}
                </p>
                <p v-if="getFacilityMapping(facility.id)" class="selected-meta mono">
                  {{ getFacilityMapping(facility.id).qr.code }}
                </p>
              </div>
              <button class="ghost-button" type="button" @click="removeSelectedFacility(facility.id)">
                해제
              </button>
            </li>
          </ul>
        </div>

        <div class="list-header">
          <span>검색 결과 {{ filteredFacilities.length }}건</span>
          <span v-if="selectedFacilityCount">선택 {{ selectedFacilityCount }}건</span>
          <span v-if="hasMoreFacilitiesToLoad">
            {{ visibleFacilities.length }}건 표시 · 스크롤 시 더 불러옴
          </span>
        </div>

        <div class="facility-list">
          <button
            v-for="facility in visibleFacilities"
            :key="facility.id"
            type="button"
            class="facility-row"
            :class="{ active: isFacilitySelected(facility.id) }"
            @click="toggleFacilitySelection(facility)"
          >
            <span class="facility-select-mark" :class="{ checked: isFacilitySelected(facility.id) }" aria-hidden="true">
              {{ isFacilitySelected(facility.id) ? '✓' : '' }}
            </span>
            <span class="facility-main">
              <span class="facility-title-row">
                <strong>{{ displayFacilityName(facility) }}</strong>
                <span
                  class="status-badge"
                  :class="getFacilityMapping(facility.id) ? 'matched' : 'unmatched'"
                >
                  {{ getFacilityMapping(facility.id) ? 'QR 매칭됨' : '미매칭' }}
                </span>
              </span>
              <small>{{ displayFacilityNumber(facility) || '—' }} · {{ facility.id }} · {{ displayLChainSummary(facility) }}</small>
            </span>
            <span class="facility-side">{{ displayFacilitySide(facility) }}</span>
          </button>

          <div v-if="!filteredFacilities.length" class="empty-list">
            검색 조건에 맞는 시설이 없습니다. CSV 데이터나 필터 조합을 확인하세요.
          </div>

          <infinite-loading
            v-if="showFacilityInfiniteLoading"
            force-use-infinite-wrapper
            :identifier="infiniteId"
            @infinite="onInfiniteFacilityList"
          >
            <span slot="no-more" class="infinite-slot-hidden" />
            <span slot="no-results" class="infinite-slot-hidden" />
            <span slot="error" class="infinite-slot-hidden" />
          </infinite-loading>
        </div>
      </article>

<section class="bottom-stats">
        <div class="stat-box">
          <span class="stat-label">시설 수</span>
          <strong class="stat-value">{{ facilityCount }}</strong>
        </div>
        <router-link class="stat-box stat-box-link" to="/saved-mappings">
          <span class="stat-label">저장 매칭</span>
          <strong class="stat-value">{{ mappings.length }}</strong>
        </router-link>
      </section>
    </section>

    <ScrollTopButton scroll-container=".matcher-page" />

    <ConfirmModal
      :visible.sync="confirmModalVisible"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      confirm-text="확인"
      cancel-text="취소"
      @confirm="handleConfirmModalConfirm"
    />

    <ConfirmModal
      :visible.sync="noticeModalVisible"
      :title="noticeModalTitle"
      :message="noticeModalMessage"
      :show-cancel="false"
      confirm-text="확인"
    />
  </div>
</template>

<script>
import debounce from 'lodash.debounce'
import InfiniteLoading from 'vue-infinite-loading'
import { scrollFocusedFieldIntoView } from '@/utils/helpers'
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import ScrollTopButton from '@/components/common/ScrollTopButton.vue'
import {
  buildMappingIndex,
  buildPoolAfterF,
  filterFacilities,
  getF2Options,
  getF3Options,
  getF4Options,
  getL2Options,
  getL3Options,
  getL4Options,
  getL5Options,
  getL6Options,
  getL7Options,
  getFacilityF1,
  getFacilityF2,
  getFacilityF3,
  getFacilityF4,
  getFacilityL2,
  getFacilityL3,
  getFacilityL4,
  getFacilityL5,
  getFacilityL6,
  getFacilityL7,
  getFacilitySpecName,
  getFacilitySpecNumber,
  hasExplicitFacilityFilter,
  invalidateFilterCache,
  isClassifiedFilterValue,
  resolveFacilitiesByIds,
  hydrateMappingsWithCatalog
} from '@/utils/facilityIndex'
import {
  DEV_FACILITY_CSV_NAME,
  loadFacilityCatalog,
  setFacilityCatalogFromCsvText
} from '@/utils/facilityStore'
import {
  extractResponsePayload,
  isNativeBridgeAvailable,
  qrScan,
  vibrate
} from '@/utils/native'
import {
  loadMergedMappings,
  saveQrMappingsToNative
} from '@/utils/qrNativeStorage'
import {
  createMapping,
  getQrStoredValue,
  normalizeText,
  normalizeQrReturnString,
  parseQrInput
} from '@/utils/qrMatcher'

var SCAN_CALLBACK_NAME = '__facilityQrScanCallback__'
var DEV_QR_SCAN_FALLBACK = 'IFAC001'
var FACILITY_LIST_PAGE_SIZE = 40
var FACILITY_LIST_INITIAL_BROWSE = 5
var SEARCH_DEBOUNCE_MS = 300

export default {
  name: 'FacilityQrMatcher',
  components: {
    ConfirmModal,
    ScrollTopButton,
    InfiniteLoading
  },
  data() {
    return {
      catalog: null,
      mappingByFacilityId: Object.create(null),
      mappings: [],
      queryInput: '',
      query: '',
      listLimit: FACILITY_LIST_INITIAL_BROWSE,
      infiniteId: 0,
      resetTapCount: 0,
      resetTapTimer: null,
      selectedF1: '',
      selectedF2: '',
      selectedF3: '',
      selectedF4: '',
      selectedL2: '',
      selectedL3: '',
      selectedL4: '',
      selectedL5: '',
      selectedL6: '',
      selectedL7: '',
      selectedFacilityIds: [],
      showMatchedFacilities: false,
      qrInput: '',
      facilitiesLoading: false,
      facilitiesLoadError: '',
      facilitiesDevNotice: '',
      filterPanelOpen: false,
      filterAxis: 'f',
      confirmModalVisible: false,
      confirmModalTitle: '',
      confirmModalMessage: '',
      confirmModalAction: null,
      noticeModalVisible: false,
      noticeModalTitle: '',
      noticeModalMessage: ''
    }
  },
  computed: {
    facilities() {
      return this.catalog ? this.catalog.list : []
    },
    facilityCount() {
      return this.catalog ? this.catalog.count : 0
    },
    filterState() {
      return {
        query: this.query,
        selectedF1: this.selectedF1,
        selectedF2: this.selectedF2,
        selectedF3: this.selectedF3,
        selectedF4: this.selectedF4,
        selectedL2: this.selectedL2,
        selectedL3: this.selectedL3,
        selectedL4: this.selectedL4,
        selectedL5: this.selectedL5,
        selectedL6: this.selectedL6,
        selectedL7: this.selectedL7,
        showMatchedFacilities: this.showMatchedFacilities
      }
    },
    fFilterState() {
      return {
        selectedF1: this.selectedF1,
        selectedF2: this.selectedF2,
        selectedF3: this.selectedF3,
        selectedF4: this.selectedF4
      }
    },
    poolAfterF() {
      if (!this.catalog) return []
      return buildPoolAfterF(this.catalog, this.fFilterState)
    },
    f1Options() {
      return this.catalog ? this.catalog.f1Options : []
    },
    f2Options() {
      if (!this.catalog || !this.selectedF1) return []
      return getF2Options(this.catalog, this.selectedF1)
    },
    f3Options() {
      if (!this.catalog || !this.selectedF2) return []
      return getF3Options(this.catalog, this.selectedF1, this.selectedF2)
    },
    f4Options() {
      if (!this.catalog || !this.selectedF3) return []
      return getF4Options(this.catalog, this.selectedF1, this.selectedF2, this.selectedF3)
    },
    showF1Filter() {
      return this.f1Options.length > 0
    },
    showF2Filter() {
      return !!this.selectedF1 && this.f2Options.length > 0
    },
    showF3Filter() {
      return !!this.selectedF2 && this.f3Options.length > 0
    },
    showF4Filter() {
      return !!this.selectedF3 && this.f4Options.length > 0
    },
    hasVisibleFFilters() {
      return (
        this.showF1Filter ||
        this.showF2Filter ||
        this.showF3Filter ||
        this.showF4Filter
      )
    },
    l2Options() {
      return getL2Options(this.poolAfterF)
    },
    l3Options() {
      return getL3Options(this.poolAfterF, this.selectedL2)
    },
    l4Options() {
      return getL4Options(this.poolAfterF, this.filterState)
    },
    l5Options() {
      return getL5Options(this.poolAfterF, this.filterState)
    },
    l6Options() {
      return getL6Options(this.poolAfterF, this.filterState)
    },
    l7Options() {
      return getL7Options(this.poolAfterF, this.filterState)
    },
    showL2Filter() {
      return this.l2Options.length > 0
    },
    showL3Filter() {
      return !!this.selectedL2 && this.l3Options.length > 0
    },
    showL4Filter() {
      return !!this.selectedL3 && this.l4Options.length > 0
    },
    showL5Filter() {
      return !!this.selectedL4 && this.l5Options.length > 0
    },
    showL6Filter() {
      return !!this.selectedL5 && this.l6Options.length > 0
    },
    showL7Filter() {
      return !!this.selectedL6 && this.l7Options.length > 0
    },
    hasVisibleLFilters() {
      return (
        this.showL2Filter ||
        this.showL3Filter ||
        this.showL4Filter ||
        this.showL5Filter ||
        this.showL6Filter ||
        this.showL7Filter
      )
    },
    filteredFacilities() {
      if (!this.catalog) return []
      return filterFacilities(this.catalog, this.filterState, this.mappingByFacilityId)
    },
    visibleFacilities() {
      return this.filteredFacilities.slice(0, this.listLimit)
    },
    hasMoreFacilitiesToLoad() {
      return this.visibleFacilities.length < this.filteredFacilities.length
    },
    showFacilityInfiniteLoading() {
      return (
        !!this.catalog &&
        this.filteredFacilities.length > 0 &&
        this.listLimit < this.filteredFacilities.length
      )
    },
    listFilterKey() {
      return [
        this.query,
        this.selectedF1,
        this.selectedF2,
        this.selectedF3,
        this.selectedF4,
        this.selectedL2,
        this.selectedL3,
        this.selectedL4,
        this.selectedL5,
        this.selectedL6,
        this.selectedL7,
        this.showMatchedFacilities ? '1' : '0',
        this.mappings.length
      ].join('\x1e')
    },
    selectedFacilities() {
      if (!this.catalog) return []
      return resolveFacilitiesByIds(this.catalog, this.selectedFacilityIds)
    },
    selectedFacilityCount() {
      return this.selectedFacilityIds.length
    },
    isSpecNameMatchMode() {
      return !!(this.catalog && this.catalog.matchMode === 'specName')
    },
    isSouIdMatchMode() {
      return !!(this.catalog && this.catalog.matchMode === 'souId')
    },
    facilitySearchLabel() {
      // 검색은 기존과 동일 — 이름·현장관리번호 기준
      return this.isSpecNameMatchMode
        ? '시설명칭 검색'
        : '시설명칭 · 현장관리번호 검색'
    },
    facilitySearchPlaceholder() {
      return this.isSpecNameMatchMode
        ? '시설명칭으로 검색'
        : '시설명칭 또는 현장관리번호로 검색'
    },
    selectedFacilityMetaLabel() {
      // [이번 빌드] QR 매칭 키 = SOU_ID + qrcode
      if (this.isSouIdMatchMode) {
        return '목록에서 고른 시설의 SOU_ID에 동일 QR을 등록합니다.'
      }
      // 기존: 시설명칭 또는 현장관리번호 기준
      return this.isSpecNameMatchMode
        ? '목록에서 고른 시설명칭에 동일 QR을 등록합니다.'
        : '목록에서 고른 현장관리번호에 동일 QR을 등록합니다.'
    },
    selectedFacilityStatusLabel() {
      if (!this.selectedFacilityCount) return '미선택'
      if (this.selectedFacilityCount === 1) {
        return this.displayFacilityName(this.selectedFacilities[0])
      }
      return this.selectedFacilityCount + '개 시설'
    },
    selectedFacilityBindingLabel() {
      if (!this.selectedFacilityCount) return '시설 미선택'
      if (this.selectedFacilityCount === 1) {
        return this.displayFacilityName(this.selectedFacilities[0])
      }
      return (
        this.displayFacilityName(this.selectedFacilities[0]) +
        ' 외 ' +
        (this.selectedFacilityCount - 1) +
        '건'
      )
    },
    saveMappingButtonLabel() {
      if (!this.selectedFacilityCount) return '매칭 저장'
      return this.selectedFacilityCount + '개 시설 QR 등록'
    },
    parsedQr() {
      return parseQrInput(this.qrInput)
    },
    facilityConflicts() {
      if (!this.parsedQr.isValid || !this.selectedFacilityCount) return []

      var conflicts = []
      var selectedIdSet = {}
      var i
      var mapping

      for (i = 0; i < this.selectedFacilityIds.length; i += 1) {
        selectedIdSet[this.selectedFacilityIds[i]] = true
      }

      for (i = 0; i < this.mappings.length; i += 1) {
        mapping = this.mappings[i]
        if (!selectedIdSet[mapping.facilityId]) continue
        if (mapping.qr && getQrStoredValue(mapping.qr) !== getQrStoredValue(this.parsedQr)) {
          conflicts.push(mapping)
        }
      }

      return conflicts
    },
    canSaveMapping() {
      return this.selectedFacilityCount > 0 && this.parsedQr.isValid
    },
    activeFilterChips() {
      var chips = []
      var self = this
      var push = function(key, prefix, value) {
        if (!isClassifiedFilterValue(value)) return
        chips.push({
          key: key,
          label: prefix + ' · ' + self.truncateFilterValue(value, 18)
        })
      }

      push('f1', 'F1', this.selectedF1)
      push('f2', 'F2', this.selectedF2)
      push('f3', 'F3', this.selectedF3)
      push('f4', 'F4', this.selectedF4)
      push('l2', 'L2', this.selectedL2)
      push('l3', 'L3', this.selectedL3)
      push('l4', 'L4', this.selectedL4)
      push('l5', 'L5', this.selectedL5)
      push('l6', 'L6', this.selectedL6)
      push('l7', 'L7', this.selectedL7)
      return chips
    },
    activeFilterCount() {
      return this.activeFilterChips.length
    },
    selectedIdLookup() {
      var lookup = Object.create(null)
      var i

      for (i = 0; i < this.selectedFacilityIds.length; i += 1) {
        lookup[this.selectedFacilityIds[i]] = true
      }

      return lookup
    }
  },
  watch: {
    listFilterKey: function() {
      this.resetListPagination()
    },
    'filteredFacilities.length': function(length) {
      if (!length) {
        this.infiniteId += 1
      }
    },
    selectedF1() {
      this.selectedF2 = ''
      this.selectedF3 = ''
      this.selectedF4 = ''
      this.clearLSelections()
    },
    selectedF2() {
      this.selectedF3 = ''
      this.selectedF4 = ''
      this.clearLSelections()
    },
    selectedF3() {
      this.selectedF4 = ''
      this.clearLSelections()
    },
    selectedF4() {
      this.clearLSelections()
    },
    selectedL2() {
      this.selectedL3 = ''
      this.selectedL4 = ''
      this.selectedL5 = ''
      this.selectedL6 = ''
      this.selectedL7 = ''
    },
    selectedL3() {
      this.selectedL4 = ''
      this.selectedL5 = ''
      this.selectedL6 = ''
      this.selectedL7 = ''
    },
    selectedL4() {
      this.selectedL5 = ''
      this.selectedL6 = ''
      this.selectedL7 = ''
    },
    selectedL5() {
      this.selectedL6 = ''
      this.selectedL7 = ''
    },
    selectedL6() {
      this.selectedL7 = ''
    },
    f2Options(next) {
      if (next.indexOf(this.selectedF2) === -1) this.selectedF2 = ''
    },
    f3Options(next) {
      if (next.indexOf(this.selectedF3) === -1) this.selectedF3 = ''
    },
    f4Options(next) {
      if (next.indexOf(this.selectedF4) === -1) this.selectedF4 = ''
    },
    l2Options(next) {
      if (next.indexOf(this.selectedL2) === -1) this.selectedL2 = ''
    },
    l3Options(next) {
      if (next.indexOf(this.selectedL3) === -1) this.selectedL3 = ''
    },
    l4Options(next) {
      if (next.indexOf(this.selectedL4) === -1) this.selectedL4 = ''
    },
    l5Options(next) {
      if (next.indexOf(this.selectedL5) === -1) this.selectedL5 = ''
    },
    l6Options(next) {
      if (next.indexOf(this.selectedL6) === -1) this.selectedL6 = ''
    },
    l7Options(next) {
      if (next.indexOf(this.selectedL7) === -1) this.selectedL7 = ''
    },
    '$route.path': function (path) {
      if (path === '/' && this.facilityCount) {
        this.refreshMappingsFromNative()
      }
    },
    '$route.query': function () {
      this.applyMatcherRoutePrefill()
    }
  },
  created: function() {
    this.debouncedCommitQuery = debounce(this.commitSearchQuery, SEARCH_DEBOUNCE_MS)
  },
  mounted() {
    var self = this

    window.__applyFacilityCsv = function(text, sourceLabel) {
      return self.setFacilitiesFromCsvText(text, sourceLabel || '네이티브 CSV')
    }

    this.loadDevFacilityCsv()
    this.applyMatcherRoutePrefill()
  },
  beforeDestroy() {
    if (window.__applyFacilityCsv) {
      delete window.__applyFacilityCsv
    }
    if (window[SCAN_CALLBACK_NAME]) {
      delete window[SCAN_CALLBACK_NAME]
    }
    if (this.resetTapTimer) {
      clearTimeout(this.resetTapTimer)
      this.resetTapTimer = null
    }
    if (this.debouncedCommitQuery && this.debouncedCommitQuery.cancel) {
      this.debouncedCommitQuery.cancel()
    }
  },
  methods: {
    onFacilitySearchFocus: function() {
      var self = this

      this.$nextTick(function() {
        var input = self.$refs.facilitySearchInput
        if (!input) return

        scrollFocusedFieldIntoView(input, {
          scrollContainer: '.matcher-page',
          keyboardPadding: 112
        })
      })
    },
    onSearchInput: function() {
      if (!String(this.queryInput || '').trim()) {
        this.commitSearchQuery('')
      }
      if (this.debouncedCommitQuery) {
        this.debouncedCommitQuery(this.queryInput)
      }
    },
    commitSearchQuery: function(value) {
      var next = String(value || '').trim()
      if (this.query === next) return
      this.query = next
    },
    getInitialListLimit: function() {
      var normalizedQuery = normalizeText(this.query)

      if (!hasExplicitFacilityFilter(this.filterState, normalizedQuery)) {
        return FACILITY_LIST_INITIAL_BROWSE
      }
      return FACILITY_LIST_PAGE_SIZE
    },
    resetListPagination: function() {
      this.listLimit = this.getInitialListLimit()
      this.infiniteId += 1
    },
    onInfiniteFacilityList: function($state) {
      var total = this.filteredFacilities.length

      if (!total || this.listLimit >= total) {
        $state.complete()
        return
      }

      this.listLimit = Math.min(this.listLimit + FACILITY_LIST_PAGE_SIZE, total)

      var self = this
      this.$nextTick(function() {
        if (self.listLimit >= total) {
          $state.complete()
        } else {
          $state.loaded()
        }
      })
    },
    toggleFilterPanel() {
      this.filterPanelOpen = !this.filterPanelOpen
    },
    truncateFilterValue(value, max) {
      var text = String(value || '')
      if (text.length <= max) return text
      return text.slice(0, max - 1) + '…'
    },
    clearFilterChip(chip) {
      if (!chip || !chip.key) return

      switch (chip.key) {
        case 'f1':
          this.selectedF1 = ''
          break
        case 'f2':
          this.selectedF2 = ''
          break
        case 'f3':
          this.selectedF3 = ''
          break
        case 'f4':
          this.selectedF4 = ''
          break
        case 'l2':
          this.selectedL2 = ''
          break
        case 'l3':
          this.selectedL3 = ''
          break
        case 'l4':
          this.selectedL4 = ''
          break
        case 'l5':
          this.selectedL5 = ''
          break
        case 'l6':
          this.selectedL6 = ''
          break
        case 'l7':
          this.selectedL7 = ''
          break
        default:
          break
      }
    },
    clearLSelections() {
      this.selectedL2 = ''
      this.selectedL3 = ''
      this.selectedL4 = ''
      this.selectedL5 = ''
      this.selectedL6 = ''
      this.selectedL7 = ''
    },
    displayFacilityName(facility) {
      var name = getFacilitySpecName(facility) || facility.facilityName
      if (name) return name
      var mapping = this.getFacilityMapping(facility.id)
      if (mapping && mapping.facilityName) return mapping.facilityName
      return '—'
    },
    displayFacilityNumber(facility) {
      return getFacilitySpecNumber(facility)
    },
    displayFChainSummary(facility) {
      var parts = [
        getFacilityF1(facility),
        getFacilityF2(facility),
        getFacilityF3(facility),
        getFacilityF4(facility)
      ].filter(isClassifiedFilterValue)
      return parts.length ? parts.join(' > ') : '—'
    },
    displayLChainSummary(facility) {
      var parts = [
        getFacilityL2(facility),
        getFacilityL3(facility),
        getFacilityL4(facility),
        getFacilityL5(facility),
        getFacilityL6(facility),
        getFacilityL7(facility)
      ].filter(isClassifiedFilterValue)
      return parts.length ? parts.join(' · ') : '—'
    },
    displayFacilitySide(facility) {
      return this.displayFChainSummary(facility)
    },
    loadDevFacilityCsv() {
      var self = this

      this.facilitiesLoading = true
      this.facilitiesLoadError = ''
      this.facilitiesDevNotice = ''

      loadFacilityCatalog(DEV_FACILITY_CSV_NAME)
        .then(function(result) {
          if (!self.setFacilitiesFromCsvText(null, result.sourceLabel, result.catalog)) {
            self.clearFacilityData()
          }
        })
        .catch(function(err) {
          self.facilitiesLoadError = err && err.message ? err.message : String(err)
          self.facilitiesDevNotice = ''
          self.clearFacilityData()
        })
        .finally(function() {
          self.facilitiesLoading = false
        })
    },
    clearFacilityData() {
      this.catalog = null
      this.mappingByFacilityId = Object.create(null)
      this.mappings = []
      this.selectedFacilityIds = []
      invalidateFilterCache()
    },
    applyMappings(mappings) {
      var list = mappings || []
      if (this.catalog) {
        list = hydrateMappingsWithCatalog(this.catalog, list)
      }
      this.mappings = list
      this.mappingByFacilityId = buildMappingIndex(this.mappings)
      invalidateFilterCache()
    },
    scheduleMappingsLoad() {
      var self = this

      if (!this.catalog) return

      setTimeout(function() {
        loadMergedMappings(self.catalog)
          .then(function(mappings) {
            self.applyMappings(mappings)
          })
          .catch(function() {
            self.applyMappings([])
          })
      }, 0)
    },
    /**
     * 네이티브 브릿지에서 CSV 전체 텍스트를 넘길 때 사용 (UTF-8).
     * 예: window.__applyFacilityCsv && window.__applyFacilityCsv(text)
     */
    setFacilitiesFromCsvText(csvText, sourceLabel, existingCatalog) {
      var catalog = existingCatalog

      try {
        if (!catalog) {
          catalog = setFacilityCatalogFromCsvText(csvText, sourceLabel)
        }

        this.catalog = catalog
        this.selectedFacilityIds = []
        this.facilitiesLoadError = ''
        this.facilitiesDevNotice =
          (sourceLabel || '시설 CSV') + ' · ' + catalog.count + '건 반영됨'
        this.applyMappings([])
        this.scheduleMappingsLoad()
        return true
      } catch (e) {
        this.facilitiesLoadError = e && e.message ? e.message : String(e)
        this.facilitiesDevNotice = ''
        return false
      }
    },
    refreshMappingsFromNative() {
      var self = this

      if (!this.catalog) return

      loadMergedMappings(this.catalog)
        .then(function(mappings) {
          self.applyMappings(mappings)
        })
        .catch(function() {
          self.applyMappings([])
        })
    },
    hasMappingForFacility(facilityId) {
      return !!this.mappingByFacilityId[facilityId]
    },
    getFacilityMapping(facilityId) {
      return this.mappingByFacilityId[facilityId] || null
    },
    isFacilitySelected(facilityId) {
      return !!this.selectedIdLookup[facilityId]
    },
    toggleFacilitySelection(facility) {
      var id = facility.id
      var index = this.selectedFacilityIds.indexOf(id)

      if (index === -1) {
        this.selectedFacilityIds = this.selectedFacilityIds.concat([id])
        return
      }

      this.selectedFacilityIds = this.selectedFacilityIds
        .slice(0, index)
        .concat(this.selectedFacilityIds.slice(index + 1))
    },
    removeSelectedFacility(facilityId) {
      var index = this.selectedFacilityIds.indexOf(facilityId)
      if (index === -1) return

      this.selectedFacilityIds = this.selectedFacilityIds
        .slice(0, index)
        .concat(this.selectedFacilityIds.slice(index + 1))
    },
    clearFacilitySelection() {
      this.selectedFacilityIds = []
    },
    resetFacilityFilters() {
      this.trackResetTap()
      if (this.debouncedCommitQuery && this.debouncedCommitQuery.cancel) {
        this.debouncedCommitQuery.cancel()
      }
      this.queryInput = ''
      this.query = ''
      this.resetListPagination()
      this.selectedF1 = ''
      this.selectedF2 = ''
      this.selectedF3 = ''
      this.selectedF4 = ''
      this.clearLSelections()
      this.filterPanelOpen = false
      this.filterAxis = 'f'
    },
    trackResetTap() {
      var self = this

      this.resetTapCount += 1

      if (this.resetTapTimer) {
        clearTimeout(this.resetTapTimer)
      }

      this.resetTapTimer = setTimeout(function() {
        self.resetTapCount = 0
        self.resetTapTimer = null
      }, 2500)

      if (this.resetTapCount >= 5) {
        this.resetTapCount = 0
        clearTimeout(this.resetTapTimer)
        this.resetTapTimer = null
        this.showNoticeModal('', '이재남 최고!')
      }
    },
    showNoticeModal(title, message) {
      this.noticeModalTitle = title || ''
      this.noticeModalMessage = message || ''
      this.noticeModalVisible = true
    },
    openConfirmModal(title, message, onConfirm) {
      this.confirmModalTitle = title || ''
      this.confirmModalMessage = message || ''
      this.confirmModalAction = onConfirm || null
      this.confirmModalVisible = true
    },
    handleConfirmModalConfirm() {
      if (typeof this.confirmModalAction === 'function') {
        this.confirmModalAction()
      }
      this.confirmModalAction = null
    },
    applyMatcherRoutePrefill() {
      var query = this.$route && this.$route.query ? this.$route.query : {}
      var facilityId = query.facilityId
      var qr = query.qr

      if (facilityId) {
        this.selectedFacilityIds = [String(facilityId)]
      }
      if (qr) {
        this.qrInput = normalizeQrReturnString(qr)
      }
    },
    startQrScan() {
      var self = this

      window[SCAN_CALLBACK_NAME] = function(result) {
        self.handleScanResult(result)
      }

      if (!isNativeBridgeAvailable()) {
        self.handleScanResult(DEV_QR_SCAN_FALLBACK)
        return
      }

      qrScan(SCAN_CALLBACK_NAME, '시설 QR 스캔')
    },
    handleScanResult(result) {
      var payload = extractResponsePayload(result)
      var value = ''

      if (typeof result === 'string') {
        value = result
      } else if (payload && typeof payload === 'object' && payload.value != null) {
        value = payload.value
      } else if (result && typeof result === 'object') {
        value = result.value || result.result || result.contents || result.payload || ''
      }

      this.qrInput = normalizeQrReturnString(value || '')
      if (this.qrInput) vibrate(80)
    },
    saveCurrentMapping() {
      if (!this.canSaveMapping) return

      if (this.facilityConflicts.length) {
        var self = this
        this.openConfirmModal(
          '매칭 교체',
          '선택한 시설 중 다른 QR과 연결된 항목이 있습니다.\n기존 매칭을 새 QR로 교체할까요?',
          function() {
            self.persistCurrentMapping()
          }
        )
        return
      }

      this.persistCurrentMapping()
    },
    persistCurrentMapping() {
      var self = this
      var selectedIdSet = {}
      var i
      var nextMappings = []
      var facility
      var mapping
      var mappingsToSave = []

      for (i = 0; i < this.selectedFacilityIds.length; i += 1) {
        selectedIdSet[this.selectedFacilityIds[i]] = true
      }

      for (i = 0; i < this.mappings.length; i += 1) {
        if (!selectedIdSet[this.mappings[i].facilityId]) {
          nextMappings.push(this.mappings[i])
        }
      }

      for (i = 0; i < this.selectedFacilities.length; i += 1) {
        facility = this.selectedFacilities[i]
        mapping = createMapping(facility, this.parsedQr, this.catalog)
        nextMappings.unshift(mapping)
        mappingsToSave.push(mapping)
      }

      saveQrMappingsToNative(mappingsToSave)
        .then(function() {
          self.applyMappings(nextMappings)
          vibrate(120)
          self.showNoticeModal(
            '저장 완료',
            mappingsToSave.length + '건의 QR 매칭을 저장했습니다.'
          )
        })
        .catch(function() {
          self.showNoticeModal('저장 실패', 'QR 매칭 저장에 실패했습니다.')
        })
    }
  }
}
</script>

<style scoped>
.matcher-page {
  height: 100%;
  overflow-y: auto;
  padding: 20px;
  color: #18181b;
}

.panel-card {
  border: 1px solid #e4e4e7;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(24, 24, 27, 0.06);
}

.inline-status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.flow-save {
  width: 100%;
  justify-content: center;
}

.status-chip {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  padding: 12px 14px;
  border-radius: 16px;
  background: #f4f4f5;
}

.status-chip.active {
  background: #eff6ff;
  border: 1px solid rgba(37, 99, 235, 0.18);
}

.status-chip strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.status-chip-label {
  color: #71717a;
  font-size: 11px;
  font-weight: 700;
}

.stat-box {
  padding: 16px;
  border-radius: 18px;
  background: #f4f4f5;
}

.stat-box-link {
  display: block;
  color: inherit;
  text-decoration: none;
}

.stat-label {
  display: block;
  margin-bottom: 6px;
  color: #71717a;
  font-size: 12px;
}

.stat-value {
  font-size: 20px;
}

.workspace-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.panel-card.compact {
  min-height: auto;
}

.panel-header,
.binding-card,
.list-header,
.mapping-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.filter-mobile {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e4e4e7;
  border-radius: 18px;
  background: #fafafa;
  padding: 12px;
}

.filter-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  border: 0;
  border-radius: 14px;
  background: #fff;
  padding: 12px 14px;
  color: #18181b;
  text-align: left;
}

.filter-toggle-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.filter-toggle-title {
  font-size: 14px;
  font-weight: 700;
}

.filter-toggle-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #71717a;
  font-size: 12px;
  font-weight: 600;
}

.filter-toggle-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #2563eb;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.filter-toggle-chevron {
  flex-shrink: 0;
  color: #71717a;
  font-size: 18px;
  line-height: 1;
  transition: transform 0.18s ease;
}

.filter-toggle-chevron.open {
  transform: rotate(180deg);
}

.filter-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  border: 1px solid #d4d4d8;
  border-radius: 999px;
  background: #fff;
  padding: 6px 10px;
  color: #3f3f46;
  font-size: 12px;
  font-weight: 600;
}

.filter-chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.filter-chip-remove {
  color: #a1a1aa;
  font-size: 14px;
  line-height: 1;
}

.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: min(52vh, 420px);
  overflow-y: auto;
  padding-right: 2px;
}

.filter-axis-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  border-radius: 14px;
  background: #f4f4f5;
}

.filter-axis-tab {
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 10px 12px;
  color: #71717a;
  font-size: 13px;
  font-weight: 700;
}

.filter-axis-tab.active {
  background: #fff;
  color: #2563eb;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.filter-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-empty-hint {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f4f4f5;
  color: #71717a;
  font-size: 12px;
  line-height: 1.45;
}

.field-label--compact {
  font-size: 12px;
}

.text-input--compact {
  margin-top: 6px;
  padding: 10px 12px;
  font-size: 14px;
  border-radius: 12px;
}

.dev-csv-hint {
  margin: 0;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.45;
}

.dev-csv-hint.loading {
  background: #f4f4f5;
  color: #52525b;
}

.dev-csv-hint.ok {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.15);
}

.dev-csv-hint.error {
  background: #f4f4f5;
  color: #52525b;
}

.panel-header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.saved-page-hint {
  margin: 0;
  color: #52525b;
  font-size: 13px;
}

.saved-page-hint a {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}

.panel-step,
.selected-label {
  margin: 0 0 4px;
  color: #71717a;
  font-size: 12px;
  font-weight: 700;
}

.panel-title {
  margin: 0;
  font-size: 20px;
}

.field-label {
  display: block;
  color: #52525b;
  font-size: 14px;
  font-weight: 600;
}

.field-label--search .text-input {
  scroll-margin-top: 72px;
  scroll-margin-bottom: min(40vh, 280px);
}

.toggle-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: #52525b;
  font-size: 14px;
  font-weight: 600;
}

.toggle-checkbox {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
}

.text-input {
  width: 100%;
  margin-top: 8px;
  border: 1px solid #d4d4d8;
  border-radius: 14px;
  background: #fafafa;
  padding: 14px 16px;
  color: #18181b;
  font-size: 15px;
}

.readonly-value {
  width: 100%;
  margin-top: 8px;
  border: 1px solid #d4d4d8;
  border-radius: 14px;
  background: #f4f4f5;
  padding: 14px 16px;
  color: #18181b;
  font-size: 15px;
  line-height: 1.5;
  word-break: break-all;
}

.readonly-value.empty {
  color: #a1a1aa;
}

.text-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}

.text-input[disabled] {
  background: #f4f4f5;
  color: #a1a1aa;
}

.ghost-button,
.accent-button,
.danger-button,
.save-button {
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

.accent-button,
.save-button {
  background: #2563eb;
  color: #fff;
}

.save-button[disabled] {
  opacity: 0.4;
}

.danger-button {
  background: #f4f4f5;
  color: #52525b;
  border: 1px solid #d4d4d8;
}

.selected-card,
.binding-card,
.qr-status,
.conflict-box {
  border-radius: 18px;
  padding: 16px;
}

.selected-card,
.binding-card {
  border: 1px solid #e4e4e7;
  background: #fafafa;
}

.selected-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.selected-card {
  margin-bottom: 12px;
}

.selected-multi-list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: min(28vh, 180px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.selected-multi-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #e4e4e7;
}

.selected-multi-main {
  flex: 1;
  min-width: 0;
}

.selected-multi-main strong {
  display: block;
  margin-bottom: 4px;
}

.selected-card.empty {
  background: #f4f4f5;
}

.selected-name {
  font-size: 18px;
}

.selected-title-row,
.facility-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.selected-meta,
.empty-text,
.mapping-main p,
.qr-status p,
.conflict-box p {
  margin: 0;
  color: #52525b;
  line-height: 1.5;
}

.list-header {
  color: #71717a;
  font-size: 13px;
}

.facility-list,
.mapping-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.facility-list {
  overflow: visible;
  padding-right: 0;
}

.facility-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  border: 1px solid #e4e4e7;
  border-radius: 18px;
  background: #fff;
  padding: 14px 16px;
  color: inherit;
  text-align: left;
}

.facility-row.active {
  border-color: #2563eb;
  background: #eff6ff;
}

.facility-select-mark {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  background: #fff;
  color: #2563eb;
  font-size: 14px;
  font-weight: 700;
}

.facility-select-mark.checked {
  border-color: #2563eb;
  background: #eff6ff;
}

.facility-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.status-badge.matched {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-badge.unmatched {
  background: #f4f4f5;
  color: #71717a;
}

.facility-main small,
.facility-side {
  color: #71717a;
}

.qr-status {
  background: #f4f4f5;
  color: #3f3f46;
}

.qr-status.invalid,
.conflict-box {
  background: #f4f4f5;
  color: #52525b;
}

.history-header {
  margin-top: 4px;
}

.export-message {
  margin: -4px 0 0;
  color: #52525b;
  font-size: 13px;
}

.bottom-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 8px;
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

.infinite-slot-hidden {
  display: none;
}

.facility-list >>> .infinite-loading-container {
  padding: 8px 0 16px;
}

.facility-list >>> .infinite-status-prompt {
  pointer-events: none;
}

.facility-list >>> .loading-spiral {
  width: 28px;
  height: 28px;
}

@media (max-width: 1024px) {
  .inline-status-grid,
  .bottom-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .matcher-page {
    padding: 12px;
  }

  .panel-card {
    border-radius: 20px;
  }

  .panel-card {
    min-height: auto;
  }

  .panel-header,
  .history-header,
  .binding-card,
  .mapping-row {
    flex-direction: column;
    align-items: stretch;
  }

  .mapping-actions {
    flex-direction: row;
  }
}
</style>
