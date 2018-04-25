module.exports = {
  /**
   * @param {Error} err
   * @param {string} [importance='high']
   * @returns {Object}
   */
  decorateError (err, importance = 'high') {
    return {
      err: err,
      importance,
      extension: '@shopgate-bigcommerce-user'
    }
  }
}
