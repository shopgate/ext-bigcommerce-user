const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
chai.use(require('chai-as-promised')).should()
const Logger = require('bunyan')

// Pre-loading the module with all its dependencies in order to make the proxyquire call below
// Over a hundred times faster, so that it doesn't cause a timeout.
let login = require('../../../lib/login')

const BigCommerceCustomerRepository = require('../../../lib/bigcommerce/CustomerRepository')
const InvalidCredentialsError = require('../../../lib/shopgate/customer/errors/InvalidCredentialsError')
const UserNotFoundError = require('../../../lib/shopgate/customer/errors/UserNotFoundError')

describe('login()', async () => {
  const sandbox = sinon.createSandbox()
  let repoStub

  const context = {
    config: {
      clientId: '',
      accessToken: '',
      storeHash: ''
    }
  }
  const input = {
    shopUrl: 'https://store-r5s844ad.mybigcommerce.com',
    parameters: {
      login: 'john.doe@test.com',
      password: 'password1'
    }
  }

  const userDataFixture = {
    userId: '21',
    userData: {
      id: '21',
      mail: 'john.doe@test.com',
      firstName: 'John',
      lastName: 'Doe',
      gender: null,
      birthday: null,
      phone: '123456789',
      customerGroups: [10],
      addresses: []
    }
  }

  let getCustomerStub

  beforeEach(() => {
    context.log = sandbox.createStubInstance(Logger)

    getCustomerStub = sandbox.stub()
    login = proxyquire('../../../lib/login', {
      './shopgate/customer/get': getCustomerStub
    })

    repoStub = sandbox.createStubInstance(BigCommerceCustomerRepository)
    sandbox.stub(BigCommerceCustomerRepository, 'create').returns(repoStub)
  })

  afterEach(() => {
    sandbox.verifyAndRestore()
  })

  it('should return user data', async () => {
    const error = new Error()
    error.name = 'StatusCodeError'
    error.statusCode = 302
    error.response = { headers: { location: '/account.php' } }

    repoStub.login
      .withArgs(21, input.parameters.password)
      .resolves(true)

    getCustomerStub.returns(userDataFixture)

    const expected = {
      userId: '21',
      userData: {
        id: '21',
        mail: 'john.doe@test.com',
        firstName: 'John',
        lastName: 'Doe',
        gender: null,
        birthday: null,
        phone: '123456789',
        customerGroups: [10],
        addresses: []
      }
    }
    const actual = await login(context, input)

    chai.assert.deepEqual(actual, expected)
  })

  it('should throw an InvalidCredentialsError if the password cannot be validated', async () => {
    repoStub.login
      .withArgs(21, input.parameters.password)
      .resolves(false)
    getCustomerStub.returns(userDataFixture)

    return login(context, input).should.eventually.be.rejectedWith(InvalidCredentialsError)
  })

  it('should throw an Error if the customer cannot be found', async () => {
    getCustomerStub.throws(new UserNotFoundError(input.parameters.login))

    return login(context, input).should.eventually.be.rejectedWith(InvalidCredentialsError)
  })

  it('should throw an Error if the customer failed for unknown reasons', async () => {
    getCustomerStub.throws(new Error('fake error'))

    return login(context, input).should.eventually.be.rejectedWith(Error)
  })

  it('should log error and throw unkwnown errors at validate password', async () => {
    const error = new Error('this is a test')
    error.name = 'FooError'
    repoStub.login.rejects(error)

    await login(context, input).should.eventually.be.rejectedWith(Error)
      .and.have.property('code', 'EUNKNOWN')

    sinon.assert.calledOnce(context.log.error)
  })
})
