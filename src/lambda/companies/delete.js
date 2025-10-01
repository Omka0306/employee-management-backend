const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse } = require('../../helpers/response');
const { extractUserFromEvent, requireRole } = require('../../middlewares/rbac');

/**
 * Lambda handler to delete a company
 * Only admins can delete companies
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Delete Company - Event:', JSON.stringify(event, null, 2));

    // Check authorization
    const authCheck = await requireRole('admin')(event);
    if (authCheck) return authCheck;

    const companyId = event.pathParameters?.id;
    if (!companyId) {
      return errorResponse(400, 'Company ID is required');
    }

    // Check if company exists
    const company = await DynamoDBService.getCompanyById(companyId);
    if (!company) {
      return errorResponse(404, 'Company not found');
    }

    // Check if company has employees
    const employees = await DynamoDBService.getEmployeesByCompany(companyId, { limit: 1 });
    if (employees.items.length > 0) {
      return errorResponse(400, 'Cannot delete company with existing employees. Please remove all employees first.');
    }

    // Delete from DynamoDB
    await DynamoDBService.deleteCompany(companyId);

    return successResponse(200, { companyId }, 'Company deleted successfully');
  } catch (error) {
    console.error('Delete Company Error:', error);
    
    if (error.message === 'Company not found') {
      return errorResponse(404, error.message);
    }

    return errorResponse(500, 'Failed to delete company', [error.message]);
  }
};
