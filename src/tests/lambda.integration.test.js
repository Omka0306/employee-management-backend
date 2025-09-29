/**
 * Integration tests for Lambda handlers
 * Note: These tests require DynamoDB to be available (local or AWS)
 */

const { handler: createHandler } = require('../lambda/employees/create');
const { handler: getAllHandler } = require('../lambda/employees/getAll');
const { handler: getByIdHandler } = require('../lambda/employees/getById');
const { handler: updateHandler } = require('../lambda/employees/update');
const { handler: deleteHandler } = require('../lambda/employees/delete');
const { handler: searchHandler } = require('../lambda/employees/search');

// Mock event helper
function createMockEvent(options = {}) {
  return {
    body: options.body ? JSON.stringify(options.body) : null,
    pathParameters: options.pathParameters || null,
    queryStringParameters: options.queryStringParameters || null,
    requestContext: {
      authorizer: {
        claims: {
          sub: 'test-user-id',
          email: 'test@example.com',
          'cognito:username': 'testuser'
        }
      }
    },
    headers: options.headers || {}
  };
}

describe('Employee Lambda Handlers - Integration Tests', () => {
  let testEmployeeId;

  describe('Create Employee', () => {
    it('should create a new employee successfully', async () => {
      const event = createMockEvent({
        body: {
          firstName: 'Integration',
          lastName: 'Test',
          email: `test-${Date.now()}@example.com`,
          mobile: '9876543210',
          designation: 'Software Engineer',
          department: 'Engineering',
          address: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          salary: 75000
        }
      });

      const response = await createHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.employeeId).toBeDefined();
      expect(body.data.firstName).toBe('Integration');
      
      testEmployeeId = body.data.employeeId;
    });

    it('should fail with validation errors for missing required fields', async () => {
      const event = createMockEvent({
        body: {
          firstName: 'Test'
          // Missing required fields
        }
      });

      const response = await createHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.success).toBe(false);
      expect(body.errors.length).toBeGreaterThan(0);
    });

    it('should fail with invalid email format', async () => {
      const event = createMockEvent({
        body: {
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          mobile: '9876543210',
          designation: 'Developer'
        }
      });

      const response = await createHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.success).toBe(false);
      expect(body.errors).toContain('Invalid email format');
    });

    it('should fail with invalid JSON body', async () => {
      const event = {
        ...createMockEvent(),
        body: 'invalid json'
      };

      const response = await createHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  describe('Get All Employees', () => {
    it('should retrieve all employees', async () => {
      const event = createMockEvent();

      const response = await getAllHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.employees).toBeDefined();
      expect(Array.isArray(body.data.employees)).toBe(true);
    });

    it('should support pagination with limit', async () => {
      const event = createMockEvent({
        queryStringParameters: {
          limit: '5'
        }
      });

      const response = await getAllHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.employees.length).toBeLessThanOrEqual(5);
    });

    it('should filter by status', async () => {
      const event = createMockEvent({
        queryStringParameters: {
          status: 'active'
        }
      });

      const response = await getAllHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      
      if (body.data.employees.length > 0) {
        body.data.employees.forEach(emp => {
          expect(emp.status).toBe('active');
        });
      }
    });
  });

  describe('Get Employee By ID', () => {
    it('should retrieve an employee by ID', async () => {
      // First create an employee
      const createEvent = createMockEvent({
        body: {
          firstName: 'GetById',
          lastName: 'Test',
          email: `getbyid-${Date.now()}@example.com`,
          mobile: '9876543211',
          designation: 'Manager'
        }
      });

      const createResponse = await createHandler(createEvent);
      const createBody = JSON.parse(createResponse.body);
      const employeeId = createBody.data.employeeId;

      // Now get the employee
      const getEvent = createMockEvent({
        pathParameters: { id: employeeId }
      });

      const response = await getByIdHandler(getEvent);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.employeeId).toBe(employeeId);
      expect(body.data.firstName).toBe('GetById');
    });

    it('should return 404 for non-existent employee', async () => {
      const event = createMockEvent({
        pathParameters: { id: 'non-existent-id' }
      });

      const response = await getByIdHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body.success).toBe(false);
    });

    it('should return 400 when ID is missing', async () => {
      const event = createMockEvent();

      const response = await getByIdHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  describe('Update Employee', () => {
    it('should update an employee successfully', async () => {
      // First create an employee
      const createEvent = createMockEvent({
        body: {
          firstName: 'Update',
          lastName: 'Test',
          email: `update-${Date.now()}@example.com`,
          mobile: '9876543212',
          designation: 'Developer'
        }
      });

      const createResponse = await createHandler(createEvent);
      const createBody = JSON.parse(createResponse.body);
      const employeeId = createBody.data.employeeId;

      // Now update the employee
      const updateEvent = createMockEvent({
        pathParameters: { id: employeeId },
        body: {
          designation: 'Senior Developer',
          salary: 90000
        }
      });

      const response = await updateHandler(updateEvent);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.designation).toBe('Senior Developer');
      expect(body.data.salary).toBe(90000);
    });

    it('should return 404 for non-existent employee', async () => {
      const event = createMockEvent({
        pathParameters: { id: 'non-existent-id' },
        body: {
          designation: 'Manager'
        }
      });

      const response = await updateHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body.success).toBe(false);
    });

    it('should fail validation when updating with invalid data', async () => {
      // First create an employee
      const createEvent = createMockEvent({
        body: {
          firstName: 'Validation',
          lastName: 'Test',
          email: `validation-${Date.now()}@example.com`,
          mobile: '9876543213',
          designation: 'Developer'
        }
      });

      const createResponse = await createHandler(createEvent);
      const createBody = JSON.parse(createResponse.body);
      const employeeId = createBody.data.employeeId;

      // Try to update with invalid email
      const updateEvent = createMockEvent({
        pathParameters: { id: employeeId },
        body: {
          email: 'invalid-email'
        }
      });

      const response = await updateHandler(updateEvent);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.success).toBe(false);
    });
  });

  describe('Delete Employee', () => {
    it('should delete an employee successfully', async () => {
      // First create an employee
      const createEvent = createMockEvent({
        body: {
          firstName: 'Delete',
          lastName: 'Test',
          email: `delete-${Date.now()}@example.com`,
          mobile: '9876543214',
          designation: 'Tester'
        }
      });

      const createResponse = await createHandler(createEvent);
      const createBody = JSON.parse(createResponse.body);
      const employeeId = createBody.data.employeeId;

      // Now delete the employee
      const deleteEvent = createMockEvent({
        pathParameters: { id: employeeId }
      });

      const response = await deleteHandler(deleteEvent);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.employeeId).toBe(employeeId);

      // Verify deletion
      const getEvent = createMockEvent({
        pathParameters: { id: employeeId }
      });

      const getResponse = await getByIdHandler(getEvent);
      expect(getResponse.statusCode).toBe(404);
    });

    it('should return 404 for non-existent employee', async () => {
      const event = createMockEvent({
        pathParameters: { id: 'non-existent-id' }
      });

      const response = await deleteHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(404);
      expect(body.success).toBe(false);
    });
  });

  describe('Search Employees', () => {
    it('should search employees by name', async () => {
      const event = createMockEvent({
        queryStringParameters: {
          q: 'Test'
        }
      });

      const response = await searchHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.employees).toBeDefined();
      expect(Array.isArray(body.data.employees)).toBe(true);
    });

    it('should return 400 when search term is missing', async () => {
      const event = createMockEvent();

      const response = await searchHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(400);
      expect(body.success).toBe(false);
    });

    it('should support search parameter with "search" query param', async () => {
      const event = createMockEvent({
        queryStringParameters: {
          search: 'Developer'
        }
      });

      const response = await searchHandler(event);
      const body = JSON.parse(response.body);

      expect(response.statusCode).toBe(200);
      expect(body.success).toBe(true);
    });
  });
});
