const EAUTHFAILED = 'EAUTHFAILED'

class AuthFailedError extends Error {
  constructor (message) {
    super()
    this.code = EAUTHFAILED
    this.message = message || 'Something went wrong during authorization.'
  }
}

module.exports = AuthFailedError
