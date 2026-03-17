var isFileProtocol = window.location.protocol === 'file:'

function setCookie(name, value, days) {
  if (isFileProtocol) {
    localStorage.setItem(name, value)
    return
  }
  if (days === undefined) days = 7
  var expires = ''
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = '; expires=' + date.toUTCString()
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/'
}

function getCookie(name) {
  if (isFileProtocol) {
    return localStorage.getItem(name)
  }
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

function removeCookie(name) {
  if (isFileProtocol) {
    localStorage.removeItem(name)
    return
  }
  document.cookie = name + '=; Max-Age=-99999999; path=/'
}

function removeAllCookies() {
  if (isFileProtocol) {
    localStorage.clear()
    return
  }
  var cookies = document.cookie.split(';')
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i]
    var eqPos = cookie.indexOf('=')
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie
    removeCookie(name.trim())
  }
}

export { setCookie, getCookie, removeCookie, removeAllCookies }
