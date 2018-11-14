const InvalidCredentialsError = require('./shopgate/customer/errors/InvalidCredentialsError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const { decorateError } = require('./shopgate/logDecorator')

let customerRepo

/**
 * @param {string} email email address to check
 * @returns {string} lowercase email if valid
 */
function validateEmail (email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

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
    if (e.message && e.message === 'customer not found') {
      throw new InvalidCredentialsError()
    }

    // Bigcommerce api actually throws a bad request when email invalid
    if (!validateEmail(login)) {
      throw new InvalidCredentialsError()
    }

    context.log.error(decorateError(e), 'Error in login process.')
    throw e
  }
}
