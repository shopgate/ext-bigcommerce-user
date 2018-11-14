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
    if (errorMessageMatch) {
      try {
        const { message, status } = JSON.parse(errorMessageMatch[1])

        if (message && status) {
          if (status >= 400 && status < 500) {
            returnError.code = 'EINVALID'
            returnError.message = message
          }
        }
      } catch (unparseable) {
        context.log.error(
          decorateError(unparseable),
          'Unable to process the error from BigC api'
        )
      }
    }

    if (returnError.code === 'EUNKNOWN') {
      // Log anything thats unknown
      context.log.error(decorateError(e), 'Error in login process.')
    }

    throw returnError
  }
}
