class Company {
  constructor(data) {
    this.companyId = data.companyId;
    this.companyName = data.companyName;
    this.companyCode = data.companyCode; // Unique short code
    this.industry = data.industry || '';
    this.address = data.address || {};
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone || '';
    this.website = data.website || '';
    this.status = data.status || 'active'; // active, inactive, suspended
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || '';
    this.updatedBy = data.updatedBy || '';
  }

  validate() {
    const errors = [];

    // Required fields validation
    if (!this.companyName || this.companyName.trim() === '') {
      errors.push('Company name is required');
    }

    if (!this.companyCode || this.companyCode.trim() === '') {
      errors.push('Company code is required');
    } else if (!/^[A-Z0-9]{2,10}$/.test(this.companyCode)) {
      errors.push('Company code must be 2-10 uppercase alphanumeric characters');
    }

    if (!this.contactEmail || this.contactEmail.trim() === '') {
      errors.push('Contact email is required');
    } else if (!this.isValidEmail(this.contactEmail)) {
      errors.push('Invalid contact email format');
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
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Status must be one of: active, inactive, suspended');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  toDynamoDB() {
    return {
      companyId: this.companyId,
      companyName: this.companyName,
      companyCode: this.companyCode.toUpperCase(),
      industry: this.industry,
      address: this.address,
      contactEmail: this.contactEmail.toLowerCase(),
      contactPhone: this.contactPhone,
      website: this.website,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy
    };
  }

  toJSON() {
    return {
      companyId: this.companyId,
      companyName: this.companyName,
      companyCode: this.companyCode,
      industry: this.industry,
      address: this.address,
      contactEmail: this.contactEmail,
      contactPhone: this.contactPhone,
      website: this.website,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Company;
