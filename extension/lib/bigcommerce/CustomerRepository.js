const BigCommerce = require('node-bigcommerce')

const BigCommerceRequestRepository = require('./RequestRepository')
const shapeRequestError = require('./customer/shapeRequestError')

class BigCommerceCustomerRepository {
  /**
   * @param {BigCommerceRequestRepository} requestRepository
   */
  constructor (requestRepository) {
    this.request = requestRepository
  }

  /**
   * @param {string} clientId
   * @param {string} accessToken
   * @param {string} storeHash
   * @param {Logger} logger context.log
   * @returns {BigCommerceCustomerRepository}
   */
  static create (clientId, accessToken, storeHash, logger) {
    return new BigCommerceCustomerRepository(
      new BigCommerceRequestRepository(
        new BigCommerce({
          logLevel: 'info',
          clientId,
          accessToken,
          storeHash,
          responseType: 'json',
          apiVersion: 'v2'
        }),
        logger
      ))
  }

  /**
   * @param {string} email
   * @returns {Promise<BigCommerceCustomerByEmail>}
   */
  async getCustomerByEmail (email) {
    const uri = `/customers?email=${encodeURIComponent(email)}`
    try {
      const customers = await this.request.get(uri)

      if (!customers || customers.length < 1) return null

      return customers[0]
    } catch (e) {
      throw shapeRequestError(e)
    }
  }

  /**
   * @param {number} customerId
   * @returns {Promise<Object>}
   */
  async getCustomerById (customerId) {
    const uri = `/customers/${customerId}`
    const customer = await this.request.get(uri)

    return customer || null
  }

  /**
   * @param {number} customerId
   * @returns {Promise<Object>}
   */
  async getAddresses (customerId) {
    const uri = `/customers/${customerId}/addresses`
    const addresses = await this.request.get(uri)
    if (!addresses || addresses.length < 1) {
      return []
    }
    return addresses
  }

  /**
   * @param {number} customerId
   * @param {string} password
   */
  async login (customerId, password) {
    const uri = `/customers/${customerId}/validate`
    const obfuscation = { 'password': '**********' }
    const valid = await this.request.post(uri, { password }, obfuscation)

    return valid && valid.success
  }

  /**
   * Update customer entity on bigc side.
   * ATM custom fields (form_fields) are not supported see https://support.bigcommerce.com/s/question/0D51B000046LK53SAG/how-to-update-custom-customer-fields-using-api
   * @param {number} customerId
   * @param {BigCommerceCustomerRequest} customer
   * @return {Promise<void>}
   */
  async update (customerId, customer) {
    const uri = `/customers/${customerId}`
    try {
      await this.request.put(uri, customer)
    } catch (e) {
      throw shapeRequestError(e)
    }
  }
}

module.exports = BigCommerceCustomerRepository
