const Company = require('../../models/company');
const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse, parseBody } = require('../../helpers/response');
const { extractUserFromEvent, requireRole } = require('../../middlewares/rbac');

/**
 * Lambda handler to update a company
 * Only admins can update companies
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Update Company - Event:', JSON.stringify(event, null, 2));

    // Check authorization
    const user = extractUserFromEvent(event);
    const authCheck = await requireRole('admin')(event);
    if (authCheck) return authCheck;

    const companyId = event.pathParameters?.id;
    if (!companyId) {
      return errorResponse(400, 'Company ID is required');
    }

    // Parse request body
    const updates = parseBody(event);

    // Get existing company
    const existingCompany = await DynamoDBService.getCompanyById(companyId);
    if (!existingCompany) {
      return errorResponse(404, 'Company not found');
    }

    // If company code is being updated, check for duplicates
    if (updates.companyCode && updates.companyCode !== existingCompany.companyCode) {
      const codeExists = await DynamoDBService.companyCodeExists(updates.companyCode, companyId);
      if (codeExists) {
        return errorResponse(409, 'Company with this code already exists');
      }
    }

    // Validate updated data
    const updatedCompanyData = { ...existingCompany, ...updates };
    const company = new Company(updatedCompanyData);
    const validation = company.validate();
    
    if (!validation.isValid) {
      return errorResponse(400, 'Validation failed', validation.errors);
    }

    // Add updatedBy
    updates.updatedBy = user?.email || 'system';

    // Update in DynamoDB
    const updatedCompany = await DynamoDBService.updateCompany(companyId, updates);

    return successResponse(200, updatedCompany, 'Company updated successfully');
  } catch (error) {
    console.error('Update Company Error:', error);
    
    if (error.message === 'Company not found') {
      return errorResponse(404, error.message);
    }

    return errorResponse(500, 'Failed to update company', [error.message]);
  }
};
