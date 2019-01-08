const jwtDecoder = require('jwt-simple')
const BigCommerce = require('node-bigcommerce')

const BigCommerceCustomerTokenInvalidError = require('./customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('./customer/jwt/TokenUnverifiedError')
const BigCommerceCustomerTokenExpiredError = require('./customer/jwt/TokenExpiredError')
const shapeRequestError = require('./customer/shapeRequestError')

class BigCommerceCustomerRepository {
  /**
   * @param {BigCommerce} apiClientV2
   */
  constructor (apiClientV2) {
    this.apiClientV2 = apiClientV2
  }

  /**
   * @param {string} clientId
   * @param {string} accessToken
   * @param {string} storeHash
   * @returns {BigCommerceCustomerRepository}
   */
  static create (clientId, accessToken, storeHash) {
    const bigcommerceV2 = new BigCommerce({
      logLevel: 'info',
      clientId,
      accessToken,
      storeHash,
      responseType: 'json',
      apiVersion: 'v2'
    })
    return new BigCommerceCustomerRepository(bigcommerceV2)
  }

  /**
   * @param {string} token JWT token
   * @param {string} appClientSecret Secret with which token was signed.
   * @returns {BigCommerceCurrentCustomer}
   */
  static getCurrentCustomerFromJWTToken (token, appClientSecret) {
    let decoded
    try {
      decoded = jwtDecoder.decode(token, appClientSecret, false, 'HS512')
    } catch (err) {
      if (err.message === 'Signature verification failed') {
        throw new BigCommerceCustomerTokenUnverifiedError(token)
      }

      if (err.message === 'Token expired') {
        throw new BigCommerceCustomerTokenExpiredError(token)
      }

      throw err
    }

    if (!decoded.customer) {
      throw new BigCommerceCustomerTokenInvalidError(token)
    }

    return {
      id: decoded.customer.id,
      email: decoded.customer.email,
      groupId: decoded.customer.group_id
    }
  }

  /**
   * @param {string} email
   * @returns {Promise<BigCommerceCustomerByEmail>}
   */
  async getCustomerByEmail (email) {
    const uri = `/customers?email=${encodeURIComponent(email)}`
    try {
      const customers = await this.apiClientV2.get(uri)

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
    const customer = await this.apiClientV2.get(uri)


    return customer
  }

  /**
   * @param {number} customerId
   * @returns {Promise<Object>}
   */
  async getAddresses (customerId) {
    const uri = `/customers/${customerId}/addresses`
    const addresses = await this.apiClientV2.get(uri)
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
    const valid = await this.apiClientV2.post(uri, { password })

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
      await this.apiClientV2.put(uri, customer)
    } catch (e) {
      throw shapeRequestError(e)
    }
  }
}

module.exports = BigCommerceCustomerRepository
