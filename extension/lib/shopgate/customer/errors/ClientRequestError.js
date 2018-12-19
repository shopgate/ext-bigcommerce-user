class ClientRequestError extends Error {
  constructor (message) {
    super()
    this.message = message
  }
}

module.exports = ClientRequestError
