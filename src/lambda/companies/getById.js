const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, canAccessCompany } = require('../../middlewares/rbac');

/**
 * Lambda handler to get company by ID
 * Admins can view any company, managers/employees can only view their own
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Get Company By ID - Event:', JSON.stringify(event, null, 2));

    const user = extractUserFromEvent(event);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const companyId = event.pathParameters?.id;
    if (!companyId) {
      return errorResponse(400, 'Company ID is required');
    }

    // Get company from DynamoDB
    const company = await DynamoDBService.getCompanyById(companyId);

    if (!company) {
      return errorResponse(404, 'Company not found');
    }

    // Check if user can access this company
    if (!canAccessCompany(user, company.companyId)) {
      return errorResponse(403, 'Access denied to this company');
    }

    return successResponse(200, company, 'Company retrieved successfully');
  } catch (error) {
    console.error('Get Company By ID Error:', error);
    return errorResponse(500, 'Failed to retrieve company', [error.message]);
  }
};
