const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');

/**
 * Lambda handler to delete an employee
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Delete Employee - Event:', JSON.stringify(event, null, 2));

    // Get employee ID from path parameters
    const employeeId = event.pathParameters?.id;

    if (!employeeId) {
      return errorResponse(400, 'Employee ID is required');
    }

    // Check if employee exists before deleting
    const employee = await DynamoDBService.getEmployeeById(employeeId);
    if (!employee) {
      return errorResponse(404, 'Employee not found');
    }

    // Delete from DynamoDB
    await DynamoDBService.deleteEmployee(employeeId);

    return successResponse(200, { employeeId }, 'Employee deleted successfully');
  } catch (error) {
    console.error('Delete Employee Error:', error);

    if (error.message === 'Employee not found') {
      return errorResponse(404, error.message);
    }

    return errorResponse(500, 'Failed to delete employee', [error.message]);
  }
};
