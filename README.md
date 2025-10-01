# Employee Management Backend

A serverless multi-company employee management system with role-based access control (RBAC) built with AWS Lambda, DynamoDB, API Gateway, and Cognito.

## Features

### Multi-Company Support
- Multiple companies in single database
- Company-scoped data isolation
- Company management (CRUD operations)

### Role-Based Access Control (RBAC)
- **Admin**: Full access across all companies
- **Manager**: Access to their company, can manage employees
- **Employee**: View/edit own profile only

### Authentication & User Management
- AWS Cognito authentication with JWT tokens
- Automatic user creation when employee is added
- Temporary password with forced change on first login
- Custom attributes for role and company

### Employee Operations
- Create, read, update, delete employees
- Search and filter employees
- Company-scoped queries
- Field-level access control

## Architecture

- **Authentication**: AWS Cognito User Pools
- **API**: AWS API Gateway with Lambda
- **Database**: AWS DynamoDB (2 tables: Employees, Companies)
- **Framework**: Serverless Framework
- **Runtime**: Node.js 20.x

## Quick Start

### Prerequisites
- Node.js 20+
- AWS Account with configured credentials
- Serverless Framework: `npm install -g serverless`

### Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your AWS Cognito details

# Deploy
serverless deploy --stage dev
```

### Required Environment Variables

```env
AWS_REGION=ap-south-1
COGNITO_REGION=ap-south-1
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_APP_CLIENT_ID=your-app-client-id
COGNITO_APP_CLIENT_SECRET=your-app-client-secret
COGNITO_TOKEN_USE=access
```

### Cognito Setup

1. Create User Pool in AWS Cognito
2. Add custom attributes:
   - `custom:role` (String, Mutable)
   - `custom:companyId` (String, Mutable)
3. Enable `USER_PASSWORD_AUTH` flow
4. Create app client with secret

### Create First Admin

```bash
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_POOL_ID \
  --username admin@company.com \
  --user-attributes \
    Name=email,Value=admin@company.com \
    Name=email_verified,Value=true \
    Name=name,Value="Admin User" \
    Name=custom:role,Value=admin \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS
```

## API Endpoints

See [API_COLLECTION.md](./API_COLLECTION.md) for complete API documentation.

### Authentication
- `POST /auth/signup` - Register user
- `POST /auth/confirm` - Confirm registration
- `POST /auth/signin` - Sign in

### Companies (Admin only)
- `POST /api/companies` - Create company
- `GET /api/companies` - List companies
- `GET /api/companies/{id}` - Get company
- `PUT /api/companies/{id}` - Update company
- `DELETE /api/companies/{id}` - Delete company

### Employees (Role-based access)
- `POST /api/employees` - Create employee
- `GET /api/employees` - List employees
- `GET /api/employees/{id}` - Get employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/search?q=term` - Search employees

## Project Structure

```
src/
├── lambda/
│   ├── auth/              # Authentication handlers
│   ├── companies/         # Company CRUD handlers
│   └── employees/         # Employee CRUD handlers
├── models/
│   ├── company.js         # Company model
│   └── employee.js        # Employee model
├── services/
│   ├── cognito.js         # Cognito user management
│   └── dynamodb.js        # DynamoDB operations
├── middlewares/
│   └── rbac.js            # Authorization middleware
└── helpers/
    └── response.js        # Response utilities
```

## Role Permissions

| Operation | Admin | Manager | Employee |
|-----------|-------|---------|----------|
| Manage Companies | ✅ | ❌ | ❌ |
| Create Employees | ✅ (any company) | ✅ (own company) | ❌ |
| View All Employees | ✅ | ✅ (own company) | ✅ (limited) |
| Update Employees | ✅ | ✅ (own company) | ✅ (self, limited fields) |
| Delete Employees | ✅ | ✅ (own company) | ❌ |

## Database Schema

### Employees Table
- Primary Key: `employeeId`
- GSI: `EmailIndex`, `CompanyIndex`, `CreatedAtIndex`
- Fields: companyId, role, cognitoUserId, firstName, lastName, email, mobile, address, designation, department, salary, status, etc.

### Companies Table
- Primary Key: `companyId`
- GSI: `CompanyCodeIndex`
- Fields: companyName, companyCode, industry, address, contactEmail, status, etc.

## Development

```bash
# Run locally
serverless offline start

# Run tests
npm test

# Deploy
serverless deploy --stage dev

# Remove deployment
serverless remove --stage dev
```

## Security

- JWT token authentication
- Role-based authorization
- Company-scoped data access
- Field-level permissions
- Audit trail (createdBy, updatedBy)
- Temporary passwords with forced change

## Cost Optimization

- DynamoDB: Pay-per-request billing
- Lambda: Pay per execution (1M free/month)
- API Gateway: Pay per call
- Cognito: 50K free MAUs

Estimated cost for small usage: $0-10/month

## License

ISC
