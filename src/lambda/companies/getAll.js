const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, requireRole } = require('../../middlewares/rbac');

exports.handler = async (event) => {
  try {
    console.log('Get All Companies - Event:', JSON.stringify(event, null, 2));

    const authCheck = await requireRole('admin')(event);
    if (authCheck) return authCheck;

    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 50;
    const status = queryParams.status;
    const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : null;

    const result = await DynamoDBService.getAllCompanies({
      limit,
      status,
      lastKey
    });

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
