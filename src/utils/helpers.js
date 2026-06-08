/**
 * Format date to string
 * @param {Date|string|number} date
 * @param {string} format
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * Debounce function
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Deep clone object
 * @param {*} obj
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Focused input이 모바일 키패드에 가리지 않도록 스크롤합니다.
 * visualViewport가 있으면 키보드 높이를 반영해 추가 보정합니다.
 */
export function scrollFocusedFieldIntoView(element, options) {
  if (!element || typeof element.getBoundingClientRect !== 'function') return

  var opts = options || {}
  var scrollContainer = null
  var keyboardPadding = opts.keyboardPadding != null ? opts.keyboardPadding : 96
  var delays = opts.delays || [0, 280, 520]
  var i

  if (opts.scrollContainer) {
    if (typeof opts.scrollContainer === 'string') {
      scrollContainer = document.querySelector(opts.scrollContainer)
    } else {
      scrollContainer = opts.scrollContainer
    }
  }

  var alignField = function() {
    if (typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: opts.behavior || 'smooth'
      })
    }

    if (!window.visualViewport) return

    var rect = element.getBoundingClientRect()
    var visibleBottom = window.visualViewport.offsetTop + window.visualViewport.height
    var overflow = rect.bottom - (visibleBottom - keyboardPadding)

    if (overflow <= 0) return

    if (scrollContainer) {
      scrollContainer.scrollTop += overflow
      return
    }

    window.scrollBy(0, overflow)
  }

  for (i = 0; i < delays.length; i += 1) {
    setTimeout(alignField, delays[i])
  }
}
