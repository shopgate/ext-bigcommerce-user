const sinon = require('sinon')
const chai = require('chai')
chai.use(require('chai-as-promised')).should()

const Logger = require('bunyan')
const BigCommerce = require('node-bigcommerce')
const BigCommerceCustomerRepository = require('../../../../lib/bigcommerce/CustomerRepository')

describe('BigCommerceCustomerRepository', () => {
  const sandbox = sinon.createSandbox()
  let apiClientStub
  let repo

  beforeEach(() => {
    context.log = sandbox.createStubInstance(Logger)
    apiClientStub = sandbox.createStubInstance(BigCommerce)
    repo = new BigCommerceCustomerRepository(apiClientStub)
  })

  afterEach(() => {
    sandbox.verifyAndRestore()
  })

  describe('getCustomerByEmail()', () => {
    const mockedApiResponse = [
      {
        id: 21,
        company: '',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@test.com',
        phone: '',
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
    ]

    it('should pass through the first found customer record from the API', async () => {
      apiClientStub.get
        .withArgs('/customers?email=john.doe%40test.com')
        .returns(mockedApiResponse)

      chai.assert.deepEqual(await repo.getCustomerByEmail('john.doe@test.com'), mockedApiResponse[0])
    })

    it('should return undefined if customer was not found', async () => {
      apiClientStub.get
        .withArgs('/customers?email=non.existing.user%40test.com')
        .returns([])

      chai.assert.isUndefined(await repo.getCustomerByEmail('non.existing.user@test.com'))
    })
  })

  describe('getAddresses()', () => {
    const mockedApiResponse = [
      {
        id: 96,
        customer_id: 21,
        first_name: 'John',
        last_name: 'Doe',
        company: '',
        street_1: '2222 Rio Grande Suite 300',
        street_2: '',
        city: 'Austin',
        state: 'Texas',
        zip: '78705',
        country: 'United States',
        country_iso2: 'US',
        phone: '012345',
        address_type: 'residential',
        form_fields: null
      }
    ]

    it('should pass through the addresses from the API', async () => {
      apiClientStub.get
        .withArgs('/customers/21/addresses')
        .returns(mockedApiResponse)

      chai.assert.deepEqual(await repo.getAddresses(21), mockedApiResponse)
    })

    it('should not fail when no addresses were found', async () => {
      apiClientStub.get
        .withArgs('/customers/22/addresses')
        .returns([])
        .withArgs('/customers/23/addresses')
        .returns('')
        .withArgs('/customers/24/addresses')
        .returns(null)
        .withArgs('/customers/25/addresses')
        .returns(undefined)

      chai.assert.deepEqual(await repo.getAddresses(22), [])
      chai.assert.deepEqual(await repo.getAddresses(23), [])
      chai.assert.deepEqual(await repo.getAddresses(24), [])
      chai.assert.deepEqual(await repo.getAddresses(25), [])
    })
  })

  describe('login()', () => {
    const mockedApiResponse = {
      success: true
    }

    it('should pass through the customer_id and return true on success', async () => {
      apiClientStub.post
        .withArgs(`/customers/21/validate`, { password: 'foo' })
        .returns(mockedApiResponse)

      const success = await repo.login(21, 'foo')
      chai.assert.isTrue(success)
    })

    it('should pass through the customer_id and return false on no success', async () => {
      mockedApiResponse.success = false
      apiClientStub.post
        .withArgs(`/customers/21/validate`, { password: 'foo' })
        .returns(mockedApiResponse)

      const success = await repo.login(21, 'foo')
      chai.assert.isFalse(success)
    })
  })
})
