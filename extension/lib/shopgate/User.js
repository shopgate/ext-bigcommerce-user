const timestring = require('timestring')
const UserDataExpiredError = require('./customer/errors/UserDataExpiredError')

const USER_INFO = 'userInfo'

class ShopgateUser {
  /**
   * @param {PipelineContext} context
   * @param {number} ttl time to live in milliseconds
   */
  constructor (context, ttl) {
    this.context = context
    this.ttl = ttl
  }

  async get () {
    const userInfo = await this.context.storage.user.get(USER_INFO)
    if (!userInfo) {
      return null
    }

    if (!userInfo.touchTime) {
      throw new UserDataExpiredError(userInfo, 0, this.ttl)
    }

    const lastTouchTime = new Date(userInfo.touchTime).getTime()
    if (lastTouchTime + this.ttl < new Date().getTime()) {
      throw new UserDataExpiredError(userInfo, userInfo.touchTime, this.ttl)
    }

    return userInfo
  }

  async store (userData) {
    const userInfo = userData
    userInfo.touchTime = new Date().toUTCString()
    await this.context.storage.user.set(USER_INFO, userInfo)
  }

  async remove () {
    return this.context.storage.user.del(USER_INFO)
  }

  /**
   * @param {PipelineContext} context
   * @returns {ShopgateUser}
   */
  static create (context) {
    return new ShopgateUser(context, timestring(context.config.userInfoTTL, 'ms', {}))
  }
}

module.exports = ShopgateUser
