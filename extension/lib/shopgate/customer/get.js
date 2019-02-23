const BigCommerceCustomerRepository = require('../../bigcommerce/CustomerRepository')
const { decorateError } = require('../logDecorator')
const ClientRequestError = require('./errors/ClientRequestError')
const UnknownError = require('./errors/UnknownError')
const UserNotFoundError = require('./errors/UserNotFoundError')
const BigCommerceRequestClientError = require('../../bigcommerce/customer/request/ClientError')

let customerRepo = null
/**
 * @param {PipelineContext} context
 * @param {string} email
 * @return {Promise<LoginResponse>}
 */
async function getCustomer (context, email) {
  if (!customerRepo) {
    customerRepo = BigCommerceCustomerRepository.create(
      context.config.clientId,
      context.config.accessToken,
      context.config.storeHash,
      context.log
    )
  }

  let customer = null
  try {
    customer = await customerRepo.getCustomerByEmail(email)
  } catch (e) {
    if (e instanceof BigCommerceRequestClientError) {
      throw new ClientRequestError(e.message)
    }
    context.log.error(decorateError(e), e.message)
    throw new UnknownError()
  }

  if (customer === null) {
    throw new UserNotFoundError(email)
  }

  return formatResponse(customer)
}

/**
 * @param {PipelineContext} context
 * @param {number} id
 * @returns {Promise<LoginResponse>}
 */
async function getCustomerById (context, id) {
  if (!customerRepo) {
    customerRepo = BigCommerceCustomerRepository.create(
      context.config.clientId,
      context.config.accessToken,
      context.config.storeHash,
      context.log
    )
  }

  return formatResponse(await customerRepo.getCustomerById(id))
}

/**
 * @param bigCommerceCustomerResponse
 * @returns {LoginResponse}
 */
function formatResponse (bigCommerceCustomerResponse) {
  return {
    userId: bigCommerceCustomerResponse.id.toString(),
    userData: {
      id: bigCommerceCustomerResponse.id.toString(),
      mail: bigCommerceCustomerResponse.email,
      firstName: bigCommerceCustomerResponse.first_name,
      lastName: bigCommerceCustomerResponse.last_name,
      customAttributes: {
        phone: bigCommerceCustomerResponse.phone,
        company: bigCommerceCustomerResponse.company
      },
      userGroups: bigCommerceCustomerResponse.customer_group_id
        ? [bigCommerceCustomerResponse.customer_group_id]
        : [],
      addresses: []
    }
  }
}

module.exports = {
  getCustomer,
  getCustomerById
}
