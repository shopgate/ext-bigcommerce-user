const getRegistrationUrl = require('../../../lib/getRegistrationUrl')
const assert = require('assert')

describe('getRegistrationUrl', () => {
  it('should use domain from configuration if available', async () => {
    const redirectUrl = await getRegistrationUrl(/** @type {PipelineContext} */{ config: { storeDomain: 'mycustomshop.com' } })
    assert.deepEqual(redirectUrl, { url: 'https://mycustomshop.com/login.php?action=create_account' })
  })

  it('should use storeHash when storeDomain is not available', async () => {
    let redirectUrl = await getRegistrationUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789' } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com/login.php?action=create_account' })

    redirectUrl = await getRegistrationUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: null } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com/login.php?action=create_account' })

    redirectUrl = await getRegistrationUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: undefined } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com/login.php?action=create_account' })

    redirectUrl = await getRegistrationUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: '' } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com/login.php?action=create_account' })

    redirectUrl = await getRegistrationUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: '   ' } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com/login.php?action=create_account' })
  })
})
