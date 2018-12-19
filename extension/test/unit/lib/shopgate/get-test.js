const chai = require('chai')
chai.use(require('chai-as-promised')).should()
const sinon = require('sinon')
const Logger = require('bunyan')
const proxyquire = require('proxyquire')

const BigCommerceCustomerRepository = require('../../../../lib/bigcommerce/CustomerRepository')
let subjectUnderTest = require('../../../../lib/shopgate/customer/get')
const UnknownError = require('../../../../lib/shopgate/customer/errors/UnknownError')

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
    subjectUnderTest = proxyquire('../../../../lib/shopgate/customer/get', {
      '../../bigcommerce/CustomerRepository': repoStub
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('should return customer data', async () => {
    repoStub.getCustomerByEmail.resolves(customerData)

    return subjectUnderTest(context, 'bigc@shopgate.com').should.eventually.deep.equal({
      userId: '21',
      userData: {
        addresses: [],
        birthday: null,
        customerGroups: [10],
        firstName: 'John',
        gender: null,
        id: '21',
        lastName: 'Doe',
        mail: 'john.doe@test.com',
        phone: '123456789'
      }
    })
  })

  it('should log but not rethrow unkwnown errors at getting customer data', async () => {
    const error = new Error('BigCommerce error')
    error.name = 'BigCommerceError'
    repoStub.getCustomerByEmail.rejects(error)

    await subjectUnderTest(context, 'bigc@shopgate.com').should.eventually.be.rejectedWith(UnknownError)
      .and.have.property('code', 'EUNKNOWN')

    sinon.assert.calledOnce(context.log.error)
  })

  it('should rethrow known errors at getting the customer password', async () => {
    const error = new Error(`Request returned error code: 400 and body: [{"status":400,"message":"The field 'email' is invalid."}]`)
    repoStub.getCustomerByEmail.rejects(error)

    await subjectUnderTest(context, 'bigc@shopgate.com').should.eventually.be.rejectedWith(Error)
      .and.have.property('message', `The field 'email' is invalid.`)

    sinon.assert.notCalled(context.log.error)
  })

  it('should log and throw unknown error if the api error cannot be parsed', async () => {
    const error = new Error(`Request returned error code: 400 and body: 'something not parsable'`)
    repoStub.getCustomerByEmail.rejects(error)

    await subjectUnderTest(context, 'bigc@shopgate.com').should.eventually.be.rejectedWith(UnknownError)
      .and.have.property('code', 'EUNKNOWN')

    sinon.assert.calledOnce(context.log.error)
  })

  it('should log and throw unknown error if the api error is a 500', async () => {
    const error = new Error(`Request returned error code: 500 and body: [{"status":500,"message":"Internal Server Error"}]`)
    repoStub.getCustomerByEmail.rejects(error)

    await subjectUnderTest(context, 'bigc@shopgate.com').should.eventually.be.rejectedWith(UnknownError)
      .and.have.property('code', 'EUNKNOWN')

    sinon.assert.calledOnce(context.log.error)
  })
})
