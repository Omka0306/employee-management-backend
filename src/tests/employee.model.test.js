const Employee = require('../models/employee');

describe('Employee Model', () => {
  describe('Constructor', () => {
    it('should create an employee with all fields', () => {
      const data = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        address: {
          street: '123 Main St',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        designation: 'Software Engineer',
        department: 'Engineering',
        salary: 75000,
        status: 'active'
      };

      const employee = new Employee(data);

      expect(employee.firstName).toBe('John');
      expect(employee.middleName).toBe('Michael');
      expect(employee.lastName).toBe('Doe');
      expect(employee.email).toBe('john.doe@example.com');
      expect(employee.mobile).toBe('9876543210');
      expect(employee.designation).toBe('Software Engineer');
      expect(employee.employeeId).toBeDefined();
      expect(employee.createdAt).toBeDefined();
      expect(employee.updatedAt).toBeDefined();
    });

    it('should create an employee with default values', () => {
      const data = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        mobile: '9876543211',
        designation: 'Manager'
      };

      const employee = new Employee(data);

      expect(employee.middleName).toBe('');
      expect(employee.department).toBe('');
      expect(employee.salary).toBe(0);
      expect(employee.status).toBe('active');
      expect(employee.address).toEqual({});
    });

    it('should generate a unique employeeId', () => {
      const data = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        mobile: '9876543212',
        designation: 'Tester'
      };

      const employee1 = new Employee(data);
      const employee2 = new Employee(data);

      expect(employee1.employeeId).not.toBe(employee2.employeeId);
    });
  });

  describe('Validation', () => {
    it('should validate a correct employee', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should fail validation when firstName is missing', () => {
      const data = {
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('First name is required');
    });

    it('should fail validation when lastName is missing', () => {
      const data = {
        firstName: 'John',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Last name is required');
    });

    it('should fail validation when email is missing', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        mobile: '9876543210',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Email is required');
    });

    it('should fail validation when email format is invalid', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        mobile: '9876543210',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid email format');
    });

    it('should fail validation when mobile is missing', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Mobile number is required');
    });

    it('should fail validation when mobile format is invalid', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '123',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Invalid mobile number format (should be 10 digits)');
    });

    it('should fail validation when designation is missing', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Designation is required');
    });

    it('should fail validation when status is invalid', () => {
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        designation: 'Developer',
        status: 'invalid-status'
      };

      const employee = new Employee(data);
      const validation = employee.validate();

      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Status must be one of: active, inactive, terminated');
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const employee = new Employee({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        mobile: '9876543210',
        designation: 'Tester'
      });

      expect(employee.isValidEmail('test@example.com')).toBe(true);
      expect(employee.isValidEmail('user.name@example.co.in')).toBe(true);
      expect(employee.isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      const employee = new Employee({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        mobile: '9876543210',
        designation: 'Tester'
      });

      expect(employee.isValidEmail('invalid')).toBe(false);
      expect(employee.isValidEmail('invalid@')).toBe(false);
      expect(employee.isValidEmail('@example.com')).toBe(false);
      expect(employee.isValidEmail('invalid@.com')).toBe(false);
    });
  });

  describe('Mobile Validation', () => {
    it('should validate correct mobile formats', () => {
      const employee = new Employee({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        mobile: '9876543210',
        designation: 'Tester'
      });

      expect(employee.isValidMobile('9876543210')).toBe(true);
      expect(employee.isValidMobile('1234567890')).toBe(true);
    });

    it('should reject invalid mobile formats', () => {
      const employee = new Employee({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        mobile: '9876543210',
        designation: 'Tester'
      });

      expect(employee.isValidMobile('123')).toBe(false);
      expect(employee.isValidMobile('12345678901')).toBe(false);
      expect(employee.isValidMobile('abcdefghij')).toBe(false);
    });
  });

  describe('toDynamoDB', () => {
    it('should convert employee to DynamoDB format', () => {
      const data = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        email: 'John.Doe@Example.com',
        mobile: '9876543210',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const dynamoItem = employee.toDynamoDB();

      expect(dynamoItem.employeeId).toBeDefined();
      expect(dynamoItem.firstName).toBe('John');
      expect(dynamoItem.fullName).toBe('John Michael Doe');
      expect(dynamoItem.email).toBe('john.doe@example.com'); // lowercase
      expect(dynamoItem.createdAt).toBeDefined();
      expect(dynamoItem.updatedAt).toBeDefined();
    });
  });

  describe('toJSON', () => {
    it('should convert employee to JSON format', () => {
      const data = {
        firstName: 'John',
        middleName: 'Michael',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        mobile: '9876543210',
        designation: 'Developer'
      };

      const employee = new Employee(data);
      const json = employee.toJSON();

      expect(json.employeeId).toBeDefined();
      expect(json.firstName).toBe('John');
      expect(json.fullName).toBe('John Michael Doe');
      expect(json.email).toBe('john.doe@example.com');
      expect(json.createdAt).toBeDefined();
      expect(json.updatedAt).toBeDefined();
      expect(json.createdBy).toBeUndefined(); // Not included in JSON response
    });
  });
});
