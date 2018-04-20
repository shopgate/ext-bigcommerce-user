const BigCommerce = require('node-bigcommerce')
const request = require('request-promise-native')
const get = require('lodash.get')
const InvalidCredentialsError = require('./errors/InvalidCredentialsError')

let apiClientV2

/**
 * @param {PipelineContext} context
 * @param {LoginInput} input
 * @returns {Promise<LoginResponse>}
 */
module.exports = async (context, input) => {
  if (!apiClientV2) {
    apiClientV2 = new BigCommerce({
      logLevel: 'info',
      clientId: context.config.clientId,
      accessToken: context.config.accessToken,
      storeHash: context.config.storeHash,
      responseType: 'json',
      apiVersion: 'v2'
    })
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

    const uri = `/customers?email=${encodeURIComponent(input.parameters.login)}`
    const customers = await apiClientV2.get(uri)
    if (!customers || customers.length < 1) {
      throw new Error('customer not found')
    }
    const customer = customers[0]

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
        customerGroups: [],
        addresses: []
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
        // 'SHOP_SESSION_TOKEN'
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
