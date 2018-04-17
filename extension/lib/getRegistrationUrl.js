/**
 * @param {PipelineContext} context
 * @returns {getRegistrationUrlResponse}
 */
module.exports = async (context) => {
  const storeDomain = context.config.storeDomain ? context.config.storeDomain.trim() : ''
  const domain = storeDomain || `store-${context.config.storeHash}.mybigcommerce.com`

  return {
    'url': `https://${domain}/login.php?action=create_account`
  }
}
