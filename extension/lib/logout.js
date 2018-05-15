const { decorateError } = require('./shopgate/logDecorator')
/**
 * @param {PipelineContext} context
 * @param {LoginInput} input
 * @returns {Promise<LoginResponse>}
 */
module.exports = async (context, input) => {
  try {
    await context.storage.user.del('userInfo')
  } catch (err) {
    context.log.error(decorateError(err), 'failed to remove userInfo')
    throw err
  }
}
