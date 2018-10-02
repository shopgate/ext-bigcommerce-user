const { decorateError } = require('./shopgate/logDecorator')
/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async (context, input) => {
  try {
    await context.storage.user.set('userInfo', input.userData)
  } catch (err) {
    context.log.error(decorateError(err), 'failed to store user data')
    throw new Error(`User storage error ${err}`)
  }
  return {}
}
