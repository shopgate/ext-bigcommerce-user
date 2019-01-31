const UnauthorisedError = require('./shopgate/customer/errors/UnauthorisedError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const { decorateError } = require('./shopgate/logDecorator')
const InvalidCredentialsError = require('./shopgate/customer/errors/InvalidCredentialsError')

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

  let isValid
  try {
    isValid = await customerRepo.login(parseInt(context.meta.userId), password)
  } catch (err) {
    context.log.error(decorateError(err), 'Failed verifying user\'s password')
    throw new Error()
  }

  if (!isValid) {
    throw new InvalidCredentialsError()
  }
}
