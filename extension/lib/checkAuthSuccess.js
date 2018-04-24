/**
 * Full version will be delivered within ApiLogin/Logout story
 *
 * @param {PipelineContext} context
 * @param {Object} input
 * @param {boolean} input.authSuccess
 * @param {string} input.authType
 * @returns {Promise<void>}
 */
module.exports = async function (context, input) {
  if (input.authSuccess !== true) {
    context.log.error(input.authType + ': Auth step finished unsuccessfully.')
    const e = new Error()
    e.code = 'EAUTHFAILED'
    throw e
  }
}
