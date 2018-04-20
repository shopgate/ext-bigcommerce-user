const getShopUrl = require('../../../lib/getShopUrl')
const assert = require('assert')

describe('getShopUrl', () => {
  it('should use domain from configuration if available', async () => {
    const redirectUrl = await getShopUrl(/** @type {PipelineContext} */{ config: { storeDomain: 'mycustomshop.com' } })
    assert.deepEqual(redirectUrl, { url: 'https://mycustomshop.com' })
  })

  it('should use storeHash when storeDomain is not available', async () => {
    let redirectUrl = await getShopUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789' } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com' })

    redirectUrl = await getShopUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: null } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com' })

    redirectUrl = await getShopUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: undefined } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com' })

    redirectUrl = await getShopUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: '' } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com' })

    redirectUrl = await getShopUrl(/** @type {PipelineContext} */{ config: { storeHash: 'r456789', storeDomain: '   ' } })
    assert.deepEqual(redirectUrl, { url: 'https://store-r456789.mybigcommerce.com' })
  })
})
