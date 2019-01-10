const _ = {
  isNil: require('lodash.isnil'),
  omitBy: require('lodash.omitby')
}

const { decorateError } = require('./shopgate/logDecorator')
/**
 * @param {Object} context
 * @param {Object} input
 */
module.exports = async (context, { firstName, lastName, mail }) => {
  let userData
  try {
    userData = await context.storage.user.get('userInfo')
  } catch (err) {
    context.log.error(decorateError(err), 'failed to get user data from the storage')
    throw new Error(`User storage error ${err}`)
  }

  const modifiedData = _.omitBy({
    firstName,
    lastName,
    mail
  }, _.isNil)

  Object.keys(modifiedData).forEach(key => {
    userData[key] = modifiedData[key]
  })
  return { userData }
}
