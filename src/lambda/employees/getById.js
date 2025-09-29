const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');

/**
 * Lambda handler to get employee by ID
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Get Employee By ID - Event:', JSON.stringify(event, null, 2));

    // Get employee ID from path parameters
    const employeeId = event.pathParameters?.id;

    if (!employeeId) {
      return errorResponse(400, 'Employee ID is required');
    }

    // Get employee from DynamoDB
    const employee = await DynamoDBService.getEmployeeById(employeeId);

    if (!employee) {
      return errorResponse(404, 'Employee not found');
    }

    return successResponse(200, employee, 'Employee retrieved successfully');
  } catch (error) {
    console.error('Get Employee By ID Error:', error);
    return errorResponse(500, 'Failed to retrieve employee', [error.message]);
  }
};
