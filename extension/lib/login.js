const InvalidCredentialsError = require('./shopgate/customer/errors/InvalidCredentialsError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const { decorateError } = require('./shopgate/logDecorator')

let customerRepo

/**
 * @param {PipelineContext} context
 * @param {LoginInput} input
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

  try {
    const { login, password } = input.parameters

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
        // TODO add this when there is a specification for addresses
        // addresses: addresses.map(address => ({
        //   firstName: address.first_name,
        //   lastName: address.last_name,
        //   street: address.street_1,
        //   city: address.city,
        //   state: address.state,
        //   zip: address.zip,
        //   country: address.country
        // }))
      }
    }
    // TODO add this when there is a specification for addresses
    // const addresses = await customerRepo.getAddresses(customer.id.toString())
  } catch (e) {
    context.log.error(decorateError(e), 'Error in login process.')
    throw e
  }
}
