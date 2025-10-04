const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
  QueryCommand
} = require('@aws-sdk/lib-dynamodb');

const EMPLOYEES_TABLE = process.env.EMPLOYEES_TABLE;
const COMPANIES_TABLE = process.env.COMPANIES_TABLE;
const COUNTER_TABLE = process.env.EMPLOYEES_TABLE;

const client = new DynamoDBClient({
  region: process.env.COGNITO_REGION || 'ap-south-1'
});

const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false
  }
});

class DynamoDBService {
  static async getNextEmployeeId() {
    const params = {
      TableName: COUNTER_TABLE,
      Key: { employeeId: 'COUNTER' },
      UpdateExpression: 'SET #counter = if_not_exists(#counter, :start) + :increment',
      ExpressionAttributeNames: {
        '#counter': 'counter'
      },
      ExpressionAttributeValues: {
        ':start': 1000, // Start from 1001
        ':increment': 1
      },
      ReturnValues: 'UPDATED_NEW'
    };

    try {
      const result = await docClient.send(new UpdateCommand(params));
      const nextId = result.Attributes.counter;
      return `EMP${String(nextId).padStart(6, '0')}`;
    } catch (error) {
      console.error('Error generating employee ID:', error);
      throw new Error('Failed to generate employee ID');
    }
  }

  static async createEmployee(employee) {
    const employeeId = await this.getNextEmployeeId();
    employee.employeeId = employeeId;
    const params = {
      TableName: EMPLOYEES_TABLE,
      Item: employee,
      ConditionExpression: 'attribute_not_exists(employeeId)'
    };

    try {
      await docClient.send(new PutCommand(params));
      return employee;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Employee with this ID already exists');
      }
      throw error;
    }
  }

  static async getEmployeeById(employeeId) {
    const params = {
      TableName: EMPLOYEES_TABLE,
      Key: { employeeId }
    };

    const result = await docClient.send(new GetCommand(params));
    return result.Item || null;
  }

  static async getAllEmployees(options = {}) {
    const { limit = 50, lastKey, status } = options;

    const params = {
      TableName: EMPLOYEES_TABLE,
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    if (status) {
      params.FilterExpression = '#status = :status';
      params.ExpressionAttributeNames = { '#status': 'status' };
      params.ExpressionAttributeValues = { ':status': status };
    }

    const result = await docClient.send(new ScanCommand(params));

    return {
      items: result.Items || [],
      lastKey: result.LastEvaluatedKey,
      count: result.Count
    };
  }

  static async updateEmployee(employeeId, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    const excludedFields = ['employeeId', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];

    Object.keys(updates).forEach((key, index) => {
      if (!excludedFields.includes(key) && updates[key] !== undefined) {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = updates[key];
      }
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (updates.updatedBy) {
      updateExpressions.push('#updatedBy = :updatedBy');
      expressionAttributeNames['#updatedBy'] = 'updatedBy';
      expressionAttributeValues[':updatedBy'] = updates.updatedBy;
    }

    const params = {
      TableName: EMPLOYEES_TABLE,
      Key: { employeeId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(employeeId)',
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await docClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Employee not found');
      }
      throw error;
    }
  }

  static async deleteEmployee(employeeId) {
    const params = {
      TableName: EMPLOYEES_TABLE,
      Key: { employeeId },
      ConditionExpression: 'attribute_exists(employeeId)'
    };

    try {
      await docClient.send(new DeleteCommand(params));
      return true;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Employee not found');
      }
      throw error;
    }
  }

  static async searchEmployees(searchTerm) {
    const params = {
      TableName: EMPLOYEES_TABLE,
      FilterExpression: 'contains(#fullName, :searchTerm) OR contains(#email, :searchTerm)',
      ExpressionAttributeNames: {
        '#fullName': 'fullName',
        '#email': 'email'
      },
      ExpressionAttributeValues: {
        ':searchTerm': searchTerm.toLowerCase()
      }
    };

    const result = await docClient.send(new ScanCommand(params));
    return result.Items || [];
  }

  static async getEmployeeByEmail(email) {
    const params = {
      TableName: EMPLOYEES_TABLE,
      IndexName: 'EmailIndex',
      KeyConditionExpression: '#email = :email',
      ExpressionAttributeNames: {
        '#email': 'email'
      },
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  static async emailExists(email, excludeEmployeeId = null) {
    const employee = await this.getEmployeeByEmail(email);
    
    if (!employee) {
      return false;
    }

    if (excludeEmployeeId && employee.employeeId === excludeEmployeeId) {
      return false;
    }

    return true;
  }

  static async getEmployeesByCompany(companyId, options = {}) {
    const { limit = 50, lastKey, status } = options;

    const params = {
      TableName: EMPLOYEES_TABLE,
      IndexName: 'CompanyIndex',
      KeyConditionExpression: '#companyId = :companyId',
      ExpressionAttributeNames: {
        '#companyId': 'companyId'
      },
      ExpressionAttributeValues: {
        ':companyId': companyId
      },
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    if (status) {
      params.FilterExpression = '#status = :status';
      params.ExpressionAttributeNames['#status'] = 'status';
      params.ExpressionAttributeValues[':status'] = status;
    }

    const result = await docClient.send(new QueryCommand(params));

    return {
      items: result.Items || [],
      lastKey: result.LastEvaluatedKey,
      count: result.Count
    };
  }


  static async getNextCompanyId() {
    const params = {
      TableName: COMPANIES_TABLE,
      Key: { companyId: 'COUNTER' },
      UpdateExpression: 'SET #counter = if_not_exists(#counter, :start) + :increment',
      ExpressionAttributeNames: {
        '#counter': 'counter'
      },
      ExpressionAttributeValues: {
        ':start': 100, // Start from 101
        ':increment': 1
      },
      ReturnValues: 'UPDATED_NEW'
    };

    try {
      const result = await docClient.send(new UpdateCommand(params));
      const nextId = result.Attributes.counter;
      return `COMP${String(nextId).padStart(5, '0')}`;
    } catch (error) {
      console.error('Error generating company ID:', error);
      throw new Error('Failed to generate company ID');
    }
  }

  static async createCompany(company) {
    const companyId = await this.getNextCompanyId();
    company.companyId = companyId;

    const params = {
      TableName: COMPANIES_TABLE,
      Item: company,
      ConditionExpression: 'attribute_not_exists(companyId)'
    };

    try {
      await docClient.send(new PutCommand(params));
      return company;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Company with this ID already exists');
      }
      throw error;
    }
  }

  static async getCompanyById(companyId) {
    const params = {
      TableName: COMPANIES_TABLE,
      Key: { companyId }
    };

    const result = await docClient.send(new GetCommand(params));
    return result.Item || null;
  }

  static async getCompanyByCode(companyCode) {
    const params = {
      TableName: COMPANIES_TABLE,
      IndexName: 'CompanyCodeIndex',
      KeyConditionExpression: '#companyCode = :companyCode',
      ExpressionAttributeNames: {
        '#companyCode': 'companyCode'
      },
      ExpressionAttributeValues: {
        ':companyCode': companyCode.toUpperCase()
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  static async getAllCompanies(options = {}) {
    const { limit = 50, lastKey, status } = options;

    const params = {
      TableName: COMPANIES_TABLE,
      Limit: limit
    };

    if (lastKey) {
      params.ExclusiveStartKey = lastKey;
    }

    if (status) {
      params.FilterExpression = '#status = :status';
      params.ExpressionAttributeNames = { '#status': 'status' };
      params.ExpressionAttributeValues = { ':status': status };
    }

    const result = await docClient.send(new ScanCommand(params));

    return {
      items: result.Items || [],
      lastKey: result.LastEvaluatedKey,
      count: result.Count
    };
  }

  static async updateCompany(companyId, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    const excludedFields = ['companyId', 'createdAt', 'createdBy', 'updatedAt', 'updatedBy'];

    Object.keys(updates).forEach((key, index) => {
      if (!excludedFields.includes(key) && updates[key] !== undefined) {
        const attrName = `#attr${index}`;
        const attrValue = `:val${index}`;
        updateExpressions.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] = updates[key];
      }
    });

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (updates.updatedBy) {
      updateExpressions.push('#updatedBy = :updatedBy');
      expressionAttributeNames['#updatedBy'] = 'updatedBy';
      expressionAttributeValues[':updatedBy'] = updates.updatedBy;
    }

    const params = {
      TableName: COMPANIES_TABLE,
      Key: { companyId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(companyId)',
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await docClient.send(new UpdateCommand(params));
      return result.Attributes;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Company not found');
      }
      throw error;
    }
  }

  static async deleteCompany(companyId) {
    const params = {
      TableName: COMPANIES_TABLE,
      Key: { companyId },
      ConditionExpression: 'attribute_exists(companyId)'
    };

    try {
      await docClient.send(new DeleteCommand(params));
      return true;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException') {
        throw new Error('Company not found');
      }
      throw error;
    }
  }

  static async companyCodeExists(companyCode, excludeCompanyId = null) {
    const company = await this.getCompanyByCode(companyCode);
    
    if (!company) {
      return false;
    }

    if (excludeCompanyId && company.companyId === excludeCompanyId) {
      return false;
    }

    return true;
  }
}

module.exports = DynamoDBService;
