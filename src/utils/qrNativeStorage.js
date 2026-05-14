import { getFacilitySiteMgmtNo, SITE_MGMT_FIELD_KEY } from '@/utils/facilityCsv'
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
  parseQrInput
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

function buildFacilityIndex(facilities) {
  var index = {}
  var i
  var facility
  var siteMgmtNo

  for (i = 0; i < (facilities || []).length; i += 1) {
    facility = facilities[i]
    siteMgmtNo = getFacilitySiteMgmtNo(facility)
    if (siteMgmtNo) index[siteMgmtNo] = facility
    if (facility.id) index[facility.id] = facility
  }

  return index
}

function getMappingSiteMgmtNo(mapping) {
  if (!mapping) return ''
  if (mapping.siteMgmtNo != null && String(mapping.siteMgmtNo).trim() !== '') {
    return String(mapping.siteMgmtNo).trim()
  }
  return String(mapping.facilityId || '').trim()
}

function getMappingQrCode(mapping) {
  return getQrStoredValue(mapping && mapping.qr ? mapping.qr : null)
}

function formatKstDateTime(date) {
  var value = date instanceof Date ? date : new Date()
  return value.toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' })
}

function buildNativeQrPayload(mapping) {
  return {
    author: QR_AUTHOR,
    qrcode: getMappingQrCode(mapping),
    sn: getMappingSiteMgmtNo(mapping)
  }
}

function buildNativeSaveQrItem(mapping) {
  return {
    key: SITE_MGMT_FIELD_KEY,
    keyValue: getMappingSiteMgmtNo(mapping),
    qrcode: getMappingQrCode(mapping)
  }
}

function buildNativeSaveQrRequestPayload(mappings) {
  var items = []
  var i

  for (i = 0; i < (mappings || []).length; i += 1) {
    items.push(buildNativeSaveQrItem(mappings[i]))
  }

  if (items.length === 1) return items[0]
  return items
}

function pickFacilityName(facility, facilityId) {
  if (!facility) return facilityId
  return (
    facility.facilityName ||
    facility['시설명칭'] ||
    facilityId
  )
}

function nativeRecordsToMappings(records, facilities) {
  var facilityIndex = buildFacilityIndex(facilities)
  var list = []
  var i
  var record
  var facility
  var parsedQr
  var siteMgmtNo

  for (i = 0; i < (records || []).length; i += 1) {
    record = records[i] || {}
    siteMgmtNo = String(record.keyValue || record.sn || '').trim()
    facility = facilityIndex[siteMgmtNo] || null
    parsedQr = parseQrInput(record.qrcode)

    list.push({
      facilityId: siteMgmtNo,
      siteMgmtNo: siteMgmtNo,
      nativeId: record.id ? String(record.id) : '',
      facilityName: pickFacilityName(facility, siteMgmtNo),
      category: facility ? facility.category : '',
      location: facility ? facility.location : '',
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

function loadQrMappingsFromNative(facilities) {
  return new Promise(function(resolve, reject) {
    if (!isNativeBridgeAvailable()) {
      reject(new Error('Native bridge unavailable'))
      return
    }

    callNativeWithCallback(
      'loadQRData',
      { author: QR_AUTHOR },
      function(payload) {
        resolve(nativeRecordsToMappings(normalizeNativeRecords(payload), facilities || []))
      },
      function(error) {
        reject(error || new Error('loadQRData failed'))
      }
    )
  })
}

function loadMergedMappings(facilities) {
  return loadQrMappingsFromNative(facilities).then(function (storedMappings) {
    return mergeMappings(createSeedMappings(facilities || []), storedMappings)
  })
}

function saveQrMappingsToNative(mappings) {
  return new Promise(function (resolve, reject) {
    var list = mappings || []
    var savedAt = formatKstDateTime()
    var i
    var mapping
    var item

    if (!list.length) {
      reject(new Error('저장할 QR 매칭이 없습니다.'))
      return
    }

    for (i = 0; i < list.length; i += 1) {
      mapping = list[i]
      item = buildNativeSaveQrItem(mapping)

      if (!item.keyValue) {
        reject(new Error('현장관리번호가 없어 저장할 수 없습니다.'))
        return
      }

      if (!item.qrcode) {
        reject(new Error('QR 원문이 없어 저장할 수 없습니다.'))
        return
      }

      mapping.dateTime = savedAt
      mapping.updatedAt = savedAt
    }

    callNativeWithCallback(
      'saveQRData',
      buildNativeSaveQrRequestPayload(list),
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
  return new Promise(function (resolve, reject) {
    var payload = buildNativeQrPayload(mapping)

    if (mapping.nativeId) {
      payload.id = mapping.nativeId
    }

    if (!payload.sn) {
      reject(new Error('현장관리번호가 없어 삭제할 수 없습니다.'))
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

function createMappingForFacility(facility, parsedQr) {
  return createMapping(facility, parsedQr)
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
