const { errorResponse } = require('../helpers/response');
const DynamoDBService = require('../services/dynamodb');

/**
 * Role hierarchy for access control
 * Higher number = more privileges
 */
const ROLE_HIERARCHY = {
  admin: 3,
  manager: 2,
  employee: 1
};

/**
 * Extract user information from Cognito claims
 * @param {Object} event - Lambda event
 * @returns {Object|null}
 */
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

/**
 * Check if user has required role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
function hasRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

/**
 * Middleware to check if user has required role
 * @param {string} requiredRole - Required role (admin, manager, employee)
 * @returns {Function}
 */
function requireRole(requiredRole) {
  return async (event) => {
    const user = extractUserFromEvent(event);
    
    if (!user) {
      return errorResponse(401, 'Unauthorized - No user information found');
    }

    if (!hasRole(user.role, requiredRole)) {
      return errorResponse(403, `Forbidden - Requires ${requiredRole} role or higher`);
    }

    return null; // Authorization passed
  };
}

/**
 * Check if user can access company data
 * @param {Object} user - User object
 * @param {string} targetCompanyId - Target company ID
 * @returns {boolean}
 */
function canAccessCompany(user, targetCompanyId) {
  // Admin can access all companies
  if (user.role === 'admin') {
    return true;
  }

  // Manager and Employee can only access their own company
  return user.companyId === targetCompanyId;
}

/**
 * Check if user can access employee data
 * @param {Object} user - User object
 * @param {Object} employee - Employee object
 * @returns {boolean}
 */
async function canAccessEmployee(user, employee) {
  // Admin can access all employees
  if (user.role === 'admin') {
    return true;
  }

  // Manager can access employees in their company
  if (user.role === 'manager') {
    return user.companyId === employee.companyId;
  }

  // Employee can only access their own data
  if (user.role === 'employee') {
    return user.email === employee.email || user.userId === employee.cognitoUserId;
  }

  return false;
}

/**
 * Check if user can modify employee data
 * @param {Object} user - User object
 * @param {Object} employee - Employee object
 * @param {Object} updates - Fields being updated
 * @returns {Object} { allowed: boolean, reason: string }
 */
function canModifyEmployee(user, employee, updates = {}) {
  // Admin can modify all employees
  if (user.role === 'admin') {
    return { allowed: true };
  }

  // Manager can modify employees in their company (except other managers/admins)
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

    // Managers cannot change roles
    if (updates.role && updates.role !== employee.role) {
      return { allowed: false, reason: 'Managers cannot change employee roles' };
    }

    return { allowed: true };
  }

  // Employee can only modify their own data (limited fields)
  if (user.role === 'employee') {
    if (user.email !== employee.email && user.userId !== employee.cognitoUserId) {
      return { allowed: false, reason: 'Employees can only modify their own data' };
    }

    // Define allowed fields for employees to update
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

/**
 * Check if user can delete employee
 * @param {Object} user - User object
 * @param {Object} employee - Employee object
 * @returns {Object} { allowed: boolean, reason: string }
 */
function canDeleteEmployee(user, employee) {
  // Admin can delete all employees
  if (user.role === 'admin') {
    return { allowed: true };
  }

  // Manager can delete employees in their company (except managers/admins)
  if (user.role === 'manager') {
    if (user.companyId !== employee.companyId) {
      return { allowed: false, reason: 'Cannot delete employees from other companies' };
    }

    if (employee.role === 'admin' || employee.role === 'manager') {
      return { allowed: false, reason: 'Managers cannot delete admin or manager accounts' };
    }

    return { allowed: true };
  }

  // Employees cannot delete anyone
  return { allowed: false, reason: 'Employees cannot delete accounts' };
}

/**
 * Filter employee data based on user role
 * @param {Object} user - User object
 * @param {Object} employee - Employee object
 * @returns {Object} Filtered employee data
 */
function filterEmployeeData(user, employee) {
  // Admin and Manager can see all fields
  if (user.role === 'admin' || user.role === 'manager') {
    return employee;
  }

  // Employee can only see limited fields of other employees
  if (user.role === 'employee') {
    // If it's their own data, show everything
    if (user.email === employee.email || user.userId === employee.cognitoUserId) {
      return employee;
    }

    // For other employees, show limited info
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

/**
 * Get accessible company IDs for user
 * @param {Object} user - User object
 * @returns {Array|null} Array of company IDs or null for all companies (admin)
 */
function getAccessibleCompanyIds(user) {
  // Admin can access all companies
  if (user.role === 'admin') {
    return null; // null means all companies
  }

  // Manager and Employee can only access their own company
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
