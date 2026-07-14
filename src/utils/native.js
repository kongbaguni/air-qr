function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isAndroid() {
  return /android/i.test(navigator.userAgent)
}

function isNativeBridgeAvailable() {
  if (isIOS()) {
    return !!(
      window.webkit &&
      window.webkit.messageHandlers &&
      window.webkit.messageHandlers.callInterface
    )
  }

  if (isAndroid()) {
    return !!(
      window.androidSpecForNativeInterface &&
      window.androidSpecForNativeInterface.callInterface
    )
  }

  return false
}

function isNativeRoomSearchAvailable() {
  return isNativeBridgeAvailable()
}

function callNative(handlerName, callBackFuncStr, payload) {
  var param = {
    interfaceId: handlerName,
    callBackFuncStr: callBackFuncStr || '',
    requestPayload: payload || {}
  }

  try {
    if (isIOS()) {
      if (
        window.webkit &&
        window.webkit.messageHandlers &&
        window.webkit.messageHandlers.callInterface
      ) {
        window.webkit.messageHandlers.callInterface.postMessage(param)
      } else {
        console.warn('iOS handler not found: ' + handlerName)
      }
      return
    }

    if (isAndroid()) {
      if (
        window.androidSpecForNativeInterface &&
        window.androidSpecForNativeInterface.callInterface
      ) {
        window.androidSpecForNativeInterface.callInterface(JSON.stringify(param))
      } else {
        console.warn('Android handler not found: ' + handlerName)
      }
      return
    }

    console.warn('Unknown platform or running in browser: ' + handlerName)
  } catch (e) {
    console.error('Native call error:', e)
  }
}

function callNativePromise(handlerName, payload) {
  return new Promise(function(resolve, reject) {
    if (!isNativeBridgeAvailable()) {
      reject(new Error('Native bridge unavailable'))
      return
    }

    var callbackName = '__nativeCallback_' + handlerName + '_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + '__'

    window[callbackName] = function(result) {
      try {
        if (!isNativeSuccess(result)) {
          reject(result || new Error(handlerName + ' failed'))
          return
        }
        resolve(extractResponsePayload(result))
      } finally {
        if (window[callbackName]) {
          delete window[callbackName]
        }
      }
    }

    callNative(handlerName, callbackName, payload)
  })
}

function isNativeSuccess(result) {
  if (!result || typeof result !== 'object') return true
  if (Object.prototype.hasOwnProperty.call(result, 'isSucess')) {
    return !!result.isSucess
  }
  if (Object.prototype.hasOwnProperty.call(result, 'isSuccess')) {
    return !!result.isSuccess
  }
  return true
}

function extractResponsePayload(result) {
  if (result == null) return null
  if (typeof result === 'object' && Object.prototype.hasOwnProperty.call(result, 'responsePayload')) {
    return result.responsePayload
  }
  return result
}

function queryFacilityCatalog(payload, callback) {
  callNative('queryFacilityCatalog', callback || '', payload || {})
}

function getFacilityCatalogFilters(payload, callback) {
  callNative('getFacilityCatalogFilters', callback || '', payload || {})
}

function syncFacilityCatalog(payload, callback) {
  callNative('syncFacilityCatalog', callback || '', payload || {})
}

function qrScan(callback, title) {
  callNative('qrScan', callback, title != null ? { title: title } : {})
}

function saveQRData(payload, callback) {
  callNative('saveQRData', callback || '', payload || {})
}

function deleteQRData(author, payload, callback) {
  callNative(
    'deleteQRData',
    callback || '',
    Object.assign({ author: author || '' }, payload || {})
  )
}

function loadQRData(author, payload, callback) {
  callNative(
    'loadQRData',
    callback || '',
    Object.assign({ author: author || '' }, payload || {})
  )
}

function exportCSV(callback) {
  callNative('exportCSV', callback || '', {})
}

function vibrate(time) {
  callNative('vibrate', '', { time: time || 200 })
}

function fixWebViewTextZoom() {
  callNative('setTextZoom', '', { zoom: 100 })
}

export {
  isIOS,
  isAndroid,
  isNativeBridgeAvailable,
  isNativeRoomSearchAvailable,
  callNative,
  callNativePromise,
  isNativeSuccess,
  extractResponsePayload,
  qrScan,
  queryFacilityCatalog,
  getFacilityCatalogFilters,
  syncFacilityCatalog,
  saveQRData,
  deleteQRData,
  loadQRData,
  exportCSV,
  vibrate,
  fixWebViewTextZoom
}
