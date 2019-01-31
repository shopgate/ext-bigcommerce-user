const BigCommerceLogger = require('./Logger')

class BigCommerceRequestRepository {
  /**
   * @param {BigCommerce} client Api V3 client
   * @param {Logger} logger context.log
   */
  constructor (client, logger) {
    this.client = client
    this.logger = logger
  }

  /**
   * @param {string} path
   * @return {BigCommerceRedirectUrlsResponse}
   */
  get (path) {
    return this.request('get', path)
  }

  /**
   * @param {string} path
   * @param {Object} data
   * @param {Object} [obfuscatedData]
   * @return {BigCommerceRedirectUrlsResponse}
   */
  post (path, data, obfuscatedData = null) {
    return this.request('post', path, data, obfuscatedData)
  }

  /**
   * @param {string} path
   * @param {Object} data
   * @param {Object} [obfuscatedData]
   * @return {BigCommerceRedirectUrlsResponse}
   */
  put (path, data, obfuscatedData = null) {
    return this.request('put', path, data, obfuscatedData)
  }

  /**
   * @param {string} path
   * @return {BigCommerceRedirectUrlsResponse}
   */
  del (path) {
    return this.request('delete', path)
  }

  /**
   * @param {string} type
   * @param {string} path
   * @param {Object} [data]
   * @param {Object} [obfuscatedData]
   * @return {BigCommerceRedirectUrlsResponse}
   */
  async request (type, path, data = null, obfuscatedData = null) {
    const requestData = this.getRequestData(type, path, data, obfuscatedData)
    const logRequest = new BigCommerceLogger(this.logger)
    const start = new Date()

    try {
      const response = await this.client.request(type, path, data)
      logRequest.log(requestData, response, new Date() - start, 1)

      return response
    } catch (e) {
      logRequest.log(requestData, e.toString(), new Date() - start, 0)

      throw e
    }
  }

  /**
   * @param {string} type
   * @param {string} path
   * @param {Object} data
   * @param {Object} obfuscatedData
   * @return {Object}
   */
  getRequestData (type, path, data, obfuscatedData) {
    if (obfuscatedData !== null) {
      return { type, path, data: obfuscatedData }
    }
    if (data === null) {
      return { type, path }
    }

    return { type, path, data }
  }
}

module.exports = BigCommerceRequestRepository
