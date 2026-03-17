/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Validate phone number (Korean format)
 * @param {string} phone
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const re = /^01[016789]-?\d{3,4}-?\d{4}$/
  return re.test(phone)
}

/**
 * Validate required field
 * @param {*} value
 * @returns {boolean}
 */
export function isRequired(value) {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim().length > 0
  return value !== null && value !== undefined
}

/**
 * Validate min length
 * @param {string} value
 * @param {number} min
 * @returns {boolean}
 */
export function minLength(value, min) {
  return value && value.length >= min
}

/**
 * Validate max length
 * @param {string} value
 * @param {number} max
 * @returns {boolean}
 */
export function maxLength(value, max) {
  return value && value.length <= max
}
