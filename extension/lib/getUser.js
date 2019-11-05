const ShopgateUser = require('./shopgate/User')
const { getCustomerById } = require('./shopgate/customer/get')
const { decorateError } = require('./shopgate/logDecorator')
const UserDataExpiredError = require('./shopgate/customer/errors/UserDataExpiredError')
const UnauthorisedError = require('./shopgate/customer/errors/UnauthorisedError')

/**
 * @param {PipelineContext} context
 * @returns {Promise<getUserResponse>}
 */
module.exports = async (context) => {
  if (!context.meta.userId) {
    throw new UnauthorisedError('Permission denied: User is not logged in.')
  }

  const user = ShopgateUser.create(context)
  let userInfo
  try {
    userInfo = await user.get()
    if (!userInfo) {
      userInfo = await tryGettingFreshCustomer(context, parseInt(context.meta.userId), userInfo)
    }
  } catch (err) {
    userInfo = err instanceof UserDataExpiredError ? {userData : err.getUserData()} : null

    if (!(err instanceof UserDataExpiredError)) {
      context.log.error(decorateError(err), 'Failed getting shopgate user')
    }

    // if fresh data is not available we will not interrupt the process but use the stale data instead
    // if we want to do something else when data is too old, err.getExpiredDSince gives milliseconds since expiry.
    userInfo = await tryGettingFreshCustomer(context, parseInt(context.meta.userId), userInfo)
  }

  if (!userInfo) {
    context.log.error('No user information available')
    throw new Error()
  }

  return userInfo.userData
}

/**
 * @param {PipelineContext} context
 * @param {number} id
 * @param {LoginResponse} expiredData
 * @returns {Promise<Object>}
 */
async function tryGettingFreshCustomer (context, id, expiredData) {
  try {
    const fresh = await getCustomerById(context, id)
    const user = ShopgateUser.create(context)
    try {
      await user.store(fresh)
    } catch (err) {
      context.log.error(decorateError(err), `Failed saving fresh data for ${id}`)
    }
    context.log.warn(`delivering fresh data ${id}`)
    return fresh
  } catch (err) {
    context.log.error(decorateError(err), `Unable to get the customer for id ${id}`)
    context.log.warn(decorateError(err), `delivering stale data ${id}`)
    return expiredData
  }
}
