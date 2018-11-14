const InvalidCredentialsError = require('./shopgate/customer/errors/InvalidCredentialsError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const { decorateError } = require('./shopgate/logDecorator')

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
  try {
    const customer = await customerRepo.getCustomerByEmail(login)

    if (!customer) {
      throw new InvalidCredentialsError()
    }

    const success = await customerRepo.login(customer.id, password)

    if (!success) {
      throw new InvalidCredentialsError()
    }

    return {
      userId: customer.id.toString(),
      userData: {
        id: customer.id.toString(),
        mail: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        gender: null,
        birthday: null,
        phone: customer.phone,
        customerGroups: customer.customer_group_id
          ? [customer.customer_group_id]
          : [],
        addresses: []
      }
    }
  } catch (e) {
    // We know it just failed, return
    if (e instanceof InvalidCredentialsError) throw e

    const returnError = new Error()
    returnError.code = 'EUNKNOWN'

    // Try parsing the (potential) underlying api error
    const errorMessageMatch = e.message.match(/({.+})/)

    if (!errorMessageMatch) {
      context.log.error(decorateError(e), 'Error in login process.')
      throw returnError
    }

    let parsed
    try {
      parsed = JSON.parse(errorMessageMatch[1])
    } catch (unparseable) {
      context.log.error(
        decorateError(unparseable),
        'Unable to process the error from BigC api'
      )
    }

    if (!parsed) throw returnError

    const { message, status } = parsed
    if (message && status && status >= 400 && status < 500) {
      const error = new Error(message)
      error.code = 'EUNKNOWN'

      // Give api message back to user
      throw error
    }

    // Log anything thats not due to bad input
    context.log.error(decorateError(e), 'Error in login process.')

    throw returnError
  }
}
