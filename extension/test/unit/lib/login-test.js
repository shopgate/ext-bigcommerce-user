const chai = require('chai')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

// Pre-loading the module with all its dependencies in order to make the proxyquire call below
// over a hundred times faster, so that it doesn't cause a timeout.
require('../../../lib/login')

const BigcommerceCustomerRepository = require('../../../lib/respository/BigcommerceCustomerRepository')

describe('login()', async () => {
  const sandbox = sinon.createSandbox()
  let login
  let requestStub
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

  beforeEach(function () {
    requestStub = sandbox.stub()
    login = proxyquire('../../../lib/login', {
      'request-promise-native': requestStub
    })

    repoStub = sandbox.createStubInstance(BigcommerceCustomerRepository)
    sandbox.stub(BigcommerceCustomerRepository, 'getInstance').returns(repoStub)
  })

  afterEach(() => {
    sandbox.verifyAndRestore()
  })

  it('should return user data', async () => {
    const error = new Error()
    error.name = 'StatusCodeError'
    error.statusCode = 302
    error.response = {headers: {location: '/account.php'}}
    error.foo = 'bar'
    requestStub.rejects(error)

    repoStub.getCustomerByEmail
      .withArgs('john.doe@test.com')
      .resolves({
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
          'url': 'https://api.bigcommerce.com/stores/r5s844ad/v2/customers/21/addresses',
          'resource': '/customers/21/addresses'
        }
      })

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
})
