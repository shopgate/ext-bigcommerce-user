const UnauthorisedError = require('./shopgate/customer/UnauthorisedError')
/**
 * @param {PipelineContext} context
 * @returns {Promise<getUserResponse>}
 */
module.exports = async (context) => {
  if (!context.meta.userId) {
    throw new UnauthorisedError('Permission denied: User is not logged in.')
  }

  return {
    id: context.meta.userId
  }
}
