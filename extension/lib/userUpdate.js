const UnauthorisedError = require('./shopgate/customer/errors/UnauthorisedError')
const InvalidCallError = require('./shopgate/pipeline/errors/InvalidCallError')
const BigCommerceCustomerRepository = require('./bigcommerce/CustomerRepository')
const { decorateError } = require('./shopgate/logDecorator')
const _ = {
  isNil: require('lodash.isnil'),
  omitBy: require('lodash.omitby')
}

/** @var {BigCommerceCustomerRepository} */
let customerRepo

/**
 * @param {PipelineContext} context
 * @param {string} firstName
 * @param {string} lastName
 * @param {Object} customAttributes
 * @returns {Promise}
 */
module.exports = async (context, { firstName, lastName, customAttributes }) => {
  if (!context.meta.userId) {
    throw new UnauthorisedError('Permission denied: User is not logged in.')
  }

  if (_.isNil(firstName) && _.isNil(lastName)) {
    throw new InvalidCallError()
  }

  if (!customerRepo) {
    customerRepo = BigCommerceCustomerRepository.create(
      context.config.clientId,
      context.config.accessToken,
      context.config.storeHash
    )
  }

  try {
    await customerRepo.update(parseInt(context.meta.userId), _.omitBy({
      first_name: firstName,
      last_name: lastName,
      phone: customAttributes.phone,
      company: customAttributes.company
    }, _.isNil))
  } catch (err) {
    context.log.error(decorateError(err), 'Failed updating user')
    throw new Error()
  }
}
