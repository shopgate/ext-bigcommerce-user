const assert = require('assert')
const chai = require('chai')
chai.use(require('chai-as-promised')).should()
const BigCommerceCustomerRepository = require('../../../../lib/bigcommerce/CustomerRepository')
const BigCommerceRequestClientError = require('../../../../lib/bigcommerce/customer/request/ClientError')
const { clientId, accessToken, storeHash } = require('../../../../.integration-credentials')
const { sleep } = require('../../../util/sleep')

describe('BigCommerceCustomerRepository', () => {
  /** @var {BigCommerceCustomerRepository} */
  let repo

  beforeEach(() => {
    repo = BigCommerceCustomerRepository.create(clientId, accessToken, storeHash)
  })

  describe('update()', () => {
    const customerId = 317

    it('should update first name', async () => {
      await repo.update(customerId, {
        first_name: 'Integration[running]'
      })
      await sleep(1)
      const customer = await repo.getCustomerById(customerId)
      assert.strictEqual(customer.first_name, 'Integration[running]')
      await repo.update(customerId, {
        first_name: 'Integration'
      })
    })

    it('should update custom attributes', async () => {
      await repo.update(customerId, {
        company: 'Shopgate[running]',
        phone: '+49691337169'
      })
      await sleep(1)
      const customer = await repo.getCustomerById(customerId)
      assert.strictEqual(customer.company, 'Shopgate[running]')
      assert.strictEqual(customer.phone, '+49691337169')
      await repo.update(customerId, {
        company: 'Shopgate',
        phone: '+49691337162'
      })
    })

    it('should update last name', async () => {
      await repo.update(customerId, {
        last_name: 'Test[running]'
      })
      await sleep(1)
      const customer = await repo.getCustomerById(customerId)
      assert.strictEqual(customer.last_name, 'Test[running]')
      await repo.update(customerId, {
        last_name: 'Test'
      })
    })

    it('should provide error on email being invalid', async () => {
      return repo.update(customerId, {
        email: 'invalid'
      }).should.eventually.be.rejectedWith(BigCommerceRequestClientError)
        .and.haveOwnProperty('message', 'The field \'email\' is invalid.')
    })
  })
})
