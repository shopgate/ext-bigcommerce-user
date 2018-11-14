const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
chai.use(require('chai-as-promised')).should()
const Logger = require('bunyan')

// Pre-loading the module with all its dependencies in order to make the proxyquire call below
// Over a hundred times faster, so that it doesn't cause a timeout.
require('../../../lib/login')

const BigCommerceCustomerRepository = require('../../../lib/bigcommerce/CustomerRepository')
const InvalidCredentialsError = require('../../../lib/shopgate/customer/errors/InvalidCredentialsError')

describe('login()', async () => {
  const sandbox = sinon.createSandbox()
  let login
  let requestStub
  let repoStub

  const customerData = {
    id: 21,
    company: 'Fake Inc.',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@test.com',
    phone: '123456789',
    form_fields: null,
    date_created: 'Thu, 28 Apr 2016 09:38:19 +0000',
    date_modified: 'Tue, 03 Apr 2018 16:32:37 +0000',
    store_credit: '0.0000',
    registration_ip_address: '',
    customer_group_id: 10,
    notes: 'Registered via Shopgate',
    tax_exempt_category: '',
    reset_pass_on_login: false,
    accepts_marketing: false,
    addresses: {
      url: 'https://api.bigcommerce.com/stores/r5s844ad/v2/customers/21/addresses',
      resource: '/customers/21/addresses'
    }
  }

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

  beforeEach(() => {
    context.log = sandbox.createStubInstance(Logger)

    requestStub = sandbox.stub()
    login = proxyquire('../../../lib/login', {
      'request-promise-native': requestStub
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

    repoStub.getCustomerByEmail
      .withArgs('john.doe@test.com')
      .resolves(customerData)

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

    return login(context, input).should.eventually.be.rejectedWith(InvalidCredentialsError)
  })

  it('should throw an Error if the customer cannot be found', async () => {
    repoStub.getCustomerByEmail
      .withArgs(input.parameters.login)
      .resolves()

    return login(context, input).should.eventually.be.rejectedWith(InvalidCredentialsError)
  })

  it('should log but not rethrow unkwnown errors at getting customer data', async () => {
    const error = new Error('this is a test')
    error.name = 'FooError'
    repoStub.getCustomerByEmail.rejects(error)

    try {
      await login(context, input)
    } catch (errorCaught) {
      chai.assert.equal(errorCaught.code, 'EUNKNOWN')
    }

    sinon.assert.calledOnce(context.log.error)
  })

  it('should log error, but not rethrow unkwnown errors at validate password', async () => {
    const error = new Error('this is a test')
    error.name = 'FooError'
    repoStub.getCustomerByEmail.resolves(customerData)
    repoStub.login.rejects(error)

    try {
      await login(context, input)
    } catch (errorCaught) {
      chai.assert.equal(errorCaught.code, 'EUNKNOWN')
    }

    sinon.assert.calledOnce(context.log.error)
  })

  it('should rethrow known errors at getting the customer password', async () => {
    const error = new Error(`Request returned error code: 400 and body: [{"status":400,"message":"The field 'email' is invalid."}]`)
    repoStub.getCustomerByEmail.rejects(error)

    try {
      await login(context, input)
    } catch (errorCaught) {
      chai.assert.equal(errorCaught.code, 'EINVALID')
      chai.assert.equal(errorCaught.message, `The field 'email' is invalid.`)
    }

    sinon.assert.notCalled(context.log.error)
  })

  it('should log and throw unknown error if the api error cannot be parsed', async () => {
    const error = new Error(`Request returned error code: 400 and body: 'something not parsable'`)
    repoStub.getCustomerByEmail.rejects(error)

    try {
      await login(context, input)
    } catch (errorCaught) {
      chai.assert.equal(errorCaught.code, 'EUNKNOWN')
    }

    sinon.assert.calledOnce(context.log.error)
  })
})
