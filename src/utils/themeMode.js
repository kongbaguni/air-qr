var STORAGE_KEY = 'app_dark_mode'

export function applyThemeMode(enabled) {
  var html = document.documentElement
  var body = document.body
  var isEnabled = !!enabled

  if (isEnabled) {
    html.classList.add('dark-invert')
    if (body) body.classList.add('dark-invert')
  } else {
    html.classList.remove('dark-invert')
    if (body) body.classList.remove('dark-invert')
  }
}

export function getStoredThemeMode() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch (e) {
    return false
  }
}

export function setStoredThemeMode(enabled) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false')
  } catch (e) {
    return
  }
}

export function applySavedThemeMode() {
  applyThemeMode(getStoredThemeMode())
}
