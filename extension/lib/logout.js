const ShopgateUser = require('./shopgate/User')
const { decorateError } = require('./shopgate/logDecorator')

/**
 * @param {PipelineContext} context
 * @returns {Promise}
 */
module.exports = async (context) => {
  try {
    const user = ShopgateUser.create(context)
    await user.remove()
  } catch (err) {
    context.log.error(decorateError(err), 'failed to remove userInfo')
    throw new Error()
  }
}
