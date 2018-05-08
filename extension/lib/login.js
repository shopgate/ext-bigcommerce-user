const BigCommerce = require('node-bigcommerce')
const request = require('request-promise-native')
const get = require('lodash.get')
const InvalidCredentialsError = require('./errors/InvalidCredentialsError')
const BigcommerceCustomerRepository = require('./respository/BigcommerceCustomerRepository')

let customerRepo

/**
 * @param {PipelineContext} context
 * @param {LoginInput} input
 * @returns {Promise<LoginResponse>}
 */
module.exports = async (context, input) => {
  if (!customerRepo) {
    customerRepo = BigcommerceCustomerRepository.getInstance(new BigCommerce({
      logLevel: 'info',
      clientId: context.config.clientId,
      accessToken: context.config.accessToken,
      storeHash: context.config.storeHash,
      responseType: 'json',
      apiVersion: 'v2'
    }))
  }

  try {
    const success = await submitLoginForm(
      `${input.shopUrl}/login.php?action=check_login`,
      input.parameters.login,
      input.parameters.password
    )
    if (!success) {
      throw new InvalidCredentialsError()
    }

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
    console.log(e)
    throw e
  }
}

const submitLoginForm = async (url, email, password) => {
  try {
    let options = {
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
    if (get(e, 'name') === 'StatusCodeError' && get(e, 'statusCode') === 302) {
      const location = get(e, 'response.headers.location', '')
      if (location.includes('/account.php')) {
        // We're being redirected to the "account" page --> login was successful.
        return true
      }
      if (location.includes('/login.php')) {
        // We're being redirected to the login page --> credentials were invalid.
        return false
      }
    }
    // Some other error that we don't know how to handle.
    throw e
  }

  // The login action normally never returns 200.
  throw new Error('Unexpected 200 response from Bigcommerce login action.')
}
