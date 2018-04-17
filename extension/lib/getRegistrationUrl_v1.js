/**
 * @param {PipelineContext} context
 * @returns {getRegistrationUrlResponse}
 */
module.exports = async (context) => {
  const domain = context.config.storeDomain || `store-${context.config.storeHash}.mybigcommerce.com`

  return {
    'url': `https://${domain}/login.php?action=create_account`
  }
}
