const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');

/**
 * Lambda handler to search employees by name or email
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Search Employees - Event:', JSON.stringify(event, null, 2));

    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const searchTerm = queryParams.q || queryParams.search;

    if (!searchTerm || searchTerm.trim() === '') {
      return errorResponse(400, 'Search term is required (use ?q=searchTerm or ?search=searchTerm)');
    }

    // Search employees in DynamoDB
    const employees = await DynamoDBService.searchEmployees(searchTerm.trim());

    return successResponse(200, {
      employees,
      count: employees.length,
      searchTerm: searchTerm.trim()
    }, 'Search completed successfully');
  } catch (error) {
    console.error('Search Employees Error:', error);
    return errorResponse(500, 'Failed to search employees', [error.message]);
  }
};
