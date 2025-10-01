const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, requireRole } = require('../../middlewares/rbac');

/**
 * Lambda handler to get all companies
 * Only admins can view all companies
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Get All Companies - Event:', JSON.stringify(event, null, 2));

    // Check authorization
    const authCheck = await requireRole('admin')(event);
    if (authCheck) return authCheck;

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 50;
    const status = queryParams.status;
    const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : null;

    // Get companies from DynamoDB
    const result = await DynamoDBService.getAllCompanies({
      limit,
      status,
      lastKey
    });

    // Prepare response
    const response = {
      companies: result.items,
      count: result.count,
      lastKey: result.lastKey ? encodeURIComponent(JSON.stringify(result.lastKey)) : null
    };

    return successResponse(200, response, 'Companies retrieved successfully');
  } catch (error) {
    console.error('Get All Companies Error:', error);
    return errorResponse(500, 'Failed to retrieve companies', [error.message]);
  }
};
