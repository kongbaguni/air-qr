import { getFacilitySiteMgmtNo } from '@/utils/facilityCsv'
import {
  getCatalogMatchMode,
  getFacilitySpecName,
  getFacilitySpecNumber,
  getFacilityDisplayCategory,
  getFacilityDisplayLocation,
  getMappingStorageKey,
  getNativeKeyField,
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
var callbackSeq = 0

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
  var siteMgmtNo

  for (i = 0; i < (facilities || []).length; i += 1) {
    facility = facilities[i]
    siteMgmtNo = getFacilitySiteMgmtNo(facility)
    indexFacilityKey(index, facility, siteMgmtNo)
    indexFacilityKey(index, facility, getFacilitySpecName(facility))
    indexFacilityKey(index, facility, facility.id)
    indexFacilityKey(index, facility, getFacilitySpecNumber(facility))
    indexFacilityKey(index, facility, facility.eqNo)
    indexFacilityKey(index, facility, facility['SOU_ID'])
    indexFacilityKey(index, facility, facility['SOU_ID_임시시설번호'])
  }

  return index
}

function resolveCatalog(catalogOrFacilities) {
  if (catalogOrFacilities && catalogOrFacilities.list) return catalogOrFacilities
  return {
    list: catalogOrFacilities || [],
    matchMode: 'siteMgmtNo'
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
    recordMatchMode =
      record.key === '시설명칭' ? MATCH_MODE_SPEC_NAME : matchMode
    facility = facilityIndex[keyValue] || null
    parsedQr = parseQrInput(record.qrcode)

    list.push({
      facilityId: facility ? facility.id : keyValue,
      siteMgmtNo: recordMatchMode === MATCH_MODE_SPEC_NAME ? '' : keyValue,
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
      reject(new Error('Native bridge unavailable'))
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

  return loadQrMappingsFromNative(catalog).then(function(storedMappings) {
    return mergeMappings(createSeedMappings(catalog.list, catalog), storedMappings)
  })
}

function saveQrMappingsToNative(mappings) {
  return new Promise(function(resolve, reject) {
    var list = mappings || []
    var savedAt = formatKstDateTime()
    var matchMode = list.length ? list[0].matchMode || 'siteMgmtNo' : 'siteMgmtNo'
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

    callNativeWithCallback(
      'saveQRData',
      buildNativeSaveQrRequestPayload(list, matchMode),
      function() {
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
    var matchMode = (mapping && mapping.matchMode) || 'siteMgmtNo'
    var payload = buildNativeQrPayload(mapping, matchMode)

    if (mapping.nativeId) {
      payload.id = mapping.nativeId
    }

    if (!payload.sn) {
      reject(
        new Error(
          matchMode === MATCH_MODE_SPEC_NAME
            ? '시설명칭이 없어 삭제할 수 없습니다.'
            : '현장관리번호가 없어 삭제할 수 없습니다.'
        )
      )
      return
    }

    if (!payload.qrcode) {
      reject(new Error('QR 원문이 없어 삭제할 수 없습니다.'))
      return
    }

    callNativeWithCallback(
      'deleteQRData',
      payload,
      function() {
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
  loadQrMappingsFromNative,
  loadMergedMappings,
  saveQrMappingsToNative,
  saveQrMappingToNative,
  deleteQrMappingFromNative,
  requestExportCsv,
  createMappingForFacility
}
