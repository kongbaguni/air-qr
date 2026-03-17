/**
 * 오프라인 점검 데이터 localStorage 유틸리티
 * - 음영지역점검 데이터를 다운로드하여 로컬에 저장
 * - 오프라인 환경에서 저장된 데이터를 조회
 */

var STORAGE_PREFIX = 'shadow_inspection_'

var INSPECTION_TYPES = {
  routineCheck: {
    key: STORAGE_PREFIX + 'routine_check',
    label: '평상점검'
  },
  performanceCheck: {
    key: STORAGE_PREFIX + 'performance_check',
    label: '성능점검'
  },
  performanceVerification: {
    key: STORAGE_PREFIX + 'performance_verification',
    label: '성능확인점검'
  }
}

/**
 * 점검 데이터를 localStorage에 저장
 * @param {string} type - 점검 유형 (routineCheck | performanceCheck | performanceVerification)
 * @param {*} data - 저장할 데이터
 */
function saveInspectionData(type, data) {
  var config = INSPECTION_TYPES[type]
  if (!config) {
    console.warn('[offlineStorage] Unknown inspection type:', type)
    return false
  }
  try {
    var payload = {
      data: data,
      downloadedAt: new Date().toISOString(),
      type: type
    }
    localStorage.setItem(config.key, JSON.stringify(payload))
    return true
  } catch (e) {
    console.error('[offlineStorage] Failed to save:', e)
    return false
  }
}

/**
 * localStorage에서 점검 데이터 조회
 * @param {string} type - 점검 유형
 * @returns {object|null} { data, downloadedAt, type } 또는 null
 */
function getInspectionData(type) {
  var config = INSPECTION_TYPES[type]
  if (!config) return null
  try {
    var raw = localStorage.getItem(config.key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.error('[offlineStorage] Failed to read:', e)
    return null
  }
}

/**
 * localStorage에서 점검 데이터 삭제
 * @param {string} type - 점검 유형
 */
function removeInspectionData(type) {
  var config = INSPECTION_TYPES[type]
  if (!config) return false
  try {
    localStorage.removeItem(config.key)
    return true
  } catch (e) {
    console.error('[offlineStorage] Failed to remove:', e)
    return false
  }
}

/**
 * 다운로드된 점검 항목 목록 조회
 * @returns {Array} [{ type, label, downloadedAt, hasData }]
 */
function getDownloadedList() {
  var list = []
  var types = Object.keys(INSPECTION_TYPES)
  for (var i = 0; i < types.length; i++) {
    var type = types[i]
    var config = INSPECTION_TYPES[type]
    var stored = getInspectionData(type)
    list.push({
      type: type,
      label: config.label,
      downloadedAt: stored ? stored.downloadedAt : null,
      hasData: !!stored
    })
  }
  return list
}

/**
 * 현재 온라인 상태 확인
 * @returns {boolean}
 */
function isOnline() {
  return navigator.onLine
}

export {
  INSPECTION_TYPES,
  saveInspectionData,
  getInspectionData,
  removeInspectionData,
  getDownloadedList,
  isOnline
}
