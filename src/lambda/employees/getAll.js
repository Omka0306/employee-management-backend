const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, filterEmployeeData } = require('../../middlewares/rbac');

exports.handler = async (event) => {
  try {
    console.log('Get All Employees - Event:', JSON.stringify(event, null, 2));

    const user = extractUserFromEvent(event);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 50;
    const status = queryParams.status;
    const lastKey = queryParams.lastKey ? JSON.parse(decodeURIComponent(queryParams.lastKey)) : null;

    let result;

    if (user.role === 'admin') {
      result = await DynamoDBService.getAllEmployees({
        limit,
        status,
        lastKey
      });
    } else {
      result = await DynamoDBService.getEmployeesByCompany(user.companyId, {
        limit,
        status,
        lastKey
      });
    }

    const filteredEmployees = result.items.map(emp => filterEmployeeData(user, emp));

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
