/**
 * @param {object} context
 * @param {object} input
 */
module.exports = async (context, input) => {
  try {
    await context.storage.user.set('userInfo', input.userData)
  } catch (err) {
    context.log.error(`failed to store user data: ${err}`)
    throw new Error(`User storage error ${err}`)
  }
  return {}
}
