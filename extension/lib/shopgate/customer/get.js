const BigCommerceCustomerRepository = require('../../bigcommerce/CustomerRepository')
const { decorateError } = require('../logDecorator')
const ClientRequestError = require('./errors/ClientRequestError')
const UnknownError = require('./errors/UnknownError')
const UserNotFoundError = require('./errors/UserNotFoundError')

let customerRepo = null
/**
 * @param {PipelineContext} context
 * @param {string} email
 * @return {Promise<LoginResponse>}
 */
module.exports = async function getCustomer (context, email) {
  if (!customerRepo) {
    customerRepo = BigCommerceCustomerRepository.create(
      context.config.clientId,
      context.config.accessToken,
      context.config.storeHash
    )
  }

  let customer = null
  try {
    customer = await customerRepo.getCustomerByEmail(email)
  } catch (e) {
    // Try parsing the (potential) underlying api error
    const errorMessageMatch = e.message.match(/({.+})/)

    if (!errorMessageMatch) {
      context.log.error(decorateError(e), 'Error in login process.')
      throw new UnknownError()
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

    if (!parsed) {
      context.log.error(decorateError(e), 'Empty error message')
      throw new UnknownError()
    }

    const { message, status } = parsed
    if (message && status && status >= 400 && status < 500) {
      // Give api message back to user
      throw new ClientRequestError(message)
    }

    // Log anything that's not due to bad input
    context.log.error(decorateError(e), 'Error in login process.')

    throw new UnknownError()
  }

  if (customer === null) {
    throw new UserNotFoundError(email)
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
}
