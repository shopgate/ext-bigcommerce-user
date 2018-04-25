const jwtDecoder = require('jwt-simple')
const BigCommerceCustomerTokenInvalidError = require('./customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('./customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenExpiredError = require('./customer/jwt/TokenExpiredError')

class BigCommerceCustomerRepository {
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
}

module.exports = BigCommerceCustomerRepository
