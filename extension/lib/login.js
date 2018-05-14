const request = require('request-promise-native')
const get = require('lodash.get')
const InvalidCredentialsError = require('./shopgate/customer/errors/InvalidCredentialsError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')

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
    await submitLoginForm(
      `${input.shopUrl}/login.php?action=check_login`,
      input.parameters.login,
      input.parameters.password
    )

    const customer = await customerRepo.getCustomerByEmail(input.parameters.login)

    // TODO add this when there is a specification for addresses
    // const addresses = await customerRepo.getAddresses(customer.id.toString())

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
        customerGroups: customer.customer_group_id ? [customer.customer_group_id] : [],
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
  } catch (e) {
    context.log.error(e)
    throw e
  }
}

/**
 * @param {string} url
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
const submitLoginForm = async (url, email, password) => {
  try {
    const options = {
      url,
      method: 'POST',
      form: {
        login_email: email,
        login_pass: password
      },
      resolveWithFullResponse: true
    }
    await request(options)
  } catch (e) {
    if (!(get(e, 'name') === 'StatusCodeError' && get(e, 'statusCode') === 302)) {
      throw e
    }

    const location = get(e, 'response.headers.location', '')

    if (location.includes('/login.php')) {
      // We're being redirected to the login page --> credentials were invalid.
      throw new InvalidCredentialsError()
    }

    if (location.includes('/account.php')) {
      // We're being redirected to the "account" page --> login was successful.
      return
    }

    // Some other error that we don't know how to handle.
    throw e
  }

  // The login action normally never returns 200.
  throw new Error('Unexpected 200 response from Bigcommerce login action.')
}
