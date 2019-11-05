const chai = require('chai')
chai.use(require('chai-as-promised')).should()

const sinon = require('sinon')
const Logger = require('bunyan')

const ShopgateUser = require('../../../../lib/shopgate/User')
const UserDataExpiredError = require('../../../../lib/shopgate/customer/errors/UserDataExpiredError')

describe('ShopgateUser', function () {
  const sandbox = sinon.createSandbox()

  let context =
    /** @type PipelineContext */
    {
      meta: {
        userId: '123456'
      },
      config: {
        userInfoTTL: '5m'
      },
      storage: {}
    }

  beforeEach(() => {
    context.log = sandbox.createStubInstance(Logger)
    context.storage.user = {
      get: sandbox.stub(),
      set: sandbox.stub(),
      del: sandbox.stub()
    }
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should create instance of it\'s own', function () {
    return ShopgateUser.create(context).should.be.instanceOf(ShopgateUser)
  })

  it('should return user data from the storage', async function () {
    const touchTimeNow = new Date().toUTCString()
    const subjectUnderTest = ShopgateUser.create(context)
    context.storage.user.get.resolves({
      userData: {
        id: '123456',
        mail: 'bigc@shopgate.com',
        firstName: 'Big',
        lastName: 'Commerce',
        phone: 'phone number',
        customerGroups: [],
        addresses: []
      },
      touchTime: touchTimeNow
    })

    await subjectUnderTest.get().should.eventually.deep.equal({
      userData: {
        id: '123456',
        mail: 'bigc@shopgate.com',
        firstName: 'Big',
        lastName: 'Commerce',
        phone: 'phone number',
        customerGroups: [],
        addresses: []
      },
      touchTime: touchTimeNow
    })

    sinon.assert.called(context.storage.user.get)
  })

  it('should return null when there is nothing in storage', function () {
    const subjectUnderTest = ShopgateUser.create(context)
    context.storage.user.get.resolves()

    return subjectUnderTest.get().should.eventually.deep.equal(null)
  })

  it('should throw expired error when there is no time to live information in user data', function () {
    const subjectUnderTest = ShopgateUser.create(context)
    context.storage.user.get.resolves({
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

    return subjectUnderTest.get().should.eventually.be.rejectedWith(UserDataExpiredError)
  })

  it('should throw expired error when user data is expired', function () {
    const subjectUnderTest = ShopgateUser.create(context)
    context.storage.user.get.resolves({
      userData: {
        id: '123456',
        mail: 'bigc@shopgate.com',
        firstName: 'Big',
        lastName: 'Commerce',
        phone: 'phone number',
        customerGroups: [],
        addresses: []
      },
      touchTime: 'Mon, 28 Jan 2019 10:36:03 GMT'
    })

    return subjectUnderTest.get().should.eventually.be.rejectedWith(UserDataExpiredError)
      .and.have.deep.nested.property('userData', {
        id: '123456',
        mail: 'bigc@shopgate.com',
        firstName: 'Big',
        lastName: 'Commerce',
        phone: 'phone number',
        customerGroups: [],
        addresses: []
      })
  })

  it('should store user data', async function () {
    const subjectUnderTest = ShopgateUser.create(context)
    await subjectUnderTest.store({
      id: '123456',
      mail: 'bigc@shopgate.com',
      firstName: 'Big',
      lastName: 'Commerce',
      phone: 'phone number',
      customerGroups: [],
      addresses: [],
      touchTime: 'Mon, 28 Jan 2019 10:36:03 GMT'
    })
    sinon.assert.called(context.storage.user.set)
  })

  it('should remove user data', async function () {
    const subjectUnderTest = ShopgateUser.create(context)
    await subjectUnderTest.remove()
    sinon.assert.called(context.storage.user.del)
  })
})
