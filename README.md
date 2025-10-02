# Employee Management Backend

A serverless multi-company employee management system with role-based access control built with AWS Lambda, DynamoDB, API Gateway, and Cognito.

## Features

- **Multi-Company Support**: Company-scoped data isolation
- **Role-Based Access Control**: Admin, Manager, Employee roles
- **AWS Cognito Authentication**: JWT tokens with custom attributes
- **Employee Management**: Full CRUD operations with search
- **Company Management**: Admin-only company operations

## Quick Start

### Prerequisites
- Node.js 20+
- AWS Account with configured credentials
- Serverless Framework: `npm install -g serverless`

### Installation

```bash
npm install
cp .env.example .env
# Edit .env with your AWS Cognito details
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
2. Add custom attributes: `custom:role`, `custom:companyId`
3. Enable `USER_PASSWORD_AUTH` flow
4. Create app client with secret

## API Endpoints

### Authentication
- `POST /auth/signin` - Sign in
- `POST /auth/signup` - Register user
- `POST /auth/confirm` - Confirm registration

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

## Role Permissions

| Operation | Admin | Manager | Employee |
|-----------|-------|---------|----------|
| Manage Companies | ✅ | ❌ | ❌ |
| Create Employees | ✅ (any) | ✅ (own company) | ❌ |
| View Employees | ✅ | ✅ (own company) | ✅ (limited) |
| Update Employees | ✅ | ✅ (own company) | ✅ (self only) |
| Delete Employees | ✅ | ✅ (own company) | ❌ |

## Development

```bash
serverless offline start  # Run locally
npm test                  # Run tests
serverless deploy --stage dev  # Deploy
```

## License

ISC
