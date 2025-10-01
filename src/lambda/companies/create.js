const Company = require('../../models/company');
const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse, parseBody } = require('../../helpers/response');
const { extractUserFromEvent, requireRole } = require('../../middlewares/rbac');

/**
 * Lambda handler to create a new company
 * Only admins can create companies
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Create Company - Event:', JSON.stringify(event, null, 2));

    // Check authorization
    const user = extractUserFromEvent(event);
    const authCheck = await requireRole('admin')(event);
    if (authCheck) return authCheck;

    // Parse request body
    const body = parseBody(event);
    
    // Create company instance
    const companyData = {
      ...body,
      createdBy: user?.email || 'system',
      updatedBy: user?.email || 'system'
    };

    const company = new Company(companyData);

    // Validate company data
    const validation = company.validate();
    if (!validation.isValid) {
      return errorResponse(400, 'Validation failed', validation.errors);
    }

    // Check if company code already exists
    const codeExists = await DynamoDBService.companyCodeExists(company.companyCode);
    if (codeExists) {
      return errorResponse(409, 'Company with this code already exists');
    }

    // Save to DynamoDB
    const savedCompany = await DynamoDBService.createCompany(company.toDynamoDB());

    return successResponse(201, savedCompany, 'Company created successfully');
  } catch (error) {
    console.error('Create Company Error:', error);
    
    if (error.message === 'Invalid JSON in request body') {
      return errorResponse(400, error.message);
    }

    return errorResponse(500, 'Failed to create company', [error.message]);
  }
};
