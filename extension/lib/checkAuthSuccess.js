const UnknownError = require('./errors/UnknownError')

/**
 * @typedef {object} input
 * @property {object} sgxsMeta
 * @property {string} sessionId
 *
 * @param context
 * @param input
 * @param cb
 * @returns {*}
 */
module.exports = function (context, input, cb) {
  if (input.authSuccess !== true) {
    context.log.error(input.authType + ': Auth step finished unsuccessfully.')
    return cb(new UnknownError(), null)
  }

  return cb(null, {})
}
