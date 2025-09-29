# Employee Management Backend

A serverless employee management system built with AWS Lambda, DynamoDB, API Gateway, and Cognito authentication using the Serverless Framework.

## 🏗️ Architecture

- **Authentication**: AWS Cognito User Pools
- **API**: AWS API Gateway with Lambda functions
- **Database**: AWS DynamoDB (Pay-per-request billing)
- **Framework**: Serverless Framework
- **Runtime**: Node.js 18.x

## 📋 Features

### Authentication (AWS Cognito)
- ✅ User registration (sign-up)
- ✅ Email verification
- ✅ User login (sign-in)
- ✅ JWT token-based authentication

### Employee CRUD Operations
- ✅ Create employee
- ✅ Get all employees (with pagination)
- ✅ Get employee by ID
- ✅ Update employee
- ✅ Delete employee
- ✅ Search employees by name or email
- ✅ Filter employees by status

### Employee Fields
- `employeeId` (auto-generated UUID)
- `firstName` (required)
- `middleName` (optional)
- `lastName` (required)
- `email` (required, unique)
- `mobile` (required, 10 digits)
- `address` (object with street, city, state, zipCode, country)
- `designation` (required)
- `department` (optional)
- `dateOfJoining` (auto-generated or provided)
- `salary` (optional)
- `status` (active/inactive/terminated)
- `createdAt` (auto-generated)
- `updatedAt` (auto-updated)

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18 or higher)
2. **AWS Account** with configured credentials
3. **AWS CLI** installed and configured
4. **Serverless Framework** installed globally

```bash
npm install -g serverless
```

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd employee-management-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure AWS Credentials**
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your AWS Cognito details
```

Required environment variables:
```env
AWS_REGION=ap-south-1
COGNITO_REGION=ap-south-1
COGNITO_USER_POOL_ID=your-user-pool-id
COGNITO_APP_CLIENT_ID=your-app-client-id
COGNITO_APP_CLIENT_SECRET=your-app-client-secret
COGNITO_TOKEN_USE=access
```

### AWS Cognito Setup

1. **Create a User Pool** in AWS Cognito Console
2. **Configure App Client**:
   - Enable `USER_PASSWORD_AUTH` flow
   - Generate app client secret
   - Configure email verification
3. **Update `.env`** with your Cognito details

## 📦 Deployment

### Deploy to AWS

**Development Environment:**
```bash
npm run deploy:dev
```

**Production Environment:**
```bash
npm run deploy:prod
```

**Custom Stage:**
```bash
serverless deploy --stage staging
```

After deployment, you'll receive:
- API Gateway endpoint URL
- DynamoDB table name
- Lambda function names

### Local Development

Run the API locally using Serverless Offline:

```bash
npm run offline
```

This will start a local API Gateway at `http://localhost:3000`

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Test Files
- `src/tests/employee.model.test.js` - Employee model validation tests
- `src/tests/lambda.integration.test.js` - Lambda handler integration tests

## 📚 API Documentation

### Base URL
```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

### Authentication Endpoints

#### 1. Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

#### 2. Confirm Sign Up
```http
POST /auth/confirm
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

#### 3. Sign In
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "message": "Sign-in successful",
  "idToken": "eyJraWQiOiI...",
  "accessToken": "eyJraWQiOiI...",
  "refreshToken": "eyJjdHkiOiI...",
  "expiresIn": 3600
}
```

### Employee Endpoints (Protected)

**All employee endpoints require authentication. Include the access token in the Authorization header:**
```
Authorization: Bearer {accessToken}
```

#### 1. Create Employee
```http
POST /api/employees
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "9876543210",
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "designation": "Software Engineer",
  "department": "Engineering",
  "salary": 75000,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

#### 2. Get All Employees
```http
GET /api/employees?limit=50&status=active
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `limit` (optional): Number of employees to return (default: 50)
- `status` (optional): Filter by status (active/inactive/terminated)
- `lastKey` (optional): For pagination

**Response:**
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [...],
    "count": 10,
    "lastKey": "encoded-key-for-pagination"
  }
}
```

#### 3. Get Employee by ID
```http
GET /api/employees/{employeeId}
Authorization: Bearer {accessToken}
```

#### 4. Update Employee
```http
PUT /api/employees/{employeeId}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "designation": "Senior Software Engineer",
  "salary": 90000
}
```

#### 5. Delete Employee
```http
DELETE /api/employees/{employeeId}
Authorization: Bearer {accessToken}
```

#### 6. Search Employees
```http
GET /api/employees/search?q=john
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `q` or `search`: Search term (searches in name and email)

## 🗂️ Project Structure

```
employee-management-backend/
├── src/
│   ├── lambda/
│   │   └── employees/
│   │       ├── create.js          # Create employee handler
│   │       ├── getAll.js          # Get all employees handler
│   │       ├── getById.js         # Get employee by ID handler
│   │       ├── update.js          # Update employee handler
│   │       ├── delete.js          # Delete employee handler
│   │       └── search.js          # Search employees handler
│   ├── models/
│   │   └── employee.js            # Employee model with validation
│   ├── services/
│   │   └── dynamodb.js            # DynamoDB service layer
│   ├── helpers/
│   │   └── response.js            # HTTP response helpers
│   ├── routes/
│   │   └── auth.js                # Cognito authentication routes
│   ├── tests/
│   │   ├── employee.model.test.js # Model unit tests
│   │   └── lambda.integration.test.js # Lambda integration tests
│   └── app.js                     # Express app (for local dev)
├── serverless.yml                 # Serverless Framework configuration
├── jest.config.js                 # Jest test configuration
├── package.json                   # Node.js dependencies
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## 💰 Cost Optimization

This architecture is designed for cost efficiency:

1. **DynamoDB**: Pay-per-request billing (no minimum cost)
2. **Lambda**: Pay only for execution time (1M free requests/month)
3. **API Gateway**: Pay per API call (1M free for first 12 months)
4. **Cognito**: 50,000 free MAUs (Monthly Active Users)

**Estimated Monthly Cost** (for small-scale usage):
- < 10,000 requests/month: **~$0-5**
- 100,000 requests/month: **~$10-20**

## 🔒 Security Features

- ✅ AWS Cognito authentication with JWT tokens
- ✅ API Gateway authorizer for all employee endpoints
- ✅ Email validation and uniqueness checks
- ✅ Input validation and sanitization
- ✅ CORS enabled for frontend integration
- ✅ Secure environment variable management
- ✅ IAM roles with least privilege access

## 🛠️ Available Scripts

```bash
# Start local Express server
npm start

# Run tests
npm test

# Deploy to AWS (dev)
npm run deploy:dev

# Deploy to AWS (prod)
npm run deploy:prod

# Run locally with Serverless Offline
npm run offline

# Remove deployment from AWS
npm run remove
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| AWS_REGION | AWS region for deployment | Yes |
| COGNITO_REGION | AWS Cognito region | Yes |
| COGNITO_USER_POOL_ID | Cognito User Pool ID | Yes |
| COGNITO_APP_CLIENT_ID | Cognito App Client ID | Yes |
| COGNITO_APP_CLIENT_SECRET | Cognito App Client Secret | Yes |
| COGNITO_TOKEN_USE | Token type (access/id) | Yes |
| PORT | Local server port | No (default: 3000) |

## 🐛 Troubleshooting

### Common Issues

1. **Deployment fails with credentials error**
   - Ensure AWS CLI is configured: `aws configure`
   - Check IAM permissions for Lambda, DynamoDB, API Gateway

2. **Cognito authentication fails**
   - Verify User Pool ID and App Client ID are correct
   - Ensure `USER_PASSWORD_AUTH` flow is enabled in Cognito
   - Check that app client secret is correct

3. **DynamoDB access denied**
   - Check IAM role permissions in `serverless.yml`
   - Ensure table name matches environment variable

4. **CORS errors**
   - CORS is configured in `serverless.yml` and response helpers
   - Check API Gateway CORS settings

## 📄 License

ISC

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ using AWS Serverless Architecture**
