const { errorResponse } = require('../helpers/response');
const DynamoDBService = require('../services/dynamodb');

const ROLE_HIERARCHY = {
  admin: 3,
  manager: 2,
  employee: 1
};

function extractUserFromEvent(event) {
  if (event.requestContext && event.requestContext.authorizer) {
    const claims = event.requestContext.authorizer.claims;
    return {
      userId: claims.sub,
      email: claims.email,
      username: claims['cognito:username'],
      role: claims['custom:role'] || 'employee',
      companyId: claims['custom:companyId'] || null
    };
  }
  return null;
}

function hasRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

function requireRole(requiredRole) {
  return async (event) => {
    const user = extractUserFromEvent(event);
    
    if (!user) {
      return errorResponse(401, 'Unauthorized - No user information found');
    }

    if (!hasRole(user.role, requiredRole)) {
      return errorResponse(403, `Forbidden - Requires ${requiredRole} role or higher`);
    }

    return null;
  };
}

function canAccessCompany(user, targetCompanyId) {
  if (user.role === 'admin') {
    return true;
  }
  return user.companyId === targetCompanyId;
}

async function canAccessEmployee(user, employee) {
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'manager') {
    return user.companyId === employee.companyId;
  }

  if (user.role === 'employee') {
    return user.email === employee.email || user.userId === employee.cognitoUserId;
  }

  return false;
}

function canModifyEmployee(user, employee, updates = {}) {
  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (user.role === 'manager') {
    if (user.companyId !== employee.companyId) {
      return { allowed: false, reason: 'Cannot modify employees from other companies' };
    }
    
    if (employee.role === 'admin') {
      return { allowed: false, reason: 'Managers cannot modify admin accounts' };
    }

    if (employee.role === 'manager' && employee.email !== user.email) {
      return { allowed: false, reason: 'Managers cannot modify other manager accounts' };
    }

    if (updates.role && updates.role !== employee.role) {
      return { allowed: false, reason: 'Managers cannot change employee roles' };
    }

    return { allowed: true };
  }

  if (user.role === 'employee') {
    if (user.email !== employee.email && user.userId !== employee.cognitoUserId) {
      return { allowed: false, reason: 'Employees can only modify their own data' };
    }

    const allowedFields = ['mobile', 'address', 'middleName'];
    const restrictedFields = Object.keys(updates).filter(
      field => !allowedFields.includes(field)
    );

    if (restrictedFields.length > 0) {
      return { 
        allowed: false, 
        reason: `Employees can only update: ${allowedFields.join(', ')}. Attempted to update: ${restrictedFields.join(', ')}` 
      };
    }

    return { allowed: true };
  }

  return { allowed: false, reason: 'Insufficient permissions' };
}

function canDeleteEmployee(user, employee) {
  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (user.role === 'manager') {
    if (user.companyId !== employee.companyId) {
      return { allowed: false, reason: 'Cannot delete employees from other companies' };
    }

    if (employee.role === 'admin' || employee.role === 'manager') {
      return { allowed: false, reason: 'Managers cannot delete admin or manager accounts' };
    }

    return { allowed: true };
  }

  return { allowed: false, reason: 'Employees cannot delete accounts' };
}

function filterEmployeeData(user, employee) {
  if (user.role === 'admin' || user.role === 'manager') {
    return employee;
  }

  if (user.role === 'employee') {
    if (user.email === employee.email || user.userId === employee.cognitoUserId) {
      return employee;
    }

    return {
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      fullName: employee.fullName,
      email: employee.email,
      designation: employee.designation,
      department: employee.department,
      status: employee.status
    };
  }

  return employee;
}

function getAccessibleCompanyIds(user) {
  if (user.role === 'admin') {
    return null;
  }
  return [user.companyId];
}

module.exports = {
  extractUserFromEvent,
  hasRole,
  requireRole,
  canAccessCompany,
  canAccessEmployee,
  canModifyEmployee,
  canDeleteEmployee,
  filterEmployeeData,
  getAccessibleCompanyIds,
  ROLE_HIERARCHY
};
