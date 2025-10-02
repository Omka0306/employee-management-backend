const Company = require('../../models/company');
const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse, parseBody } = require('../../helpers/response');
const { extractUserFromEvent, requireRole } = require('../../middlewares/rbac');

exports.handler = async (event) => {
  try {
    const user = extractUserFromEvent(event);
    const authCheck = await requireRole('admin')(event);
    if (authCheck) return authCheck;

    const body = parseBody(event);
    
    const companyData = {
      ...body,
      createdBy: user?.email || 'system',
      updatedBy: user?.email || 'system'
    };

    const company = new Company(companyData);

    const validation = company.validate();
    if (!validation.isValid) {
      return errorResponse(400, 'Validation failed', validation.errors);
    }

    const codeExists = await DynamoDBService.companyCodeExists(company.companyCode);
    if (codeExists) {
      return errorResponse(409, 'Company with this code already exists');
    }

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
