const UnauthorisedError = require('./shopgate/customer/errors/UnauthorisedError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const ClientRequestError = require('./shopgate/customer/errors/ClientRequestError')
const UnknownError = require('./shopgate/customer/errors/UnknownError')
const BigCommerceRequestClientError = require('./bigcommerce/customer/request/ClientError')

const { decorateError } = require('./shopgate/logDecorator')

/** @var {BigCommerceCustomerRepository} */
let customerRepo

/**
 * @param {PipelineContext} context
 * @param {string} mail
 * @returns {Promise}
 */
module.exports = async (context, { mail }) => {
  if (!context.meta.userId) {
    throw new UnauthorisedError('Permission denied: User is not logged in.')
  }
  if (!customerRepo) {
    customerRepo = BigCommerceCustomerRepository.create(
      context.config.clientId,
      context.config.accessToken,
      context.config.storeHash
    )
  }

  try {
    await customerRepo.update(parseInt(context.meta.userId), {
      email: mail
    })
  } catch (e) {
    if (e instanceof BigCommerceRequestClientError) {
      throw new ClientRequestError(e.message)
    }
    context.log.error(decorateError(e), e.message)
    throw new UnknownError()
  }
}
