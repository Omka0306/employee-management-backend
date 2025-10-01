const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, filterEmployeeData } = require('../../middlewares/rbac');

/**
 * Lambda handler to search employees by name or email
 * Results filtered based on user role and company
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Search Employees - Event:', JSON.stringify(event, null, 2));

    // Get user info
    const user = extractUserFromEvent(event);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const searchTerm = queryParams.q || queryParams.search;

    if (!searchTerm || searchTerm.trim() === '') {
      return errorResponse(400, 'Search term is required (use ?q=searchTerm or ?search=searchTerm)');
    }

    // Search employees in DynamoDB
    let employees = await DynamoDBService.searchEmployees(searchTerm.trim());

    // Filter by company if not admin
    if (user.role !== 'admin') {
      employees = employees.filter(emp => emp.companyId === user.companyId);
    }

    // Filter employee data based on user role
    const filteredEmployees = employees.map(emp => filterEmployeeData(user, emp));

    return successResponse(200, {
      employees: filteredEmployees,
      count: filteredEmployees.length,
      searchTerm: searchTerm.trim()
    }, 'Search completed successfully');
  } catch (error) {
    console.error('Search Employees Error:', error);
    return errorResponse(500, 'Failed to search employees', [error.message]);
  }
};
