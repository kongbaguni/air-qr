import { facilityRecordsFromCsvText } from '@/utils/facilityCsv'
import { buildFacilityCatalog, invalidateFilterCache } from '@/utils/facilityIndex'
import { DEV_FACILITY_CSV_NAME, loadPublicFacilityCsv } from '@/utils/facilityCsvSource'

var cachedCatalog = null
var cachedSourceLabel = ''

function getFacilityCatalog() {
  return cachedCatalog
}

function setFacilityCatalogFromRecords(records, sourceLabel) {
  cachedCatalog = buildFacilityCatalog(records)
  cachedSourceLabel = sourceLabel || ''
  invalidateFilterCache()
  return cachedCatalog
}

function setFacilityCatalogFromCsvText(csvText, sourceLabel) {
  return setFacilityCatalogFromRecords(facilityRecordsFromCsvText(csvText), sourceLabel)
}

function loadFacilityCatalog(fileName) {
  if (cachedCatalog) {
    return Promise.resolve({
      catalog: cachedCatalog,
      sourceLabel: cachedSourceLabel
    })
  }

  return loadPublicFacilityCsv(fileName || DEV_FACILITY_CSV_NAME).then(function(text) {
    var label = 'public/' + (fileName || DEV_FACILITY_CSV_NAME)
    return {
      catalog: setFacilityCatalogFromCsvText(text, label),
      sourceLabel: label
    }
  })
}

function clearFacilityCatalogCache() {
  cachedCatalog = null
  cachedSourceLabel = ''
  invalidateFilterCache()
}

export {
  DEV_FACILITY_CSV_NAME,
  getFacilityCatalog,
  setFacilityCatalogFromCsvText,
  setFacilityCatalogFromRecords,
  loadFacilityCatalog,
  clearFacilityCatalogCache
}
