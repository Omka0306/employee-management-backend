const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');

/**
 * Lambda handler to get all employees
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Get All Employees - Event:', JSON.stringify(event, null, 2));

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 50;
    const status = queryParams.status;
    const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : null;

    // Get employees from DynamoDB
    const result = await DynamoDBService.getAllEmployees({
      limit,
      status,
      lastKey
    });

    // Prepare response
    const response = {
      employees: result.items,
      count: result.count,
      lastKey: result.lastKey ? encodeURIComponent(JSON.stringify(result.lastKey)) : null
    };

    return successResponse(200, response, 'Employees retrieved successfully');
  } catch (error) {
    console.error('Get All Employees Error:', error);
    return errorResponse(500, 'Failed to retrieve employees', [error.message]);
  }
};
