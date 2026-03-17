var modalState = {
  isOpen: false,
  queue: []
}

function createElement(tag, styles, text) {
  var element = document.createElement(tag)
  var keys = Object.keys(styles || {})
  for (var i = 0; i < keys.length; i += 1) {
    var key = keys[i]
    element.style[key] = styles[key]
  }
  if (typeof text === 'string') {
    element.textContent = text
  }
  return element
}

function closeModal(state) {
  if (!state || !state.overlay || !state.onClose) {
    return
  }
  if (state.overlay.parentNode) {
    state.overlay.parentNode.removeChild(state.overlay)
  }
  if (state.escapeHandler) {
    document.removeEventListener('keydown', state.escapeHandler)
  }
  modalState.isOpen = false
  state.onClose()
  openNext()
}

function showModal(message, onClose) {
  var overlay = createElement('div', {
    position: 'fixed',
    top: '0',
    right: '0',
    bottom: '0',
    left: '0',
    zIndex: '99999',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  })

  var panel = createElement('div', {
    width: '100%',
    maxWidth: '360px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
  })

  var body = createElement(
    'div',
    {
      padding: '20px 16px',
      fontSize: '14px',
      color: '#111827',
      lineHeight: '1.6',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      textAlign: 'center'
    },
    String(message)
  )

  var footer = createElement('div', {
    borderTop: '1px solid #e5e7eb'
  })

  var button = createElement(
    'button',
    {
      width: '100%',
      height: '44px',
      border: 'none',
      backgroundColor: '#2563eb',
      color: '#ffffff',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer'
    },
    '확인'
  )

  var state = {
    overlay: overlay,
    onClose: onClose,
    escapeHandler: null
  }

  button.addEventListener('click', function () {
    closeModal(state)
  })

  state.escapeHandler = function (event) {
    if (event && event.key === 'Escape') {
      closeModal(state)
    }
  }

  document.addEventListener('keydown', state.escapeHandler)
  footer.appendChild(button)
  panel.appendChild(body)
  panel.appendChild(footer)
  overlay.appendChild(panel)
  document.body.appendChild(overlay)
  button.focus()
}

function openNext() {
  if (modalState.isOpen) {
    return
  }
  var next = modalState.queue.shift()
  if (!next) {
    return
  }
  modalState.isOpen = true
  showModal(next.message, next.onClose)
}

export function modalAlert(message) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }
  modalState.queue.push({
    message: message === undefined || message === null ? '' : message,
    onClose: function () {}
  })
  openNext()
}

export function installModalAlert() {
  if (typeof window === 'undefined') {
    return
  }
  window.alert = modalAlert
}
