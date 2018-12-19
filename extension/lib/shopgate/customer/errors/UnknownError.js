class UnknownError extends Error {
  constructor (message = '') {
    super()
    this.code = 'EUNKNOWN'
    this.message = message
  }
}

module.exports = UnknownError
