const InvalidPayloadError = require('../../shopgate/customer/errors/InvalidTokenReceivedError')
const { decorateError } = require('../../shopgate/logDecorator')

/**
 * JWT error catcher
 *
 * @param {Error} error
 * @param {PipelineContext} context
 *
 * @throws InvalidPayloadError
 */
module.exports = async (error, context) => {
  if (error.message === 'Signature verification failed') {
    context.log.error(decorateError(error, 'low'), error.message)

    throw new InvalidPayloadError()
  }

  if (error.message === 'Token expired') {
    context.log.error(decorateError(error, 'low'), error.message)

    throw new InvalidPayloadError()
  }

  if (error.message === 'Malformed jwt payload provided') {
    context.log.error(decorateError(error, 'security'), 'Received invalid token for authorising auto-login.')

    throw new InvalidPayloadError()
  }

  throw error
}
