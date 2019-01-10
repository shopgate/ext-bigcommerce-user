const assert = require('assert')
const subjectUnderTest = require('../../../../../lib/bigcommerce/customer/shapeRequestError')
const BigCommerceRequestUnparseableMessageError = require('../../../../../lib/bigcommerce/customer/request/UnparsableMessageError')

describe('shapeRequestError', function () {
  it('should parse incoming error and give the inner message out', function () {
    const err = {
      message: 'Request returned error code: 400 and body: [{"status":400,"message":"The field \'email\' is invalid."}]'
    }
    const actual = subjectUnderTest(err)
    assert.strictEqual(actual.message, 'The field \'email\' is invalid.')
  })

  it('should parse incoming error and give out details when available', function () {
    const err = {
      message: 'Request returned error code: 400 and body: [{"status":400,"message":"The field \'email\' is invalid.","details":{"invalid_reason":"This email address is already in use by a customer."}}]'
    }
    const actual = subjectUnderTest(err)
    assert.strictEqual(actual.message, 'This email address is already in use by a customer.')
  })

  it('should report failure with unparseable messages', function () {
    const err = {
      message: 'Request returned error code: 400 and body: [{"status}]'
    }
    const actual = subjectUnderTest(err)
    assert.ok(actual instanceof BigCommerceRequestUnparseableMessageError)
  })
})
