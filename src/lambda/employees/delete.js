const DynamoDBService = require('../../services/dynamodb');
const CognitoService = require('../../services/cognito');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, canDeleteEmployee } = require('../../middlewares/rbac');

/**
 * Lambda handler to delete an employee
 * Access control based on user role and permissions
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Delete Employee - Event:', JSON.stringify(event, null, 2));

    // Get user info
    const user = extractUserFromEvent(event);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

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

    // Check if user can delete this employee
    const deleteCheck = canDeleteEmployee(user, employee);
    if (!deleteCheck.allowed) {
      return errorResponse(403, deleteCheck.reason);
    }

    // Delete Cognito user if exists
    if (employee.email) {
      try {
        await CognitoService.deleteUser(employee.email);
      } catch (cognitoError) {
        console.error('Cognito user deletion failed:', cognitoError);
        // Continue with DynamoDB deletion even if Cognito deletion fails
      }
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
