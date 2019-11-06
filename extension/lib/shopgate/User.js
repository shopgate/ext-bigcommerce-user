const timestring = require('timestring')
const UserDataExpiredError = require('./customer/errors/UserDataExpiredError')

const USER_INFO = 'userInfo'

class ShopgateUser {
  /**
   * @param {PipelineStorage} userStorage context.storage.user
   * @param {number} ttl time to live in milliseconds
   */
  constructor (userStorage, ttl) {
    this.userStorage = userStorage
    this.ttl = ttl
  }

  /**
   * @returns {Object}
   */
  async get () {
    const userInfo = await this.userStorage.get(USER_INFO)
    if (!userInfo) {
      return null
    }

    if (!userInfo.touchTime) {
      throw new UserDataExpiredError(userInfo.userData, 0, this.ttl)
    }

    const lastTouchTime = new Date(userInfo.touchTime).getTime()
    if (lastTouchTime + this.ttl < new Date().getTime()) {
      throw new UserDataExpiredError(userInfo.userData, userInfo.touchTime, this.ttl)
    }

    return userInfo
  }

  /**
   * @param {Object} userData
   */
  async store (userData) {
    const userInfo = userData
    userInfo.touchTime = new Date().toUTCString()
    await this.userStorage.set(USER_INFO, userInfo)
  }

  async remove () {
    return this.userStorage.del(USER_INFO)
  }

  /**
   * @param {PipelineContext} context
   * @returns {ShopgateUser}
   */
  static create (context) {
    return new ShopgateUser(context.storage.user, timestring(context.config.userInfoTTL, 'ms', {}))
  }
}

module.exports = ShopgateUser
