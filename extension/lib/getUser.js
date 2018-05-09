const UnauthorisedError = require('./shopgate/customer/UnauthorisedError')
/**
 * @param {PipelineContext} context
 * @returns {Promise<getUserResponse>}
 */
module.exports = async (context) => {
  if (!context.meta.userId) {
    throw new UnauthorisedError('Permission denied: User is not logged in.')
  }

  const userInfo = await context.storage.user.get('userInfo')
  if (userInfo) {
    return userInfo
  }

  return {
    id: context.meta.userId
  }
}
