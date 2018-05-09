class BigcommerceCustomerRepository {
  constructor (apiClientV2) {
    this.apiClientV2 = apiClientV2
  }

  static create (apiClientV2) {
    return new BigcommerceCustomerRepository(apiClientV2)
  }

  async getCustomerByEmail (email) {
    const uri = `/customers?email=${encodeURIComponent(email)}`
    const customers = await this.apiClientV2.get(uri)
    if (!customers || customers.length < 1) {
      throw new Error('customer not found')
    }
    return customers[0]
  }

  async getAddresses (customerId) {
    const uri = `/customers/${customerId}/addresses`
    const addresses = await this.apiClientV2.get(uri)
    if (!addresses || addresses.length < 1) {
      return []
    }
    return addresses
  }
}

module.exports = BigcommerceCustomerRepository
