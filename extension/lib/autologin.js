const { decorateError } = require('./shopgate/logDecorator')
const { getCustomer } = require('./shopgate/customer/get')
const UserNotFoundError = require('./shopgate/customer/errors/UserNotFoundError')

/**
 * @param {PipelineContext} context
 * @param {Object} input
 * @param {BigCommerceCurrentCustomer} input.customer
 */
module.exports = async (context, input) => {
  try {
    return await getCustomer(context, input.customer.email)
  } catch (err) {
    context.log.error(decorateError(err), err instanceof UserNotFoundError ? 'User was expected to exist but was not found' : `Unable to get the customer of ${input.customer.email}`)
    throw new Error()
  }
}
