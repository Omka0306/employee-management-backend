const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, canAccessEmployee, filterEmployeeData } = require('../../middlewares/rbac');

/**
 * Lambda handler to get employee by ID
 * Access control based on user role and company
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Get Employee By ID - Event:', JSON.stringify(event, null, 2));

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

    // Get employee from DynamoDB
    const employee = await DynamoDBService.getEmployeeById(employeeId);

    if (!employee) {
      return errorResponse(404, 'Employee not found');
    }

    // Check if user can access this employee
    const hasAccess = await canAccessEmployee(user, employee);
    if (!hasAccess) {
      return errorResponse(403, 'Access denied to this employee');
    }

    // Filter employee data based on user role
    const filteredEmployee = filterEmployeeData(user, employee);

    return successResponse(200, filteredEmployee, 'Employee retrieved successfully');
  } catch (error) {
    console.error('Get Employee By ID Error:', error);
    return errorResponse(500, 'Failed to retrieve employee', [error.message]);
  }
};
