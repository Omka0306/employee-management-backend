const Employee = require('../../models/employee');
const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse, parseBody, getUserFromEvent } = require('../../helpers/response');

/**
 * Lambda handler to create a new employee
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Create Employee - Event:', JSON.stringify(event, null, 2));

    // Parse request body
    const body = parseBody(event);
    
    // Get authenticated user info
    const user = getUserFromEvent(event);

    // Create employee instance
    const employeeData = {
      ...body,
      createdBy: user?.email || 'system',
      updatedBy: user?.email || 'system'
    };

    const employee = new Employee(employeeData);

    // Validate employee data
    const validation = employee.validate();
    if (!validation.isValid) {
      return errorResponse(400, 'Validation failed', validation.errors);
    }

    // Check if email already exists
    const emailExists = await DynamoDBService.emailExists(employee.email);
    if (emailExists) {
      return errorResponse(409, 'Employee with this email already exists');
    }

    // Save to DynamoDB
    const savedEmployee = await DynamoDBService.createEmployee(employee.toDynamoDB());

    return successResponse(201, savedEmployee, 'Employee created successfully');
  } catch (error) {
    console.error('Create Employee Error:', error);
    
    if (error.message === 'Invalid JSON in request body') {
      return errorResponse(400, error.message);
    }

    return errorResponse(500, 'Failed to create employee', [error.message]);
  }
};
