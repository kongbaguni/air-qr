import { getFacilitySiteMgmtNo } from '@/utils/facilityCsv'
import { FORCE_QR_MATCH_MODE } from '@/config/facilityCsv.config'
import {
  getCatalogMatchMode,
  getFacilitySouId,
  getFacilitySpecName,
  getFacilitySpecNumber,
  getFacilityDisplayCategory,
  getFacilityDisplayLocation,
  getMappingStorageKey,
  getNativeKeyField,
  MATCH_MODE_SOU_ID,
  MATCH_MODE_SPEC_NAME
} from '@/utils/facilityIndex'
import {
  deleteQRData,
  exportCSV,
  extractResponsePayload,
  isNativeBridgeAvailable,
  isNativeSuccess,
  loadQRData,
  saveQRData
} from '@/utils/native'
import {
  createMapping,
  createSeedMappings,
  getQrStoredValue,
  mergeMappings,
  parseQrInput,
  sortMappingsByRecent
} from '@/utils/qrMatcher'

var QR_AUTHOR = 'qr-matcher'
var DEV_STORAGE_KEY = 'qr-matcher:dev-stored-mappings'
var DEV_MOCK_QR_CODE = 'IFAC_DEV_DELETE_TEST'
var QR_MAPPINGS_CHANGED_EVENT = 'qr-mappings-changed'
var callbackSeq = 0

function canUseDevStorage() {
  return !isNativeBridgeAvailable() && typeof window !== 'undefined' && !!window.localStorage
}

function readDevMappingsRaw() {
  if (!canUseDevStorage()) return null
  try {
    var raw = window.localStorage.getItem(DEV_STORAGE_KEY)
    if (!raw) return null
    var parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch (e) {
    return null
  }
}

function writeDevMappingsRaw(mappings) {
  if (!canUseDevStorage()) return
  window.localStorage.setItem(DEV_STORAGE_KEY, JSON.stringify(mappings || []))
}

function notifyQrMappingsChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(QR_MAPPINGS_CHANGED_EVENT))
}

function reviveStoredMapping(mapping) {
  if (!mapping) return null
  var qr = mapping.qr
  if (!qr || typeof qr !== 'object') {
    qr = parseQrInput(mapping.qrcode || mapping.qrCode || '')
  } else if (!qr.code && qr.raw) {
    qr = parseQrInput(qr.raw)
  }
  return Object.assign({}, mapping, { qr: qr })
}

function createDevMockMapping(catalogOrFacilities) {
  var catalog = resolveCatalog(catalogOrFacilities)
  var facilities = catalog.list || []
  var facility = null
  var i
  var parsedQr = parseQrInput(DEV_MOCK_QR_CODE)
  var savedAt = formatKstDateTime()

  for (i = 0; i < facilities.length; i += 1) {
    if (getFacilitySouId(facilities[i])) {
      facility = facilities[i]
      break
    }
  }
  if (!facility && facilities.length) facility = facilities[0]

  if (facility) {
    return Object.assign(createMapping(facility, parsedQr, catalog), {
      facilityName: '[목데이터] ' + (getFacilitySpecName(facility) || '삭제 테스트'),
      updatedAt: savedAt,
      dateTime: savedAt,
      isDevMock: true
    })
  }

  return {
    facilityId: 'DEV-MOCK-FACILITY',
    siteMgmtNo: '',
    matchKey: 'DEV-MOCK-SOU-ID',
    matchMode: getCatalogMatchMode(catalog),
    facilityName: '[목데이터] 삭제 테스트 시설',
    facilityNumber: 'DEV-MOCK-SOU-ID',
    category: '테스트',
    location: '브라우저 확인용',
    qr: parsedQr,
    updatedAt: savedAt,
    dateTime: savedAt,
    isDevMock: true
  }
}

function loadDevMappings(catalogOrFacilities) {
  var stored = readDevMappingsRaw()
  var list = []
  var i

  if (stored) {
    for (i = 0; i < stored.length; i += 1) {
      list.push(reviveStoredMapping(stored[i]))
    }
    return sortMappingsByRecent(list.filter(Boolean))
  }

  list = [createDevMockMapping(catalogOrFacilities)]
  writeDevMappingsRaw(list)
  return list
}

function saveDevMappings(mappings) {
  writeDevMappingsRaw(mappings || [])
}

function deleteDevMapping(mapping) {
  var current = readDevMappingsRaw() || []
  var targetQr = getQrStoredValue(mapping && mapping.qr)
  var targetFacilityId = mapping && mapping.facilityId
  var next = []

  for (var i = 0; i < current.length; i += 1) {
    var item = reviveStoredMapping(current[i])
    if (!item) continue
    if (targetFacilityId && item.facilityId !== targetFacilityId) {
      next.push(item)
      continue
    }
    if (getQrStoredValue(item.qr) !== targetQr) next.push(item)
  }

  saveDevMappings(next)
  return next
}

function nextCallbackName(prefix) {
  callbackSeq += 1
  return '__qrNative_' + prefix + '_' + callbackSeq + '__'
}

function registerNativeCallback(callbackName, handler) {
  window[callbackName] = function (result) {
    try {
      handler(result)
    } finally {
      if (window[callbackName]) {
        delete window[callbackName]
      }
    }
  }
}

function callNativeWithCallback(interfaceId, requestPayload, onSuccess, onError) {
  if (!isNativeBridgeAvailable()) {
    onError(new Error('Native bridge unavailable'))
    return
  }
  var callbackName = nextCallbackName(interfaceId)

  registerNativeCallback(callbackName, function (result) {
    if (!isNativeSuccess(result)) {
      onError(result || new Error(interfaceId + ' failed'))
      return
    }

    onSuccess(extractResponsePayload(result))
  })

  if (interfaceId === 'saveQRData') {
    saveQRData(requestPayload, callbackName)
    return
  }

  if (interfaceId === 'deleteQRData') {
    deleteQRData(requestPayload.author, requestPayload, callbackName)
    return
  }

  if (interfaceId === 'loadQRData') {
    loadQRData(requestPayload.author, requestPayload, callbackName)
    return
  }

  if (interfaceId === 'exportCSV') {
    exportCSV(callbackName)
    return
  }

  onError(new Error('Unsupported native interface: ' + interfaceId))
}

function indexFacilityKey(index, facility, key) {
  var normalized = key != null ? String(key).trim() : ''
  if (normalized) index[normalized] = facility
}

function buildFacilityIndex(facilities) {
  var index = {}
  var i
  var facility
  // var siteMgmtNo

  for (i = 0; i < (facilities || []).length; i += 1) {
    facility = facilities[i]
    // [이번 빌드] 네이티브 keyValue(SOU_ID) → 시설 조회용 인덱스
    indexFacilityKey(index, facility, getFacilitySouId(facility))
    indexFacilityKey(index, facility, facility['SOU_ID'])
    indexFacilityKey(index, facility, getFacilitySpecNumber(facility))
    indexFacilityKey(index, facility, facility.id)
    indexFacilityKey(index, facility, facility.eqNo)
    // 기존: 현장관리번호·시설명칭 기준 인덱스
    // siteMgmtNo = getFacilitySiteMgmtNo(facility)
    // indexFacilityKey(index, facility, siteMgmtNo)
    // indexFacilityKey(index, facility, getFacilitySpecName(facility))
    // indexFacilityKey(index, facility, facility['SOU_ID_임시시설번호'])
  }

  return index
}

function resolveCatalog(catalogOrFacilities) {
  if (catalogOrFacilities && catalogOrFacilities.list) return catalogOrFacilities
  return {
    list: catalogOrFacilities || [],
    // [이번 빌드] SOU_ID + qrcode
    matchMode: FORCE_QR_MATCH_MODE || MATCH_MODE_SOU_ID
    // 기존: matchMode: 'siteMgmtNo'
  }
}

function getMappingSiteMgmtNo(mapping) {
  return getMappingStorageKey(mapping)
}

function getMappingQrCode(mapping) {
  return getQrStoredValue(mapping && mapping.qr ? mapping.qr : null)
}

function formatKstDateTime(date) {
  var value = date instanceof Date ? date : new Date()
  return value.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })
}

function buildNativeQrPayload(mapping, matchMode) {
  return {
    author: QR_AUTHOR,
    qrcode: getMappingQrCode(mapping),
    sn: getMappingStorageKey(mapping),
    key: getNativeKeyField(matchMode),
    keyValue: getMappingStorageKey(mapping)
  }
}

function buildNativeSaveQrItem(mapping, matchMode) {
  return {
    key: getNativeKeyField(matchMode),
    keyValue: getMappingStorageKey(mapping),
    qrcode: getMappingQrCode(mapping)
  }
}

function dedupeMappingsForNativeSave(mappings, matchMode) {
  if (matchMode !== MATCH_MODE_SPEC_NAME) return mappings || []

  var byKey = Object.create(null)
  var list = mappings || []
  var i
  var key

  for (i = 0; i < list.length; i += 1) {
    key = getMappingStorageKey(list[i])
    if (!key) continue
    byKey[key] = list[i]
  }

  return Object.keys(byKey).map(function(k) {
    return byKey[k]
  })
}

function buildNativeSaveQrRequestPayload(mappings, matchMode) {
  var items = []
  var i
  var list = dedupeMappingsForNativeSave(mappings, matchMode)

  for (i = 0; i < list.length; i += 1) {
    items.push(buildNativeSaveQrItem(list[i], matchMode))
  }

  if (items.length === 1) return items[0]
  return items
}

function pickFacilityName(facility, facilityId) {
  if (!facility) return facilityId || ''
  return getFacilitySpecName(facility) || facilityId || ''
}

function nativeRecordsToMappings(records, catalogOrFacilities) {
  var catalog = resolveCatalog(catalogOrFacilities)
  var facilities = catalog.list || []
  var matchMode = getCatalogMatchMode(catalog)
  var facilityIndex = buildFacilityIndex(facilities)
  var list = []
  var i
  var record
  var facility
  var parsedQr
  var keyValue
  var recordMatchMode

  for (i = 0; i < (records || []).length; i += 1) {
    record = records[i] || {}
    keyValue = String(record.keyValue || record.sn || '').trim()
    // [이번 빌드] 네이티브 key=SOU_ID, keyValue=SOU_ID 값으로 시설 매칭
    recordMatchMode =
      record.key === 'SOU_ID'
        ? MATCH_MODE_SOU_ID
        : record.key === '시설명칭'
          ? MATCH_MODE_SPEC_NAME
          : matchMode
    facility = facilityIndex[keyValue] || null
    parsedQr = parseQrInput(record.qrcode)

    list.push({
      facilityId: facility ? facility.id : keyValue,
      siteMgmtNo:
        recordMatchMode === MATCH_MODE_SPEC_NAME || recordMatchMode === MATCH_MODE_SOU_ID
          ? ''
          : keyValue,
      // 기존: siteMgmtNo: recordMatchMode === MATCH_MODE_SPEC_NAME ? '' : keyValue,
      matchKey: keyValue,
      matchMode: recordMatchMode,
      nativeId: record.id ? String(record.id) : '',
      facilityName: pickFacilityName(facility, keyValue),
      facilityNumber: facility ? getFacilitySpecNumber(facility) : '',
      category: facility ? getFacilityDisplayCategory(facility) : '',
      location: facility ? getFacilityDisplayLocation(facility) : '',
      qr: parsedQr,
      dateTime: record.dateTime ? String(record.dateTime) : '',
      updatedAt: record.dateTime ? String(record.dateTime) : ''
    })
  }

  return list
}

function normalizeNativeRecords(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  if (payload && Array.isArray(payload.list)) return payload.list
  if (payload && payload.id) return [payload]
  return []
}

function loadQrMappingsFromNative(catalogOrFacilities) {
  return new Promise(function(resolve, reject) {
    if (!isNativeBridgeAvailable()) {
      resolve(loadDevMappings(catalogOrFacilities))
      return
    }

    callNativeWithCallback(
      'loadQRData',
      { author: QR_AUTHOR },
      function(payload) {
        resolve(
          sortMappingsByRecent(
            nativeRecordsToMappings(normalizeNativeRecords(payload), catalogOrFacilities)
          )
        )
      },
      function(error) {
        reject(error || new Error('loadQRData failed'))
      }
    )
  })
}

function loadMergedMappings(catalogOrFacilities) {
  var catalog = resolveCatalog(catalogOrFacilities)

  if (!isNativeBridgeAvailable()) {
    return Promise.resolve(
      mergeMappings(createSeedMappings(catalog.list, catalog), loadDevMappings(catalog))
    )
  }

  return loadQrMappingsFromNative(catalog).then(function(storedMappings) {
    return mergeMappings(createSeedMappings(catalog.list, catalog), storedMappings)
  })
}

function saveQrMappingsToNative(mappings) {
  return new Promise(function(resolve, reject) {
    var list = mappings || []
    var savedAt = formatKstDateTime()
    var matchMode = list.length
      ? list[0].matchMode || MATCH_MODE_SOU_ID
      : MATCH_MODE_SOU_ID
    var nativeList = dedupeMappingsForNativeSave(list, matchMode)
    var i
    var mapping
    var item

    if (!list.length) {
      reject(new Error('저장할 QR 매칭이 없습니다.'))
      return
    }

    for (i = 0; i < nativeList.length; i += 1) {
      mapping = nativeList[i]
      item = buildNativeSaveQrItem(mapping, matchMode)

      if (!item.keyValue) {
        reject(
          new Error(
            matchMode === MATCH_MODE_SPEC_NAME
              ? '시설명칭이 없어 저장할 수 없습니다.'
              : matchMode === MATCH_MODE_SOU_ID
                ? 'SOU_ID가 없어 저장할 수 없습니다.'
                : '현장관리번호가 없어 저장할 수 없습니다.'
          )
        )
        return
      }

      if (!item.qrcode) {
        reject(new Error('QR 원문이 없어 저장할 수 없습니다.'))
        return
      }

      mapping.dateTime = savedAt
      mapping.updatedAt = savedAt
    }

    for (i = 0; i < list.length; i += 1) {
      list[i].dateTime = savedAt
      list[i].updatedAt = savedAt
    }

    if (!isNativeBridgeAvailable()) {
      var stored = loadDevMappings()
      var merged = mergeMappings(stored, list)
      saveDevMappings(merged)
      notifyQrMappingsChanged()
      resolve(list)
      return
    }

    callNativeWithCallback(
      'saveQRData',
      buildNativeSaveQrRequestPayload(list, matchMode),
      function() {
        notifyQrMappingsChanged()
        resolve(list)
      },
      function(error) {
        reject(error || new Error('saveQRData failed'))
      }
    )
  })
}

function saveQrMappingToNative(mapping) {
  return saveQrMappingsToNative([mapping]).then(function(list) {
    return list[0]
  })
}

function deleteQrMappingFromNative(mapping) {
  return new Promise(function(resolve, reject) {
    var matchMode = (mapping && mapping.matchMode) || MATCH_MODE_SOU_ID
    var payload = buildNativeQrPayload(mapping, matchMode)

    if (mapping.nativeId) {
      payload.id = mapping.nativeId
    }

    if (!payload.sn) {
      reject(
        new Error(
          matchMode === MATCH_MODE_SPEC_NAME
            ? '시설명칭이 없어 삭제할 수 없습니다.'
            : matchMode === MATCH_MODE_SOU_ID
              ? 'SOU_ID가 없어 삭제할 수 없습니다.'
              : '현장관리번호가 없어 삭제할 수 없습니다.'
        )
      )
      return
    }

    if (!payload.qrcode) {
      reject(new Error('QR 원문이 없어 삭제할 수 없습니다.'))
      return
    }

    if (!isNativeBridgeAvailable()) {
      deleteDevMapping(mapping)
      notifyQrMappingsChanged()
      resolve(true)
      return
    }

    callNativeWithCallback(
      'deleteQRData',
      payload,
      function() {
        notifyQrMappingsChanged()
        resolve(true)
      },
      function(error) {
        reject(error || new Error('deleteQRData failed'))
      }
    )
  })
}

function createMappingForFacility(facility, parsedQr, catalog) {
  return createMapping(facility, parsedQr, catalog)
}

function requestExportCsv() {
  return new Promise(function (resolve, reject) {
    callNativeWithCallback(
      'exportCSV',
      {},
      function () {
        resolve(true)
      },
      function (error) {
        reject(error || new Error('exportCSV failed'))
      }
    )
  })
}

export {
  QR_AUTHOR,
  QR_MAPPINGS_CHANGED_EVENT,
  loadQrMappingsFromNative,
  loadMergedMappings,
  saveQrMappingsToNative,
  saveQrMappingToNative,
  deleteQrMappingFromNative,
  requestExportCsv,
  createMappingForFacility,
  notifyQrMappingsChanged
}
