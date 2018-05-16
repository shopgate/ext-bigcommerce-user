class UnexpectedResponseError extends Error {
  constructor () {
    super()
    this.message = 'Unexpected 200 response from Bigcommerce login action.'
  }
}

module.exports = UnexpectedResponseError
