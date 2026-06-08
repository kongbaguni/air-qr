import { DEFAULT_FACILITY_CSV } from '@/config/facilityCsv.config'

var DEV_FACILITY_CSV_NAME = DEFAULT_FACILITY_CSV

function uniqueUrls(urls) {
  var seen = {}
  var list = []

  for (var i = 0; i < urls.length; i += 1) {
    var url = urls[i]
    if (!url || seen[url]) continue
    seen[url] = true
    list.push(url)
  }

  return list
}

function buildCandidateUrls(fileName) {
  var candidates = []
  var base = process.env.BASE_URL || './'

  if (typeof window === 'undefined') {
    return uniqueUrls([base + fileName, './' + fileName])
  }

  var origin = window.location.origin
  var pageUrl = window.location.href.split('#')[0].split('?')[0]
  var directory = pageUrl.slice(0, pageUrl.lastIndexOf('/') + 1)

  candidates.push(base + fileName)
  candidates.push('./' + fileName)

  if (window.location.protocol !== 'file:') {
    candidates.push('/' + fileName)
    if (origin && origin !== 'null') {
      candidates.push(origin + '/' + fileName)
      if (base && base !== './') {
        candidates.push(origin + base + fileName)
      }
    }
  }

  if (window.location.protocol === 'file:') {
    candidates.push(directory + fileName)
  }

  return uniqueUrls(candidates)
}

function loadBundledFacilityCsv() {
  if (
    typeof window !== 'undefined' &&
    typeof window.__FACILITY_CSV_BUNDLE__ === 'string' &&
    window.__FACILITY_CSV_BUNDLE__
  ) {
    return Promise.resolve(window.__FACILITY_CSV_BUNDLE__)
  }

  return Promise.reject(new Error('CSV bundle missing'))
}

function loadTextViaXhr(url) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = function() {
      if (xhr.status === 0 || (xhr.status >= 200 && xhr.status < 300)) {
        resolve(xhr.responseText)
        return
      }
      reject(new Error('XHR ' + xhr.status))
    }
    xhr.onerror = function() {
      reject(new Error('XHR failed'))
    }
    xhr.send(null)
  })
}

function loadTextFromUrl(url) {
  return fetch(url)
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status)
      return res.text()
    })
    .catch(function() {
      return loadTextViaXhr(url)
    })
}

function buildCsvLoadErrorMessage() {
  return [
    '시설 CSV를 불러오지 못했습니다.',
    '개발: public/' + DEV_FACILITY_CSV_NAME,
    '배포: pnpm build 후 dist/' + DEV_FACILITY_CSV_NAME + '와 js/facility-csv-data.js 확인',
    '앱: window.__applyFacilityCsv(text)로 주입'
  ].join(' ')
}

function loadPublicFacilityCsv(fileName) {
  var targetName = fileName || DEV_FACILITY_CSV_NAME
  var urls = buildCandidateUrls(targetName)
  var index = 0

  function attemptNext() {
    if (index >= urls.length) {
      return loadBundledFacilityCsv().catch(function() {
        return Promise.reject(new Error(buildCsvLoadErrorMessage()))
      })
    }

    var url = urls[index]
    index += 1

    return loadTextFromUrl(url).catch(function() {
      return attemptNext()
    })
  }

  if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
    return loadBundledFacilityCsv().catch(function() {
      return attemptNext()
    })
  }

  return attemptNext()
}

export { DEV_FACILITY_CSV_NAME, loadPublicFacilityCsv }
