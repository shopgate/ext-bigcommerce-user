const assert = require('assert')

/**
 * A helper method that allows asserting that an error is thrown in async context.
 *
 * @param {Promise} promise
 * @param {Error} errorConstructor
 * @param {string} message
 * @returns {Promise<void>}
 */
module.exports.assertThrowsAsync = async (promise, errorConstructor, message = '') => {
  let failed = false
  try {
    await promise
  } catch (e) {
    failed = true
    assert.ok(e instanceof errorConstructor)
  }

  assert.ok(failed, message + ' :: expected to fail ::')
}
