const jwtDecoder = require('jwt-simple')
const BigCommerceCustomerTokenInvalidError = require('./customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('./customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenExpiredError = require('./customer/jwt/TokenExpiredError')
const BigCommerce = require('node-bigcommerce')

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
    const customers = await this.apiClientV2.get(uri)
    return customers[0]
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
}

module.exports = BigCommerceCustomerRepository
