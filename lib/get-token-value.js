'use strict'

module.exports = (value) => {
  if (!value) {
    return ''
  }

  if (value === '' || value === ' ' || value === '\n' || value === '\\n' || value === '\n ' || value === '\\n ' || value === '\r' || value === '\\r' || value === '\r ' || value === '\\r ' || value === '\r\n' || value === '\\r\\n' || value === '\r\n ' || value === '\\r\\n ' || value === '\n\r' || value === '\\n\\r' || value === '\n\r ' || value === '\\n\\r ') {
    return ''
  }

  return value
}
