/**
 * Employee Model Schema
 * Defines the structure and validation for employee data
 */
class Employee {
  constructor(data) {
    // employeeId will be set by the service layer (numeric format)
    this.employeeId = data.employeeId;
    this.firstName = data.firstName;
    this.middleName = data.middleName || '';
    this.lastName = data.lastName;
    this.email = data.email;
    this.mobile = data.mobile;
    this.address = data.address || {};
    this.designation = data.designation;
    this.department = data.department || '';
    this.dateOfJoining = data.dateOfJoining || new Date().toISOString().split('T')[0];
    this.salary = data.salary || 0;
    this.status = data.status || 'active'; // active, inactive, terminated
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  /**
   * Validate employee data
   * @returns {Object} { isValid: boolean, errors: string[] }
   */
  validate() {
    const errors = [];

    // Required fields validation
    if (!this.firstName || this.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!this.lastName || this.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    if (!this.email || this.email.trim() === '') {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (!this.mobile || this.mobile.trim() === '') {
      errors.push('Mobile number is required');
    } else if (!this.isValidMobile(this.mobile)) {
      errors.push('Invalid mobile number format (should be 10 digits)');
    }

    if (!this.designation || this.designation.trim() === '') {
      errors.push('Designation is required');
    }

    // Address validation (if provided)
    if (this.address && typeof this.address === 'object') {
      if (this.address.street && typeof this.address.street !== 'string') {
        errors.push('Address street must be a string');
      }
      if (this.address.city && typeof this.address.city !== 'string') {
        errors.push('Address city must be a string');
      }
      if (this.address.state && typeof this.address.state !== 'string') {
        errors.push('Address state must be a string');
      }
      if (this.address.zipCode && typeof this.address.zipCode !== 'string') {
        errors.push('Address zipCode must be a string');
      }
      if (this.address.country && typeof this.address.country !== 'string') {
        errors.push('Address country must be a string');
      }
    }

    // Status validation
    const validStatuses = ['active', 'inactive', 'terminated'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Status must be one of: active, inactive, terminated');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   * @param {string} email 
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate mobile number format (10 digits)
   * @param {string} mobile 
   * @returns {boolean}
   */
  isValidMobile(mobile) {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(mobile.replace(/[\s-]/g, ''));
  }

  /**
   * Convert to DynamoDB item format
   * @returns {Object}
   */
  toDynamoDB() {
    return {
      employeeId: this.employeeId,
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.middleName} ${this.lastName}`.replace(/\s+/g, ' ').trim(),
      email: this.email.toLowerCase(),
      mobile: this.mobile,
      address: this.address,
      designation: this.designation,
      department: this.department,
      dateOfJoining: this.dateOfJoining,
      salary: this.salary,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }

  /**
   * Convert to API response format
   * @returns {Object}
   */
  toJSON() {
    return {
      employeeId: this.employeeId,
      firstName: this.firstName,
      middleName: this.middleName,
      lastName: this.lastName,
      fullName: `${this.firstName} ${this.middleName} ${this.lastName}`.replace(/\s+/g, ' ').trim(),
      email: this.email,
      mobile: this.mobile,
      address: this.address,
      designation: this.designation,
      department: this.department,
      dateOfJoining: this.dateOfJoining,
      salary: this.salary,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Employee;
