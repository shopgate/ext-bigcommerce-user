const ShopgateUser = require('./shopgate/User')
const { decorateError } = require('./shopgate/logDecorator')
/**
 * @param {PipelineContext} context
 * @param {Object} userData
 */
module.exports = async (context, { userData }) => {
  const user = ShopgateUser.create(context)
  try {
    await user.store(userData)
  } catch (err) {
    context.log.error(decorateError(err), 'failed to store user data')
    throw new Error()
  }
}
