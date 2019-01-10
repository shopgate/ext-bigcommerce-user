const CurrentCustomer = require('./bigcommerce/CustomerRepository')
const BigCommerceCustomerTokenInvalidError = require('./bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('./bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenExpiredError = require('./bigcommerce/customer/jwt/TokenExpiredError')
const ShopgateAutologinInvalidTokenReceivedError = require('./shopgate/customer/errors/InvalidTokenReceivedError')
const { decorateError } = require('./shopgate/logDecorator')
const getCustomer = require('./shopgate/customer/get')
const UserNotFoundError = require('./shopgate/customer/errors/UserNotFoundError')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @param {string} input.token
 */
module.exports = async (context, input) => {
  let currentCustomer = null
  try {
    currentCustomer = CurrentCustomer.getCurrentCustomerFromJWTToken(input.token, context.config.bigCommerceAppClientSecret)
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

  return getCustomerFor(context, currentCustomer.email)
}

async function getCustomerFor (context, login) {
  try {
    return await getCustomer(context, login)
  } catch (err) {
    context.log.error(decorateError(err), err instanceof UserNotFoundError ? 'User was expected to exist but was not found' : `Unable to get the customer of ${login}`)
    throw new Error()
  }
}
