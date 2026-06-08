import { getFacilitySiteMgmtNo } from '@/utils/facilityCsv'
import {
  getCatalogMatchMode,
  getFacilityDisplayCategory,
  getFacilityDisplayLocation,
  getFacilitySpecName,
  getFacilityStorageKey
} from '@/utils/facilityIndex'

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeQrReturnString(value) {
  var text = String(value || '').trim()
  var queryIndex = text.indexOf('?')

  if (queryIndex === -1) return text

  return text.slice(queryIndex + 1).trim()
}

function getQrStoredValue(parsedQr) {
  if (!parsedQr) return ''
  return String(parsedQr.raw || parsedQr.code || '').trim()
}

function parseQrInput(rawValue) {
  var raw = normalizeQrReturnString(rawValue)

  if (!raw) {
    return {
      raw: '',
      isValid: false,
      reason: 'QR 코드 값이 비어 있습니다.',
      code: ''
    }
  }

  if (!/^[0-9A-Za-z_-]+$/.test(raw)) {
    return {
      raw: raw,
      isValid: false,
      reason: 'QR 코드는 영문, 숫자, _, - 만 허용합니다.',
      code: ''
    }
  }

  return {
    raw: raw,
    isValid: true,
    reason: '',
    code: raw
  }
}

function createMapping(facility, parsedQr, catalog) {
  var matchMode = getCatalogMatchMode(catalog)
  var siteMgmtNo = getFacilitySiteMgmtNo(facility)
  var storageKey = getFacilityStorageKey(facility, catalog)

  return {
    facilityId: facility.id,
    siteMgmtNo: siteMgmtNo,
    matchKey: storageKey,
    matchMode: matchMode,
    facilityName: getFacilitySpecName(facility) || '',
    facilityNumber: facility['시설번호'] || '',
    category: getFacilityDisplayCategory(facility) || facility.category || '',
    location: getFacilityDisplayLocation(facility) || facility.location || '',
    qr: parsedQr,
    updatedAt: new Date().toISOString()
  }
}

function createSeedMappings(facilities, catalog) {
  var list = []

  for (var i = 0; i < (facilities || []).length; i += 1) {
    var facility = facilities[i]
    var parsedQr = parseQrInput(facility.qrCode)

    if (!parsedQr.isValid) continue
    list.push(createMapping(facility, parsedQr, catalog))
  }

  return list
}

function getMappingUpdatedTimestamp(mapping) {
  if (!mapping) return 0
  var raw = mapping.updatedAt || mapping.dateTime || ''
  if (!raw) return 0
  var time = new Date(raw).getTime()
  return isNaN(time) ? 0 : time
}

function sortMappingsByRecent(mappings) {
  return (mappings || []).slice().sort(function(a, b) {
    return getMappingUpdatedTimestamp(b) - getMappingUpdatedTimestamp(a)
  })
}

var UNKNOWN_MAPPING_DATE_KEY = '__unknown__'

function getMappingDateKey(mapping) {
  var ts = getMappingUpdatedTimestamp(mapping)
  if (!ts) return UNKNOWN_MAPPING_DATE_KEY
  return new Date(ts).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' })
}

function formatMappingDateLabel(dateKey) {
  if (!dateKey || dateKey === UNKNOWN_MAPPING_DATE_KEY) return '날짜 없음'
  var parts = String(dateKey).split('-')
  if (parts.length !== 3) return String(dateKey)
  return parts[0] + '년 ' + Number(parts[1]) + '월 ' + Number(parts[2]) + '일'
}

function getMappingDateOptions(mappings) {
  var counts = {}
  var keys = []
  var i
  var key

  for (i = 0; i < (mappings || []).length; i += 1) {
    key = getMappingDateKey(mappings[i])
    counts[key] = (counts[key] || 0) + 1
  }

  keys = Object.keys(counts).sort(function(a, b) {
    if (a === UNKNOWN_MAPPING_DATE_KEY) return 1
    if (b === UNKNOWN_MAPPING_DATE_KEY) return -1
    return b.localeCompare(a)
  })

  return keys.map(function(dateKey) {
    return {
      key: dateKey,
      label: formatMappingDateLabel(dateKey),
      count: counts[dateKey]
    }
  })
}

function filterMappingsByDate(mappings, dateKey) {
  if (!dateKey) return mappings || []
  return (mappings || []).filter(function(mapping) {
    return getMappingDateKey(mapping) === dateKey
  })
}

function mergeMappings(seedMappings, storedMappings) {
  var merged = []
  var byFacility = {}
  var i

  for (i = 0; i < (seedMappings || []).length; i += 1) {
    byFacility[seedMappings[i].facilityId] = seedMappings[i]
  }

  for (i = 0; i < (storedMappings || []).length; i += 1) {
    byFacility[storedMappings[i].facilityId] = storedMappings[i]
  }

  var facilityIds = Object.keys(byFacility)
  for (i = 0; i < facilityIds.length; i += 1) {
    merged.push(byFacility[facilityIds[i]])
  }

  return sortMappingsByRecent(merged)
}

export {
  normalizeText,
  normalizeQrReturnString,
  getQrStoredValue,
  parseQrInput,
  createMapping,
  createSeedMappings,
  getMappingUpdatedTimestamp,
  getMappingDateKey,
  formatMappingDateLabel,
  getMappingDateOptions,
  filterMappingsByDate,
  sortMappingsByRecent,
  mergeMappings,
  UNKNOWN_MAPPING_DATE_KEY
}
