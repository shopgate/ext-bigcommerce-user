class BigCommercecustomerTokenUnverifiedError extends Error {
  /**
   * @param {string} token
   */
  constructor (token) {
    super()
    this.token = token
  }
}

module.exports = BigCommercecustomerTokenUnverifiedError
