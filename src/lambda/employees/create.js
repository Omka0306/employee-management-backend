const Employee = require('../../models/employee');
const DynamoDBService = require('../../services/dynamodb');
const CognitoService = require('../../services/cognito');
const { successResponse, errorResponse, parseBody } = require('../../helpers/response');
const { extractUserFromEvent, requireRole, canAccessCompany } = require('../../middlewares/rbac');

exports.handler = async (event) => {
  try {
    const user = extractUserFromEvent(event);
    const authCheck = await requireRole('manager')(event);
    if (authCheck) return authCheck;

    const body = parseBody(event);
    
    let companyId = body.companyId;
    
    if (user.role === 'manager') {
      if (companyId && companyId !== user.companyId) {
        return errorResponse(403, 'Managers can only create employees in their own company');
      }
      companyId = user.companyId;
    }

    const company = await DynamoDBService.getCompanyById(companyId);
    if (!company) {
      return errorResponse(404, 'Company not found');
    }

    if (!canAccessCompany(user, companyId)) {
      return errorResponse(403, 'Access denied to this company');
    }

    const role = body.role || 'employee';
    
    if (user.role === 'manager' && (role === 'admin' || role === 'manager')) {
      return errorResponse(403, 'Managers cannot create admin or manager accounts');
    }

    const employeeData = {
      ...body,
      companyId,
      role,
      createdBy: user?.email || 'system',
      updatedBy: user?.email || 'system'
    };

    const employee = new Employee(employeeData);

    const validation = employee.validate();
    if (!validation.isValid) {
      return errorResponse(400, 'Validation failed', validation.errors);
    }

    const emailExists = await DynamoDBService.emailExists(employee.email);
    if (emailExists) {
      return errorResponse(409, 'Employee with this email already exists');
    }

    let cognitoUser;
    try {
      const fullName = `${employee.firstName} ${employee.lastName}`;
      cognitoUser = await CognitoService.createUser({
        email: employee.email,
        name: fullName,
        role: employee.role,
        companyId: employee.companyId
      });
      
      employee.cognitoUserId = cognitoUser.userSub;
      await CognitoService.addUserToGroup(employee.email, employee.role);
    } catch (cognitoError) {
      console.error('Cognito user creation failed:', cognitoError);
      return errorResponse(500, 'Failed to create user account', [cognitoError.message]);
    }

    const savedEmployee = await DynamoDBService.createEmployee(employee.toDynamoDB());

    return successResponse(201, {
      employee: savedEmployee,
      message: 'Employee created successfully. Password reset link has been sent to their email.'
    }, 'Employee created successfully');
  } catch (error) {
    console.error('Create Employee Error:', error);
    
    if (error.message === 'Invalid JSON in request body') {
      return errorResponse(400, error.message);
    }

    return errorResponse(500, 'Failed to create employee', [error.message]);
  }
};
