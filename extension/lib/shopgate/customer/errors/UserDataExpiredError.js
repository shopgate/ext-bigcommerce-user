class UserDataExpiredError extends Error {
  /**
   * @param {Object} userData
   * @param {number} lastTouchTime time in milliseconds when user was last touched
   * @param {number} ttl time to live in milliseconds
   */
  constructor (userData, lastTouchTime, ttl) {
    super()
    this.userData = userData
    this.lastTouchTime = lastTouchTime
    this.ttl = ttl
  }

  /**
   * @returns {Object}
   */
  getUserData () {
    return this.userData
  }

  /**
   * @returns {number}
   */
  getLastTouchTime () {
    return this.lastTouchTime
  }

  /**
   * @returns {number}
   */
  getTtl () {
    return this.ttl
  }

  /**
   * @returns {number} number of milliseconds since user data has expired
   */
  getExpiredSince () {
    return new Date().getTime() - this.lastTouchTime + this.ttl
  }
}

module.exports = UserDataExpiredError
