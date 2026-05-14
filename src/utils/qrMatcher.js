import { getFacilitySiteMgmtNo } from '@/utils/facilityCsv'

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

function createMapping(facility, parsedQr) {
  var siteMgmtNo = getFacilitySiteMgmtNo(facility)

  return {
    facilityId: siteMgmtNo || facility.id,
    siteMgmtNo: siteMgmtNo,
    facilityName: facility.facilityName || facility['시설명칭'] || '',
    category: facility.category,
    location: facility.location,
    qr: parsedQr,
    updatedAt: new Date().toISOString()
  }
}

function createSeedMappings(facilities) {
  var list = []

  for (var i = 0; i < (facilities || []).length; i += 1) {
    var facility = facilities[i]
    var parsedQr = parseQrInput(facility.qrCode)

    if (!parsedQr.isValid) continue
    list.push(
      createMapping(facility, parsedQr)
    )
  }

  return list
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

  merged.sort(function(a, b) {
    return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''))
  })

  return merged
}

export {
  normalizeText,
  normalizeQrReturnString,
  getQrStoredValue,
  parseQrInput,
  createMapping,
  createSeedMappings,
  mergeMappings
}
