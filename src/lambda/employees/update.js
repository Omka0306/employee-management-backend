const Employee = require('../../models/employee');
const DynamoDBService = require('../../services/dynamodb');
const { successResponse, errorResponse, parseBody, getUserFromEvent } = require('../../helpers/response');

/**
 * Lambda handler to update an employee
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Update Employee - Event:', JSON.stringify(event, null, 2));

    // Get employee ID from path parameters
    const employeeId = event.pathParameters?.id;

    if (!employeeId) {
      return errorResponse(400, 'Employee ID is required');
    }

    // Parse request body
    const body = parseBody(event);

    // Get authenticated user info
    const user = getUserFromEvent(event);

    // Check if employee exists
    const existingEmployee = await DynamoDBService.getEmployeeById(employeeId);
    if (!existingEmployee) {
      return errorResponse(404, 'Employee not found');
    }

    // Merge existing data with updates
    const updatedData = {
      ...existingEmployee,
      ...body,
      employeeId: existingEmployee.employeeId, // Ensure ID doesn't change
      createdAt: existingEmployee.createdAt, // Preserve creation timestamp
      updatedBy: user?.email || 'system'
    };

    // Create employee instance for validation
    const employee = new Employee(updatedData);

    // Validate employee data
    const validation = employee.validate();
    if (!validation.isValid) {
      return errorResponse(400, 'Validation failed', validation.errors);
    }

    // Check if email is being changed and if new email already exists
    if (body.email && body.email !== existingEmployee.email) {
      const emailExists = await DynamoDBService.emailExists(body.email, employeeId);
      if (emailExists) {
        return errorResponse(409, 'Employee with this email already exists');
      }
    }

    // Update in DynamoDB
    const updatedEmployee = await DynamoDBService.updateEmployee(
      employeeId,
      employee.toDynamoDB()
    );

    return successResponse(200, updatedEmployee, 'Employee updated successfully');
  } catch (error) {
    console.error('Update Employee Error:', error);

    if (error.message === 'Invalid JSON in request body') {
      return errorResponse(400, error.message);
    }

    if (error.message === 'Employee not found') {
      return errorResponse(404, error.message);
    }

    return errorResponse(500, 'Failed to update employee', [error.message]);
  }
};
