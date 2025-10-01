const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, filterEmployeeData } = require('../../middlewares/rbac');

/**
 * Lambda handler to get all employees
 * Admins can see all employees across all companies
 * Managers can see employees in their company
 * Employees can see limited info of employees in their company
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Get All Employees - Event:', JSON.stringify(event, null, 2));

    // Get user info
    const user = extractUserFromEvent(event);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 50;
    const status = queryParams.status;
    const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : null;

    let result;

    // Admin can see all employees
    if (user.role === 'admin') {
      result = await DynamoDBService.getAllEmployees({
        limit,
        status,
        lastKey
      });
    } else {
      // Manager and Employee can only see employees in their company
      result = await DynamoDBService.getEmployeesByCompany(user.companyId, {
        limit,
        status,
        lastKey
      });
    }

    // Filter employee data based on user role
    const filteredEmployees = result.items.map(emp => filterEmployeeData(user, emp));

    // Prepare response
    const response = {
      employees: filteredEmployees,
      count: result.count,
      lastKey: result.lastKey ? encodeURIComponent(JSON.stringify(result.lastKey)) : null
    };

    return successResponse(200, response, 'Employees retrieved successfully');
  } catch (error) {
    console.error('Get All Employees Error:', error);
    return errorResponse(500, 'Failed to retrieve employees', [error.message]);
  }
};
