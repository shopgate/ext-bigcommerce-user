class ShopgateAutologinInvalidTokenReceivedError extends Error {
  constructor () {
    super()
    this.code = 'ELOGININVALIDTOKEN'
    this.message = 'Provided token is not valid.'
  }
}

module.exports = ShopgateAutologinInvalidTokenReceivedError
