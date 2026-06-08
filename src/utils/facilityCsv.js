/**
 * 시설자산 CSV 파싱 — 컬럼명은 config/facilityCsv.config.js 별칭으로 흡수
 */

import { FACILITY_CSV_FIELD_ALIASES as ALIASES } from '@/config/facilityCsv.config'

function normalizeValue(value) {
  return String(value || '').trim()
}

function normalizeHeader(value) {
  var v = normalizeValue(value)
  if (v && v.charCodeAt(0) === 0xfeff) {
    v = v.slice(1)
  }
  return v
}

function stripLeadingBom(text) {
  var s = String(text || '')
  if (s.charCodeAt(0) === 0xfeff) {
    return s.slice(1)
  }
  return s
}

function parseCsv(text) {
  var rows = []
  var current = ''
  var row = []
  var inQuotes = false
  var i
  var char
  var next

  for (i = 0; i < text.length; i += 1) {
    char = text[i]
    next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(current)
      current = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(current)
      current = ''
      if (row.join('').trim()) rows.push(row)
      row = []
      continue
    }

    current += char
  }

  if (current.length || row.length) {
    row.push(current)
    if (row.join('').trim()) rows.push(row)
  }

  return rows
}

function pickFirst(record, keys) {
  var list = keys || []
  for (var k = 0; k < list.length; k += 1) {
    var v = record[list[k]]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

function copyAlias(record, targetKey, aliasKeys) {
  var v = pickFirst(record, aliasKeys)
  if (v) record[targetKey] = v
}

function isSkippableDataRow(record) {
  return !pickFirst(record, ALIASES.siteMgmtNo) && !pickFirst(record, ALIASES.specName)
}

function getFacilitySiteMgmtNo(facility) {
  if (!facility) return ''
  if (facility.siteMgmtNo != null && String(facility.siteMgmtNo).trim() !== '') {
    return String(facility.siteMgmtNo).trim()
  }
  return pickFirst(facility, ALIASES.siteMgmtNo)
}

function normalizeFacilityRecord(record) {
  var siteMgmtNo = pickFirst(record, ALIASES.siteMgmtNo)
  if (siteMgmtNo) {
    record.siteMgmtNo = siteMgmtNo
    record['현장관리번호'] = siteMgmtNo
  }

  var specName = pickFirst(record, ALIASES.specName)
  if (specName) {
    record['시설명칭'] = specName
    record.facilityName = specName
  }

  var facilityNo = pickFirst(record, ALIASES.facilityNo)
  if (facilityNo) record['시설번호'] = facilityNo

  copyAlias(record, 'eqNo', ALIASES.eqNo)
  copyAlias(record, 'F1(대)', ALIASES.f1)
  copyAlias(record, 'F2(중)', ALIASES.f2)
  copyAlias(record, 'F3(소)', ALIASES.f3)
  copyAlias(record, 'F4(세)', ALIASES.f4)
  copyAlias(record, 'L2(단지)', ALIASES.l2)
  copyAlias(record, 'L3(건물)', ALIASES.l3)
  copyAlias(record, 'L4(층)', ALIASES.l4)
  copyAlias(record, 'L5(섹터)', ALIASES.l5)
  copyAlias(record, 'L6(룸)', ALIASES.l6)

  return record
}

function facilityRecordsFromCsvText(text) {
  var rows = parseCsv(stripLeadingBom(text))
  if (rows.length < 2) {
    throw new Error('CSV에 헤더와 데이터 행이 필요합니다.')
  }

  var headers = rows[0].map(normalizeHeader)
  var records = []
  var r
  var values
  var record
  var h
  var id

  for (r = 1; r < rows.length; r += 1) {
    values = rows[r]
    record = {}
    for (h = 0; h < headers.length; h += 1) {
      record[headers[h]] = normalizeValue(values[h])
    }

    if (isSkippableDataRow(record)) continue

    normalizeFacilityRecord(record)
    var specNameForId = pickFirst(record, ALIASES.specName)
    id =
      record.siteMgmtNo ||
      pickFirst(record, ['id']) ||
      pickFirst(record, ALIASES.facilityNo) ||
      pickFirst(record, ALIASES.eqNo) ||
      specNameForId ||
      'ROW-' + r
    record.id = id
    if (!record.qrCode) {
      record.qrCode = pickFirst(record, ALIASES.qrCode)
    }

    records.push(record)
  }

  return records
}

var SITE_MGMT_FIELD_KEY = '현장관리번호'

export {
  parseCsv,
  normalizeValue,
  facilityRecordsFromCsvText,
  getFacilitySiteMgmtNo,
  SITE_MGMT_FIELD_KEY
}
