function isAndroid() {
  return /android/i.test(navigator.userAgent)
}

function callNative(handlerName, callBackFuncStr, payload) {
  var param = {
    interfaceId: handlerName,
    callBackFuncStr: callBackFuncStr || '',
    requestPayload: payload || {}
  }

  try {
    if (isAndroid()) {
      if (
        window.androidSpecForNativeInterface &&
        window.androidSpecForNativeInterface.callInterface
      ) {
        window.androidSpecForNativeInterface.callInterface(JSON.stringify(param))
      } else {
        console.warn('Android handler not found: ' + handlerName)
      }
    } else {
      console.warn('Unknown platform or running in browser')
    }
  } catch (e) {
    console.error('Native call error:', e)
  }
}

function promptCamera(callback) {
  callNative('promptCamera', callback)
}

function takePicture(callback, maxSize) {
  callNative('takePicture', callback, { maxSize: maxSize || 1024 })
}

function promptGps(callback) {
  callNative('promptGps', callback)
}

function getCurrentGpsPoint(callback) {
  callNative('getCurrentGpsPoint', callback)
}

function getAppVersion(callback) {
  callNative('getAppVersion', callback)
}

function setString(key, value) {
  callNative('setString', '', { key: key, value: value })
}

function getString(key, callback) {
  callNative('getString', callback, { key: key })
}

function vibrate(time) {
  callNative('vibrate', '', { time: time || 200 })
}

function fixWebViewTextZoom() {
  callNative('setTextZoom', '', { zoom: 100 })
}

function qrScan(callback, title) {
  callNative('qrScan', callback, title != null ? { title: title } : {})
}

function barcodeScan(callback, title) {
  callNative('barcodeScan', callback, title != null ? { title: title } : {})
}

// 문서(Article) API - jsInterface 스펙 (json은 객체 전달 시 자동 문자열화)
function createArticle(type, json, callback) {
  var payload = { type: type, json: typeof json === 'string' ? json : JSON.stringify(json || {}) }
  callNative('createArticle', callback || '', payload)
}

function editArticle(id, json, callback) {
  var payload = { id: id, json: typeof json === 'string' ? json : JSON.stringify(json || {}) }
  callNative('editArticle', callback || '', payload)
}

function getArticleList(type, callback) {
  callNative('getArticleList', callback || '', { type: type })
}

function getArticle(id, callback) {
  callNative('getArticle', callback || '', { id: id })
}

function deleteArticleById(id, callback) {
  callNative('deleteArticleById', callback || '', { id: id })
}

function deleteArticlesByType(type, callback) {
  callNative('deleteArticlesByType', callback || '', { type: type })
}

export {
  isAndroid,
  callNative,
  promptCamera,
  takePicture,
  promptGps,
  getCurrentGpsPoint,
  getAppVersion,
  setString,
  getString,
  vibrate,
  fixWebViewTextZoom,
  qrScan,
  barcodeScan,
  createArticle,
  editArticle,
  getArticleList,
  getArticle,
  deleteArticleById,
  deleteArticlesByType
}
