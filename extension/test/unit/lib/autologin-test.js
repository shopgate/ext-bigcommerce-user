const currentCustomer = require('../../../lib/bigcommerce/CustomerRepository')
const BigCommerceCustomerTokenInvalidError = require('../../../lib/bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenUnverifiedError = require('../../../lib/bigcommerce/customer/jwt/TokenInvalidError')
const BigCommerceCustomerTokenExpiredError = require('../../../lib/bigcommerce/customer/jwt/TokenExpiredError')
const ShopgateAutologinInvalidTokenReceivedError = require('../../../lib/shopgate/customer/errors/InvalidTokenReceivedError')
let subjectUnderTest = require('../../../lib/autologin')

const assert = require('assert')
const sinon = require('sinon')
const Logger = require('bunyan')
const proxyquire = require('proxyquire')

const { assertThrowsAsync } = require('../../util/assertThrowsAsync')

describe('autologin', function () {
  let sandbox
  let context =
    /** @type PipelineContext */
    {
      config: {
        bigCommerceAppClientSecret: 'super secret'
      }
    }

  let currentCustomerStub, getCustomerStub

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    context.log = sandbox.createStubInstance(Logger)
    currentCustomerStub = sandbox.stub(currentCustomer, 'getCurrentCustomerFromJWTToken')
    getCustomerStub = sandbox.stub()
    subjectUnderTest = proxyquire('../../../lib/autologin', {
      './shopgate/customer/get': { getCustomer: getCustomerStub }
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return customer id and email', async function () {
    currentCustomerStub.returns({ id: '123', email: 'test@shopgate.com' })
    getCustomerStub.returns({
      userId: '123456',
      userData: {
        id: '123456',
        mail: 'bigc@shopgate.com',
        firstName: 'Big',
        lastName: 'Commerce',
        phone: 'phone number',
        customerGroups: [],
        addresses: []
      }
    })

    const result = await subjectUnderTest(context, { token: 'fake token' })

    assert.deepStrictEqual(result, {
      userId: '123456',
      userData: {
        id: '123456',
        mail: 'bigc@shopgate.com',
        firstName: 'Big',
        lastName: 'Commerce',
        phone: 'phone number',
        customerGroups: [],
        addresses: []
      }
    })
    assert(currentCustomerStub.calledWithExactly('fake token', 'super secret'))
  })

  it('should provide invalid token error when provided token is expired ', async function () {
    const err = new BigCommerceCustomerTokenExpiredError('fake token')
    currentCustomerStub.throws(err)

    await assertThrowsAsync(subjectUnderTest(context, { token: 'fake token' }), ShopgateAutologinInvalidTokenReceivedError)
    assert(context.log.error.calledOnce)
  })

  it('should provide invalid token error when provided token can\'t be verified', async function () {
    const err = new BigCommerceCustomerTokenUnverifiedError('fake token')
    currentCustomerStub.throws(err)

    await assertThrowsAsync(subjectUnderTest(context, { token: 'fake token' }), ShopgateAutologinInvalidTokenReceivedError)
    assert(context.log.error.calledOnce)
  })

  it('should provide invalid token error when provided token has invalid content', async function () {
    const err = new BigCommerceCustomerTokenInvalidError('fake token')
    currentCustomerStub.throws(err)

    await assertThrowsAsync(subjectUnderTest(context, { token: 'fake token' }), ShopgateAutologinInvalidTokenReceivedError)
    assert(context.log.error.calledOnce)
  })

  it('should forward all other kind of errors', async function () {
    currentCustomerStub.throws(new Error('fake token'))

    await assertThrowsAsync(subjectUnderTest(context, { token: 'fake token' }), Error)
    assert(context.log.error.calledOnce)
  })
})
