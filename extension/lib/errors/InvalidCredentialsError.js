const EINVALIDCREDENTIALS = 'EINVALIDCREDENTIALS'

class InvalidCredentialsError extends Error {
  constructor (displayMessage, message) {
    super()
    this.code = EINVALIDCREDENTIALS
    this.message = message || 'The given credentials are wrong or do not exist.'
    this.displayMessage = displayMessage || null
  }
}

module.exports = InvalidCredentialsError
