/**
 * 시설자산 CSV (퍼블릭 또는 브릿지로 받은 텍스트) 파싱.
 * CSV 파싱 규칙: 따옴표·쉼표 포함 필드는 RFC 4180 스타일로 처리합니다.
 */

function normalizeValue(value) {
  return String(value || '').trim()
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
  for (var k = 0; k < keys.length; k += 1) {
    var v = record[keys[k]]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

function getFacilitySiteMgmtNo(facility) {
  if (!facility) return ''
  if (facility.siteMgmtNo != null && String(facility.siteMgmtNo).trim() !== '') {
    return String(facility.siteMgmtNo).trim()
  }
  if (facility['현장관리번호'] != null && String(facility['현장관리번호']).trim() !== '') {
    return String(facility['현장관리번호']).trim()
  }
  return ''
}

/**
 * 헤더 행이 있는 CSV 텍스트를 시설 레코드 배열로 변환합니다.
 * id: 현장관리번호 우선, 없으면 시설번호, 없으면 행 인덱스.
 */
function facilityRecordsFromCsvText(text) {
  var rows = parseCsv(text)
  if (rows.length < 2) {
    throw new Error('CSV에 헤더와 데이터 행이 필요합니다.')
  }

  var headers = rows[0].map(normalizeValue)
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

    record.siteMgmtNo = pickFirst(record, ['현장관리번호'])
    id =
      record.siteMgmtNo ||
      pickFirst(record, ['id']) ||
      pickFirst(record, ['시설번호']) ||
      'ROW-' + r
    record.id = id
    if (!record.qrCode) record.qrCode = pickFirst(record, ['qrCode', 'QR코드', '시드QR'])

    records.push(record)
  }

  return records
}

export { parseCsv, normalizeValue, facilityRecordsFromCsvText, getFacilitySiteMgmtNo }
