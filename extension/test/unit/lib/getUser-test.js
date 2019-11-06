const chai = require('chai')
chai.use(require('chai-as-promised')).should()

const sinon = require('sinon')
const Logger = require('bunyan')
const proxyquire = require('proxyquire')

let subjectUnderTest = require('../../../lib/getUser')
const ShopgateUser = require('../../../lib/shopgate/User')
const UnauthorisedError = require('../../../lib/shopgate/customer/errors/UnauthorisedError')
const UserDataExpiredError = require('../../../lib/shopgate/customer/errors/UserDataExpiredError')

describe('getUser', function () {
  const sandbox = sinon.createSandbox()

  let context =
    /** @type PipelineContext */
    {
      meta: {
        userId: '123456'
      }
    }

  let getCustomerByIdStub, shopgateUserStub

  beforeEach(() => {
    context.log = sandbox.createStubInstance(Logger)
    shopgateUserStub = sandbox.createStubInstance(ShopgateUser)
    sandbox.stub(ShopgateUser, 'create').returns(shopgateUserStub)
    getCustomerByIdStub = sandbox.stub()
    subjectUnderTest = proxyquire('../../../lib/getUser', {
      './shopgate/customer/get': { getCustomerById: getCustomerByIdStub }
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return user data from the storage', async function () {
    shopgateUserStub.get.resolves({
      userId: '123456',
      userData: {
        id: '123456',
        mail: 'bigc@shopgate.com',
        firstName: 'Big',
        lastName: 'Commerce',
        phone: 'phone number',
        customerGroups: [],
        addresses: []
      },
      ttl: 120000
    })

    await subjectUnderTest(context).should.eventually.deep.equal({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    })

    sinon.assert.called(shopgateUserStub.get)
    sinon.assert.notCalled(getCustomerByIdStub)
  })

  it('should deny executing if user is not logged in', async function () {
    await subjectUnderTest({ meta: {} }).should.eventually.be.rejectedWith(UnauthorisedError)
    sinon.assert.notCalled(shopgateUserStub.get)
    sinon.assert.notCalled(getCustomerByIdStub)
  })

  it('should try to fetch & store fresh data when the user is logged in but it doesn\'t exist in the storage', async function () {
    shopgateUserStub.get.resolves(null)

    getCustomerByIdStub.resolves({
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

    await subjectUnderTest(context).should.eventually.deep.equal({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    })

    sinon.assert.called(shopgateUserStub.get)
    sinon.assert.called(getCustomerByIdStub)
    sinon.assert.called(shopgateUserStub.store)
  })

  it('should try to fetch & store fresh data when the one we have is expired', async function () {
    const error = new UserDataExpiredError({}, 123456, 120000)
    shopgateUserStub.get.throws(error)

    getCustomerByIdStub.resolves({
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

    await subjectUnderTest(context).should.eventually.deep.equal({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    })

    sinon.assert.called(shopgateUserStub.get)
    sinon.assert.called(getCustomerByIdStub)
    sinon.assert.called(shopgateUserStub.store)
  })

  it('should deliver freshly fetched data when it store fails', async function () {
    const error = new UserDataExpiredError({}, 123456, 120000)
    shopgateUserStub.get.throws(error)
    getCustomerByIdStub.resolves({
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
    shopgateUserStub.store.throws(Error)

    await subjectUnderTest(context).should.eventually.deep.equal({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    })

    sinon.assert.called(shopgateUserStub.get)
    sinon.assert.called(getCustomerByIdStub)
    sinon.assert.called(shopgateUserStub.store)
  })

  it('should deliver stale data when fetched one is not available', async function () {
    const error = new UserDataExpiredError({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    }, 123456, 120000)
    shopgateUserStub.get.throws(error)

    getCustomerByIdStub.rejects(Error)

    await subjectUnderTest(context).should.eventually.deep.equal({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: []
    })

    sinon.assert.called(shopgateUserStub.get)
    sinon.assert.called(getCustomerByIdStub)
  })

  it('should be rejected when no data is available', async function () {
    shopgateUserStub.get.throws(Error)
    getCustomerByIdStub.rejects(Error)

    await subjectUnderTest(context).should.eventually.be.rejectedWith(Error)

    sinon.assert.called(shopgateUserStub.get)
    sinon.assert.called(getCustomerByIdStub)
    sinon.assert.calledWith(context.log.error, 'No user information available')
  })
})
