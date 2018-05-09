const jwtDecoder = require('jwt-simple')
const BigCommerceCustomerTokenInvalidError = require('./customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('./customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenExpiredError = require('./customer/jwt/TokenExpiredError')

class BigCommerceCustomerRepository {
  constructor (apiClientV2) {
    this.apiClientV2 = apiClientV2
  }

  static create (apiClientV2) {
    return new BigCommerceCustomerRepository(apiClientV2)
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

  async getCustomerByEmail (email) {
    const uri = `/customers?email=${encodeURIComponent(email)}`
    const customers = await this.apiClientV2.get(uri)
    if (!customers || customers.length < 1) {
      throw new Error('customer not found')
    }
    return customers[0]
  }

  async getAddresses (customerId) {
    const uri = `/customers/${customerId}/addresses`
    const addresses = await this.apiClientV2.get(uri)
    if (!addresses || addresses.length < 1) {
      return []
    }
    return addresses
  }
}

module.exports = BigCommerceCustomerRepository
