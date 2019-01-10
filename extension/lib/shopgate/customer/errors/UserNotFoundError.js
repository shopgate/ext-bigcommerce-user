class UserNotFoundError extends Error {
  constructor (email) {
    super()
    this.email = email
  }
}

module.exports = UserNotFoundError
