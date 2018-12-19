const InvalidCredentialsError = require('./shopgate/customer/errors/InvalidCredentialsError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const { decorateError } = require('./shopgate/logDecorator')
const getCustomer = require('./shopgate/customer/get')
const UnknownError = require('./shopgate/customer/errors/UnknownError')

let customerRepo

/**
 * @param {PipelineContext} context context
 * @param {LoginInput} input params
 * @returns {Promise<LoginResponse>}
 */
module.exports = async (context, input) => {
  if (!customerRepo) {
    customerRepo = BigCommerceCustomerRepository.create(
      context.config.clientId,
      context.config.accessToken,
      context.config.storeHash
    )
  }

  const { login, password } = input.parameters
  const customer = await getCustomer(context, login)

  let success = null
  try {
    success = await customerRepo.login(parseInt(customer.userId), password)
  } catch (e) {
    context.log.error(decorateError(e), 'Failed asking BigC to login')
    throw new UnknownError()
  }

  if (!success) {
    throw new InvalidCredentialsError()
  }

  return customer
}
