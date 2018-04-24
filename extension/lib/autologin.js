const CurrentCustomer = require('./bigcommerce/CustomerRepository')
const BigCommerceCustomerTokenInvalidError = require('./bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('./bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenExpiredError = require('./bigcommerce/customer/jwt/TokenExpiredError')
const ShopgateAutologinInvalidTokenReceivedError = require('./shopgate/customer/autologin/InvalidTokenReceivedError')
const { decorateError } = require('./shopgate/logDecorator')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @param {string} input.token
 */
module.exports = async (context, input) => {
  try {
    const currentCustomer = CurrentCustomer.getCurrentCustomerFromJWTToken(input.token, context.config.bigCommerceAppClientSecret)

    return {
      customerId: currentCustomer.id,
      email: currentCustomer.email
    }
  } catch (err) {
    if (err instanceof BigCommerceCustomerTokenInvalidError) {
      context.log.error(decorateError(err, 'security'), 'Received invalid token for authorising auto-login.')

      throw new ShopgateAutologinInvalidTokenReceivedError()
    }

    context.log.error(decorateError(err), 'Error in processing auto-login.')

    if (err instanceof BigCommerceCustomerTokenUnverifiedError || err instanceof BigCommerceCustomerTokenExpiredError) {
      throw new ShopgateAutologinInvalidTokenReceivedError()
    }

    throw err
  }
}
