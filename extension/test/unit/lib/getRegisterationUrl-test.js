const getRegistrationUrl = require('../../../lib/getRegistrationUrl')
const chai = require('chai')

describe('getRegistrationUrl', () => {
  it('should append the correct suffix to the shopUrl given in input', async () => {
    const redirectUrl = await getRegistrationUrl({}, { shopUrl: 'https://mycustomshop.com' })
    chai.assert.deepEqual(redirectUrl, { url: 'https://mycustomshop.com/login.php?action=create_account' })
  })
})
