const EACCESS = 'EACCESS'

class UnauthorisedError extends Error {
  /**
   * @param {string|null} [displayMessage=null]
   */
  constructor (displayMessage = null) {
    super()
    this.code = EACCESS
    this.message = 'Permission denied.'
    this.displayMessage = displayMessage
  }
}

module.exports = UnauthorisedError
