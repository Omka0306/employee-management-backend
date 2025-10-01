const Employee = require('../../models/employee');
const DynamoDBService = require('../../services/dynamodb');
const CognitoService = require('../../services/cognito');
const { successResponse, errorResponse, parseBody } = require('../../helpers/response');
const { extractUserFromEvent, canModifyEmployee } = require('../../middlewares/rbac');

/**
 * Lambda handler to update an employee
 * Access control based on user role and permissions
 * @param {Object} event - API Gateway event
 * @returns {Object} HTTP response
 */
exports.handler = async (event) => {
  try {
    console.log('Update Employee - Event:', JSON.stringify(event, null, 2));

    // Get user info
    const user = extractUserFromEvent(event);
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    // Get employee ID from path parameters
    const employeeId = event.pathParameters?.id;

    if (!employeeId) {
      return errorResponse(400, 'Employee ID is required');
    }

    // Parse request body
    const body = parseBody(event);

    // Check if employee exists
    const existingEmployee = await DynamoDBService.getEmployeeById(employeeId);
    if (!existingEmployee) {
      return errorResponse(404, 'Employee not found');
    }

    // Check if user can modify this employee
    const modifyCheck = canModifyEmployee(user, existingEmployee, body);
    if (!modifyCheck.allowed) {
      return errorResponse(403, modifyCheck.reason);
    }

    // Prevent changing companyId (except for admins)
    if (body.companyId && body.companyId !== existingEmployee.companyId && user.role !== 'admin') {
      return errorResponse(403, 'Only admins can change employee company');
    }

    // Merge existing data with updates
    const updatedData = {
      ...existingEmployee,
      ...body,
      employeeId: existingEmployee.employeeId, // Ensure ID doesn't change
      companyId: existingEmployee.companyId, // Preserve company (unless admin changes it)
      cognitoUserId: existingEmployee.cognitoUserId, // Preserve Cognito ID
      createdAt: existingEmployee.createdAt, // Preserve creation timestamp
      updatedBy: user?.email || 'system'
    };

    // Allow admin to change companyId
    if (body.companyId && user.role === 'admin') {
      updatedData.companyId = body.companyId;
    }

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

    // Update Cognito user attributes if needed
    if (existingEmployee.email) {
      try {
        const cognitoUpdates = {};
        if (body.firstName || body.lastName) {
          const firstName = body.firstName || existingEmployee.firstName;
          const lastName = body.lastName || existingEmployee.lastName;
          cognitoUpdates.name = `${firstName} ${lastName}`;
        }
        if (body.role && body.role !== existingEmployee.role) {
          cognitoUpdates.role = body.role;
        }
        if (body.companyId && body.companyId !== existingEmployee.companyId) {
          cognitoUpdates.companyId = body.companyId;
        }

        if (Object.keys(cognitoUpdates).length > 0) {
          await CognitoService.updateUserAttributes(existingEmployee.email, cognitoUpdates);
        }
      } catch (cognitoError) {
        console.error('Cognito update failed:', cognitoError);
        // Continue with DynamoDB update even if Cognito update fails
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
