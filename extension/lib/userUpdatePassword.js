const UnauthorisedError = require('./shopgate/customer/errors/UnauthorisedError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const { decorateError } = require('./shopgate/logDecorator')

/** @var {BigCommerceCustomerRepository} */
let customerRepo

/**
 * @param {PipelineContext} context
 * @param {string} password
 * @returns {Promise}
 */
module.exports = async (context, { password }) => {
  if (!context.meta.userId) {
    throw new UnauthorisedError('Permission denied: User is not logged in.')
  }
  if (!customerRepo) {
    customerRepo = BigCommerceCustomerRepository.create(
      context.config.clientId,
      context.config.accessToken,
      context.config.storeHash,
      context.log
    )
  }

  try {
    await customerRepo.update(parseInt(context.meta.userId), {
      _authentication: {
        password
      }
    })
  } catch (err) {
    context.log.error(decorateError(err), 'Failed updating users password')
    throw new Error()
  }
}
