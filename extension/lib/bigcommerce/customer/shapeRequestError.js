const BigCommerceRequestClientError = require('./request/ClientError')
const BigCommerceRequestUnparseableMessageError = require('./request/UnparsableMessageError')

module.exports = function shapeRequestError (err) {
  // Try parsing the (potential) underlying api error
  const errorMessageMatch = err.message.match(/({.+})/)
  if (!errorMessageMatch) {
    return err
  }

  let parsed
  try {
    parsed = JSON.parse(errorMessageMatch[1])
  } catch (unparseable) {
    return new BigCommerceRequestUnparseableMessageError('unable to parse')
  }

  const { message, status, details } = parsed
  if (details && details.invalid_reason) {
    return new BigCommerceRequestClientError(status, details.invalid_reason)
  }

  if (message && status && status >= 400 && status < 500) {
    return new BigCommerceRequestClientError(status, message)
  }

  return err
}
