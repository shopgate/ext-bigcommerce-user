const chai = require('chai')
chai.use(require('chai-as-promised')).should()
const sinon = require('sinon')
const Logger = require('bunyan')
const proxyquire = require('proxyquire')

const BigCommerceCustomerRepository = require('../../../../../lib/bigcommerce/CustomerRepository')
const BigCommerceCustomerRequestClientError = require('../../../../../lib/bigcommerce/customer/request/ClientError')
const UnknownError = require('../../../../../lib/shopgate/customer/errors/UnknownError')
const ClientRequestError = require('../../../../../lib/shopgate/customer/errors/ClientRequestError')

let getCustomer = require('../../../../../lib/shopgate/customer/get').getCustomer
let getCustomerById = require('../../../../../lib/shopgate/customer/get').getCustomerById

describe('getCustomer', function () {
  let sandbox
  let context =
    /** @type PipelineContext */
    {
      config: {}
    }

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

  let repoStub

  beforeEach(() => {
    sandbox = sinon.createSandbox()
    context.log = sandbox.createStubInstance(Logger)
    repoStub = sandbox.createStubInstance(BigCommerceCustomerRepository)
    const repoCreate = sandbox.stub(BigCommerceCustomerRepository, 'create')
    repoCreate.returns(repoStub)
    const customer = proxyquire('../../../../../lib/shopgate/customer/get', {
      '../../bigcommerce/CustomerRepository': repoStub
    })
    getCustomer = customer.getCustomer
    getCustomerById = customer.getCustomerById
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return customer data when asked by email', async () => {
    repoStub.getCustomerByEmail.resolves(customerData)

    return getCustomer(context, 'bigc@shopgate.com').should.eventually.deep.equal({
      userId: '21',
      userData: {
        addresses: [],
        userGroups: [10],
        firstName: 'John',
        id: '21',
        lastName: 'Doe',
        mail: 'john.doe@test.com',
        customAttributes: {
          phone: '123456789',
          company: 'Fake Inc.'
        }
      }
    })
  })

  it('should return customer data when asked by id', async () => {
    repoStub.getCustomerById.resolves(customerData)

    return getCustomerById(context, 21).should.eventually.deep.equal({
      userId: '21',
      userData: {
        addresses: [],
        userGroups: [10],
        firstName: 'John',
        id: '21',
        lastName: 'Doe',
        mail: 'john.doe@test.com',
        customAttributes: {
          phone: '123456789',
          company: 'Fake Inc.'
        }
      }
    })
  })

  it('should log but not rethrow unknown errors at getting customer data', async () => {
    const error = new Error('Some unknown error')
    repoStub.getCustomerByEmail.rejects(error)

    await getCustomer(context, 'bigc@shopgate.com').should.eventually.be.rejectedWith(UnknownError)
      .and.have.property('code', 'EUNKNOWN')

    sinon.assert.calledOnce(context.log.error)
  })

  it('should rethrow errors that are due to invalid client request', async () => {
    const error = new BigCommerceCustomerRequestClientError(400, 'The field \'email\' is invalid.')
    repoStub.getCustomerByEmail.rejects(error)

    await getCustomer(context, 'bigc@shopgate.com').should.eventually.be.rejectedWith(ClientRequestError)
      .and.have.property('message', `The field 'email' is invalid.`)

    sinon.assert.notCalled(context.log.error)
  })
})
