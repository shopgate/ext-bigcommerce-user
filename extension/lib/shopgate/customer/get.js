const BigCommerceCustomerRepository = require('../../bigcommerce/CustomerRepository')
const { decorateError } = require('../logDecorator')
const ClientRequestError = require('./errors/ClientRequestError')
const UnknownError = require('./errors/UnknownError')
const BigCommerceRequestClientError = require('../../bigcommerce/customer/request/ClientError')

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
    if (e instanceof BigCommerceRequestClientError) {
      throw new ClientRequestError(e.message)
    }
    context.log.error(decorateError(e), e.message)
    throw new UnknownError()
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
