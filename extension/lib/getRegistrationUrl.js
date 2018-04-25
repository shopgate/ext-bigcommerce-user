/**
 * @param {PipelineContext} context
 * @param {GetRegistrationUrlInput} input
 * @returns {Promise<GetRegistrationUrlResponse>}
 */
module.exports = async (context, input) => {
  return {
    'url': `${input.shopUrl}/login.php?action=create_account`
  }
}

