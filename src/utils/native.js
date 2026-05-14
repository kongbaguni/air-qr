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
  callNative,
  isNativeSuccess,
  extractResponsePayload,
  qrScan,
  saveQRData,
  deleteQRData,
  loadQRData,
  exportCSV,
  vibrate,
  fixWebViewTextZoom
}
