import { FORCE_QR_MATCH_MODE } from '@/config/facilityCsv.config'
import { getFacilitySiteMgmtNo } from '@/utils/facilityCsv'
import { normalizeText } from '@/utils/qrMatcher'

var MATCH_MODE_SITE_MGMT = 'siteMgmtNo'
var MATCH_MODE_SPEC_NAME = 'specName'
var MATCH_MODE_SOU_ID = 'souId'
var NATIVE_KEY_SITE_MGMT = '현장관리번호'
var NATIVE_KEY_SPEC_NAME = '시설명칭'
var NATIVE_KEY_SOU_ID = 'SOU_ID'

function detectMatchMode(records) {
  // [이번 빌드] SOU_ID + qrcode 매칭 고정 (facilityCsv.config.js FORCE_QR_MATCH_MODE)
  if (FORCE_QR_MATCH_MODE) return FORCE_QR_MATCH_MODE

  // 기존: CSV 컬럼 유무로 현장관리번호 vs 시설명칭 자동 감지
  // var withSite = 0
  // var withName = 0
  // var i
  //
  // for (i = 0; i < (records || []).length; i += 1) {
  //   if (getFacilitySiteMgmtNo(records[i])) withSite += 1
  //   if (getFacilitySpecName(records[i])) withName += 1
  // }
  //
  // if (withSite === 0 && withName > 0) return MATCH_MODE_SPEC_NAME
  // return MATCH_MODE_SITE_MGMT

  return MATCH_MODE_SOU_ID
}

function getCatalogMatchMode(catalog) {
  if (FORCE_QR_MATCH_MODE) return FORCE_QR_MATCH_MODE
  if (!catalog) return MATCH_MODE_SOU_ID
  return catalog.matchMode || MATCH_MODE_SOU_ID
}

function getNativeKeyField(matchMode) {
  // [이번 빌드] 네이티브 저장 키 = SOU_ID
  if (matchMode === MATCH_MODE_SOU_ID || FORCE_QR_MATCH_MODE) return NATIVE_KEY_SOU_ID

  // 기존: 시설명칭 또는 현장관리번호
  // return matchMode === MATCH_MODE_SPEC_NAME ? NATIVE_KEY_SPEC_NAME : NATIVE_KEY_SITE_MGMT

  return NATIVE_KEY_SOU_ID
}

function getFacilitySouId(f) {
  return pickField(f, ['SOU_ID'])
}

function getFacilityStorageKey(facility, catalogOrMode) {
  var mode =
    typeof catalogOrMode === 'string'
      ? catalogOrMode
      : getCatalogMatchMode(catalogOrMode)

  // [이번 빌드] QR 매칭·네이티브 저장 키 = SOU_ID
  if (mode === MATCH_MODE_SOU_ID) {
    return getFacilitySouId(facility) || String((facility && facility.id) || '').trim()
  }

  // 기존: 시설명칭 기준 매칭
  // if (mode === MATCH_MODE_SPEC_NAME) {
  //   return getFacilitySpecName(facility) || String((facility && facility.id) || '').trim()
  // }
  //
  // 기존: 현장관리번호 기준 매칭
  // return getFacilitySiteMgmtNo(facility) || String((facility && facility.id) || '').trim()

  return getFacilitySouId(facility) || String((facility && facility.id) || '').trim()
}

function getMappingStorageKey(mapping) {
  if (!mapping) return ''
  if (mapping.matchKey != null && String(mapping.matchKey).trim() !== '') {
    return String(mapping.matchKey).trim()
  }
  // [이번 빌드] SOU_ID 매칭
  if (mapping.matchMode === MATCH_MODE_SOU_ID && mapping.facilityNumber) {
    return String(mapping.facilityNumber).trim()
  }
  // 기존: 시설명칭 매칭
  // if (mapping.matchMode === MATCH_MODE_SPEC_NAME && mapping.facilityName) {
  //   return String(mapping.facilityName).trim()
  // }
  // 기존: 현장관리번호 매칭
  // if (mapping.siteMgmtNo != null && String(mapping.siteMgmtNo).trim() !== '') {
  //   return String(mapping.siteMgmtNo).trim()
  // }
  return String(mapping.facilityId || '').trim()
}

function pickField(record, keys) {
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i]
    var v = record[key]
    if (v != null && String(v).trim() !== '') return String(v).trim()
  }
  return ''
}

function getFacilityF1(f) {
  return pickField(f, ['F1(대)', 'FWK_F1', 'f1', 'category1'])
}

function getFacilityF2(f) {
  return pickField(f, ['F2(중)', 'FWK_F2', 'f2', 'category2'])
}

function getFacilityF3(f) {
  return pickField(f, ['F3(소)', 'FWK_F3', 'f3', 'category3'])
}

function getFacilityF4(f) {
  return pickField(f, ['F4(세)', 'FWK_F4', 'f4'])
}

function getFacilityL2(f) {
  return pickField(f, ['L2(단지)', 'L2_AREA_NAME', 'l2'])
}

function getFacilityL3(f) {
  var fromCol = pickField(f, ['L3(건물)', 'L3_BUILDING', 'l3'])
  if (fromCol) return fromCol
  if (!getFacilityL2(f)) return pickField(f, ['location'])
  return ''
}

function getFacilityL4(f) {
  return pickField(f, ['L4(층)', 'L4_FLOOR', 'l4'])
}

function getFacilityL5(f) {
  return pickField(f, ['L5(섹터)', 'L5_SECTOR', 'l5'])
}

function getFacilityL6(f) {
  return pickField(f, ['L6(룸)', 'L6_ROOM', 'l6'])
}

function getFacilityL7(f) {
  return pickField(f, ['L7(상세)', 'l7'])
}

function getFacilitySpecName(f) {
  return pickField(f, ['시설명칭', 'EQ_NM_시설명칭', 'facilityName', 'FWK_FCLT_NM_기능시설명'])
}

function getFacilitySpecNumber(f) {
  return pickField(f, ['시설번호', 'SOU_ID_임시시설번호', 'SOU_ID', 'EQ_NO', 'facilityNumber', 'eqNo'])
}

function normalizeSearchCompact(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s\-_./·,;:()[\]{}'"`]+/g, '')
}

function isUnclassifiedFilterValue(value) {
  if (value == null) return true
  var text = String(value).trim()
  if (!text) return true
  return text === '미분류'
}

function isClassifiedFilterValue(value) {
  return !isUnclassifiedFilterValue(value)
}

function uniqueSorted(values) {
  var set = {}
  var list = []
  var i
  var value

  for (i = 0; i < values.length; i += 1) {
    value = values[i]
    if (!value || set[value]) continue
    set[value] = true
    list.push(value)
  }

  return list.sort()
}

function uniqueSortedClassified(values) {
  var filtered = []
  var i

  for (i = 0; i < values.length; i += 1) {
    if (isClassifiedFilterValue(values[i])) filtered.push(values[i])
  }

  return uniqueSorted(filtered)
}

function addToSetMap(map, key, value) {
  if (!isClassifiedFilterValue(value)) return
  if (!key) return
  if (!map[key]) map[key] = {}
  map[key][value] = true
}

function setMapToSortedOptions(map, key) {
  if (!key || !map[key]) return []
  return uniqueSorted(Object.keys(map[key]))
}

function freezeFacilityList(records) {
  var frozen = []
  var i

  for (i = 0; i < records.length; i += 1) {
    frozen.push(Object.freeze(records[i]))
  }

  return Object.freeze(frozen)
}

function buildSearchKeys(facility) {
  var siteMgmtNo = getFacilitySiteMgmtNo(facility)
  var name = getFacilitySpecName(facility)
  var id = String(facility.id || '')

  return {
    normalized: normalizeText(name) + '\n' + normalizeText(siteMgmtNo) + '\n' + normalizeText(id),
    compact:
      normalizeSearchCompact(name) +
      normalizeSearchCompact(siteMgmtNo) +
      normalizeSearchCompact(id)
  }
}

/**
 * CSV 파싱 직후 1회: id 맵·필터 옵션 트리·검색 키·freeze 목록.
 */
function buildFacilityCatalog(records) {
  var list = freezeFacilityList(records || [])
  var byId = Object.create(null)
  var bySouId = Object.create(null)
  var bySpecName = Object.create(null)
  var f1Set = {}
  var f2ByF1 = Object.create(null)
  var f3ByF1F2 = Object.create(null)
  var f4ByF1F2F3 = Object.create(null)
  var searchById = Object.create(null)
  var matchMode = detectMatchMode(list)
  var i
  var facility
  var id
  var specName
  var souId
  var f1
  var f2
  var f3
  var f4
  var f12
  var f123

  for (i = 0; i < list.length; i += 1) {
    facility = list[i]
    id = facility.id
    byId[id] = facility
    searchById[id] = buildSearchKeys(facility)

    specName = getFacilitySpecName(facility)
    if (specName) {
      if (!bySpecName[specName]) bySpecName[specName] = []
      bySpecName[specName].push(facility)
    }

    souId = getFacilitySouId(facility)
    if (souId) bySouId[souId] = facility

    f1 = getFacilityF1(facility)
    f2 = getFacilityF2(facility)
    f3 = getFacilityF3(facility)
    f4 = getFacilityF4(facility)

    if (isClassifiedFilterValue(f1)) {
      f1Set[f1] = true
      addToSetMap(f2ByF1, f1, f2)
      f12 = f1 + '\x1f' + f2
      addToSetMap(f3ByF1F2, f12, f3)
      f123 = f12 + '\x1f' + f3
      addToSetMap(f4ByF1F2F3, f123, f4)
    }
  }

  return {
    list: list,
    byId: byId,
    bySouId: bySouId,
    bySpecName: bySpecName,
    searchById: searchById,
    matchMode: matchMode,
    count: list.length,
    f1Options: uniqueSorted(Object.keys(f1Set)),
    f2ByF1: f2ByF1,
    f3ByF1F2: f3ByF1F2,
    f4ByF1F2F3: f4ByF1F2F3
  }
}

function expandMappingForCatalog(catalog, mapping) {
  if (!catalog || catalog.matchMode !== MATCH_MODE_SPEC_NAME) {
    return [mapping]
  }

  var name = getMappingStorageKey(mapping) || mapping.facilityName || ''
  var facilities = (catalog.bySpecName && catalog.bySpecName[name]) || []
  var expanded = []
  var i
  var facility

  if (!name || !facilities.length) return [mapping]

  for (i = 0; i < facilities.length; i += 1) {
    facility = facilities[i]
    expanded.push(
      Object.assign({}, mapping, {
        facilityId: facility.id,
        facilityName: getFacilitySpecName(facility) || name,
        matchKey: name,
        matchMode: MATCH_MODE_SPEC_NAME,
        category: getFacilityDisplayCategory(facility) || mapping.category || '',
        location: getFacilityDisplayLocation(facility) || mapping.location || '',
        facilityNumber: getFacilitySpecNumber(facility) || mapping.facilityNumber || ''
      })
    )
  }

  return expanded
}

function buildMappingIndex(mappings) {
  var index = Object.create(null)
  var i
  var mapping

  for (i = 0; i < (mappings || []).length; i += 1) {
    mapping = mappings[i]
    if (mapping && mapping.facilityId) {
      index[mapping.facilityId] = mapping
    }
  }

  return index
}

function matchesFacilitySearchQuery(catalog, facility, normalizedQuery, compactQuery) {
  var keys = catalog.searchById[facility.id]
  if (!keys) return false
  if (normalizedQuery && keys.normalized.indexOf(normalizedQuery) !== -1) return true
  if (compactQuery && keys.compact.indexOf(compactQuery) !== -1) return true
  return false
}

function matchesFLevelBefore(facility, state, forFLevel) {
  if (forFLevel > 1 && state.selectedF1 && getFacilityF1(facility) !== state.selectedF1) {
    return false
  }
  if (forFLevel > 2 && state.selectedF2 && getFacilityF2(facility) !== state.selectedF2) {
    return false
  }
  if (forFLevel > 3 && state.selectedF3 && getFacilityF3(facility) !== state.selectedF3) {
    return false
  }
  if (forFLevel > 4 && state.selectedF4 && getFacilityF4(facility) !== state.selectedF4) {
    return false
  }
  return true
}

function matchesLChainBeforeLevel(facility, state, forLevel) {
  if (forLevel > 2 && state.selectedL2 && getFacilityL2(facility) !== state.selectedL2) {
    return false
  }
  if (forLevel > 3 && state.selectedL3 && getFacilityL3(facility) !== state.selectedL3) {
    return false
  }
  if (forLevel > 4 && state.selectedL4 && getFacilityL4(facility) !== state.selectedL4) {
    return false
  }
  if (forLevel > 5 && state.selectedL5 && getFacilityL5(facility) !== state.selectedL5) {
    return false
  }
  if (forLevel > 6 && state.selectedL6 && getFacilityL6(facility) !== state.selectedL6) {
    return false
  }
  if (forLevel > 7 && state.selectedL7 && getFacilityL7(facility) !== state.selectedL7) {
    return false
  }
  return true
}

function matchesAxisFilter(facility, state) {
  return matchesFLevelBefore(facility, state, 5) && matchesLChainBeforeLevel(facility, state, 8)
}

function hasExplicitFacilityFilter(state, normalizedQuery) {
  return (
    !!normalizedQuery ||
    !!state.selectedF1 ||
    !!state.selectedF2 ||
    !!state.selectedF3 ||
    !!state.selectedF4 ||
    !!state.selectedL2 ||
    !!state.selectedL3 ||
    !!state.selectedL4 ||
    !!state.selectedL5 ||
    !!state.selectedL6 ||
    !!state.selectedL7
  )
}

function compareFacilitiesForList(a, b, mappingIndex) {
  var aMatched = mappingIndex[a.id] ? 1 : 0
  var bMatched = mappingIndex[b.id] ? 1 : 0

  if (aMatched !== bMatched) return aMatched - bMatched
  return String(a.id).localeCompare(String(b.id))
}

function collectFilterOptionsFromPool(pool, getter) {
  var values = []
  var i

  for (i = 0; i < pool.length; i += 1) {
    values.push(getter(pool[i]))
  }

  return uniqueSortedClassified(values)
}

function buildPoolAfterF(catalog, state) {
  var list = catalog.list
  var pool = []
  var i

  for (i = 0; i < list.length; i += 1) {
    if (matchesFLevelBefore(list[i], state, 5)) pool.push(list[i])
  }

  return pool
}

function getF2Options(catalog, selectedF1) {
  return setMapToSortedOptions(catalog.f2ByF1, selectedF1)
}

function getF3Options(catalog, selectedF1, selectedF2) {
  if (!selectedF1 || !selectedF2) return []
  return setMapToSortedOptions(catalog.f3ByF1F2, selectedF1 + '\x1f' + selectedF2)
}

function getF4Options(catalog, selectedF1, selectedF2, selectedF3) {
  if (!selectedF1 || !selectedF2 || !selectedF3) return []
  return setMapToSortedOptions(
    catalog.f4ByF1F2F3,
    selectedF1 + '\x1f' + selectedF2 + '\x1f' + selectedF3
  )
}

function getL2Options(poolAfterF) {
  return collectFilterOptionsFromPool(poolAfterF, getFacilityL2)
}

function getL3Options(pool, selectedL2) {
  if (!selectedL2) return []
  var filtered = []
  var i

  for (i = 0; i < pool.length; i += 1) {
    if (getFacilityL2(pool[i]) === selectedL2) filtered.push(pool[i])
  }

  return collectFilterOptionsFromPool(filtered, getFacilityL3)
}

function getL4Options(pool, state) {
  if (!state.selectedL3) return []
  var filtered = []
  var i

  for (i = 0; i < pool.length; i += 1) {
    if (matchesLChainBeforeLevel(pool[i], state, 4)) filtered.push(pool[i])
  }

  return collectFilterOptionsFromPool(filtered, getFacilityL4)
}

function getL5Options(pool, state) {
  if (!state.selectedL4) return []
  var filtered = []
  var i

  for (i = 0; i < pool.length; i += 1) {
    if (matchesLChainBeforeLevel(pool[i], state, 5)) filtered.push(pool[i])
  }

  return collectFilterOptionsFromPool(filtered, getFacilityL5)
}

function getL6Options(pool, state) {
  if (!state.selectedL5) return []
  var filtered = []
  var i

  for (i = 0; i < pool.length; i += 1) {
    if (matchesLChainBeforeLevel(pool[i], state, 6)) filtered.push(pool[i])
  }

  return collectFilterOptionsFromPool(filtered, getFacilityL6)
}

function getL7Options(pool, state) {
  if (!state.selectedL6) return []
  var filtered = []
  var i

  for (i = 0; i < pool.length; i += 1) {
    if (matchesLChainBeforeLevel(pool[i], state, 7)) filtered.push(pool[i])
  }

  return collectFilterOptionsFromPool(filtered, getFacilityL7)
}

var filterResultCache = {
  key: '',
  results: []
}

function buildFilterCacheKey(catalog, state, mappingIndex) {
  return [
    catalog.count,
    state.query,
    state.selectedF1,
    state.selectedF2,
    state.selectedF3,
    state.selectedF4,
    state.selectedL2,
    state.selectedL3,
    state.selectedL4,
    state.selectedL5,
    state.selectedL6,
    state.selectedL7,
    state.showMatchedFacilities ? '1' : '0',
    Object.keys(mappingIndex).length
  ].join('\x1e')
}

function filterFacilities(catalog, state, mappingIndex) {
  var cacheKey = buildFilterCacheKey(catalog, state, mappingIndex)
  if (filterResultCache.key === cacheKey) {
    return filterResultCache.results
  }

  var normalizedQuery = normalizeText(state.query)
  var compactQuery = normalizedQuery ? normalizeSearchCompact(state.query) : ''
  var explicitFilter = hasExplicitFacilityFilter(state, normalizedQuery)
  var list = catalog.list
  var results = []
  var i
  var facility

  if (!explicitFilter && !state.showMatchedFacilities) {
    for (i = 0; i < list.length && results.length < 80; i += 1) {
      facility = list[i]
      if (!matchesAxisFilter(facility, state)) continue
      if (mappingIndex[facility.id]) continue
      results.push(facility)
    }
  } else {
    for (i = 0; i < list.length; i += 1) {
      facility = list[i]

      if (!matchesAxisFilter(facility, state)) continue
      if (
        normalizedQuery &&
        !matchesFacilitySearchQuery(catalog, facility, normalizedQuery, compactQuery)
      ) {
        continue
      }
      if (!state.showMatchedFacilities && mappingIndex[facility.id]) continue

      results.push(facility)
    }
  }

  results.sort(function(a, b) {
    return compareFacilitiesForList(a, b, mappingIndex)
  })

  filterResultCache.key = cacheKey
  filterResultCache.results = results
  return results
}

function invalidateFilterCache() {
  filterResultCache.key = ''
  filterResultCache.results = []
}

function resolveFacilitiesByIds(catalog, ids) {
  var selected = []
  var byId = catalog.byId
  var i
  var facility

  for (i = 0; i < (ids || []).length; i += 1) {
    facility = byId[ids[i]]
    if (facility) selected.push(facility)
  }

  return selected
}

function getFacilityDisplayCategory(facility) {
  var parts = [
    getFacilityF1(facility),
    getFacilityF2(facility),
    getFacilityF3(facility),
    getFacilityF4(facility)
  ].filter(isClassifiedFilterValue)
  return parts.length ? parts.join(' > ') : ''
}

function getFacilityDisplayLocation(facility) {
  var parts = [
    getFacilityL2(facility),
    getFacilityL3(facility),
    getFacilityL4(facility),
    getFacilityL5(facility),
    getFacilityL6(facility)
  ].filter(isClassifiedFilterValue)
  return parts.length ? parts.join(' · ') : ''
}

/**
 * 네이티브·저장 매칭을 현재 CSV 카탈로그 시설과 연결 (002→003 전환 시 ID 불일치 보완)
 */
function resolveFacilityForMapping(catalog, mapping) {
  if (!catalog || !mapping) return null
  var byId = catalog.byId || Object.create(null)
  var bySouId = catalog.bySouId || Object.create(null)
  var matchMode = getCatalogMatchMode(catalog)
  var keys = [
    mapping.matchKey,
    mapping.facilityNumber,
    mapping.facilityId,
    mapping.siteMgmtNo,
    mapping.facilityName
  ]
  var i
  var key

  // [이번 빌드] SOU_ID + qrcode 매칭 — 네이티브/시드 복원 시 SOU_ID로 시설 연결
  if (matchMode === MATCH_MODE_SOU_ID) {
    for (i = 0; i < keys.length; i += 1) {
      key = keys[i] != null ? String(keys[i]).trim() : ''
      if (key && bySouId[key]) return bySouId[key]
    }
  }

  // 기존: facility.id(현장관리번호 등)로 연결
  for (i = 0; i < keys.length; i += 1) {
    key = keys[i] != null ? String(keys[i]).trim() : ''
    if (key && byId[key]) return byId[key]
  }

  return null
}

function hydrateMappingsWithCatalog(catalog, mappings) {
  var list = mappings || []
  if (!catalog || !list.length) return list

  var hydrated = []
  var expanded = []
  var i
  var j
  var mapping
  var facility
  var siteMgmtNo
  var name
  var matchMode = getCatalogMatchMode(catalog)

  for (i = 0; i < list.length; i += 1) {
    mapping = list[i]
    facility = resolveFacilityForMapping(catalog, mapping)
    if (!facility) {
      expanded = expandMappingForCatalog(catalog, mapping)
      for (j = 0; j < expanded.length; j += 1) {
        hydrated.push(expanded[j])
      }
      continue
    }

    siteMgmtNo = getFacilitySiteMgmtNo(facility)
    name = getFacilitySpecName(facility)

    expanded = expandMappingForCatalog(
      catalog,
      Object.assign({}, mapping, {
        facilityId: facility.id || mapping.facilityId,
        siteMgmtNo: siteMgmtNo || mapping.siteMgmtNo,
        matchKey: getFacilityStorageKey(facility, catalog) || mapping.matchKey,
        matchMode: matchMode,
        facilityName: name || mapping.facilityName || mapping.facilityId || '',
        category: getFacilityDisplayCategory(facility) || mapping.category || '',
        location: getFacilityDisplayLocation(facility) || mapping.location || '',
        facilityNumber: getFacilitySpecNumber(facility) || mapping.facilityNumber || ''
      })
    )

    for (j = 0; j < expanded.length; j += 1) {
      hydrated.push(expanded[j])
    }
  }

  return hydrated
}

export {
  MATCH_MODE_SITE_MGMT,
  MATCH_MODE_SPEC_NAME,
  MATCH_MODE_SOU_ID,
  NATIVE_KEY_SITE_MGMT,
  NATIVE_KEY_SPEC_NAME,
  NATIVE_KEY_SOU_ID,
  detectMatchMode,
  getCatalogMatchMode,
  getNativeKeyField,
  getFacilityStorageKey,
  getMappingStorageKey,
  expandMappingForCatalog,
  buildFacilityCatalog,
  buildMappingIndex,
  buildPoolAfterF,
  filterFacilities,
  invalidateFilterCache,
  resolveFacilitiesByIds,
  resolveFacilityForMapping,
  hydrateMappingsWithCatalog,
  getFacilityDisplayCategory,
  getFacilityDisplayLocation,
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
  getFacilitySouId,
  isClassifiedFilterValue,
  matchesFLevelBefore,
  matchesLChainBeforeLevel,
  matchesAxisFilter,
  hasExplicitFacilityFilter
}
