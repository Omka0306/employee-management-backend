# Getting Started with Employee Management Backend

Welcome! This guide will help you get your serverless employee management API up and running.

## 📋 What You'll Build

A production-ready serverless API with:
- ✅ AWS Cognito authentication (sign-up, sign-in, email verification)
- ✅ Complete employee CRUD operations
- ✅ DynamoDB database with pay-per-request billing
- ✅ API Gateway with Cognito authorizer
- ✅ Lambda functions for business logic
- ✅ Search and filter capabilities
- ✅ Comprehensive test coverage
- ✅ CI/CD ready with GitHub Actions

## 🎯 Quick Links

- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md) - Get running in 10 minutes
- **Full Documentation**: [README.md](./README.md) - Complete feature documentation
- **API Reference**: [API.md](./API.md) - Detailed API documentation
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md) - Step-by-step deployment
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture details

## 🚀 Installation Steps

### 1. Install Dependencies (2 minutes)

```bash
# Install project dependencies
npm install

# Install Serverless Framework globally
npm install -g serverless
```

### 2. Configure AWS (3 minutes)

```bash
# Configure AWS CLI with your credentials
aws configure

# You'll need:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., ap-south-1)
```

### 3. Set Up Cognito (5 minutes)

**Option A: AWS Console (Recommended for beginners)**
1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Create a User Pool
3. Enable email sign-in
4. Create an App Client with secret
5. Enable `USER_PASSWORD_AUTH` flow

**Option B: AWS CLI**
```bash
# See DEPLOYMENT.md for CLI commands
```

### 4. Configure Environment Variables (1 minute)

```bash
# Copy example file
cp .env.example .env

# Edit .env with your Cognito details
# Required values:
# - COGNITO_USER_POOL_ID
# - COGNITO_APP_CLIENT_ID
# - COGNITO_APP_CLIENT_SECRET
```

### 5. Deploy to AWS (2 minutes)

```bash
# Deploy to development environment
npm run deploy:dev

# Save the API endpoint URL from the output!
```

## ✅ Verify Installation

### Test Authentication

```bash
# 1. Sign up
curl -X POST https://YOUR_API_URL/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456","name":"Test User"}'

# 2. Check email for verification code

# 3. Confirm
curl -X POST https://YOUR_API_URL/dev/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# 4. Sign in
curl -X POST https://YOUR_API_URL/dev/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123456"}'
```

### Test Employee API

```bash
# Create employee (use access token from sign-in)
curl -X POST https://YOUR_API_URL/dev/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"John",
    "lastName":"Doe",
    "email":"john@example.com",
    "mobile":"9876543210",
    "designation":"Software Engineer"
  }'

# Get all employees
curl -X GET https://YOUR_API_URL/dev/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📁 Project Structure

```
employee-management-backend/
├── src/
│   ├── lambda/employees/      # Lambda function handlers
│   │   ├── create.js          # POST /api/employees
│   │   ├── getAll.js          # GET /api/employees
│   │   ├── getById.js         # GET /api/employees/{id}
│   │   ├── update.js          # PUT /api/employees/{id}
│   │   ├── delete.js          # DELETE /api/employees/{id}
│   │   └── search.js          # GET /api/employees/search
│   ├── models/
│   │   └── employee.js        # Employee data model
│   ├── services/
│   │   └── dynamodb.js        # DynamoDB operations
│   ├── helpers/
│   │   └── response.js        # HTTP response helpers
│   ├── routes/
│   │   └── auth.js            # Cognito auth routes
│   └── tests/                 # Test files
├── serverless.yml             # Serverless configuration
├── package.json               # Dependencies
└── .env                       # Environment variables
```

## 🔑 Key Concepts

### 1. Authentication Flow

```
User → Sign Up → Email Verification → Sign In → Get JWT Token → Use Token for API Calls
```

### 2. Employee Data Model

```javascript
{
  employeeId: "auto-generated-uuid",
  firstName: "John",
  middleName: "Michael",
  lastName: "Doe",
  email: "john@example.com",
  mobile: "9876543210",
  address: {
    street: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    zipCode: "400001",
    country: "India"
  },
  designation: "Software Engineer",
  department: "Engineering",
  dateOfJoining: "2025-01-15",
  salary: 75000,
  status: "active"
}
```

### 3. API Endpoints

**Public (No Auth Required)**:
- `POST /auth/signup` - Register new user
- `POST /auth/confirm` - Confirm email
- `POST /auth/signin` - Sign in and get tokens

**Protected (Auth Required)**:
- `POST /api/employees` - Create employee
- `GET /api/employees` - Get all employees
- `GET /api/employees/{id}` - Get employee by ID
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee
- `GET /api/employees/search?q=term` - Search employees

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

- `src/tests/employee.model.test.js` - Model validation tests
- `src/tests/lambda.integration.test.js` - Lambda handler tests

## 🛠️ Development Workflow

### Local Development

```bash
# Run locally with Serverless Offline
npm run offline

# API available at http://localhost:3000
```

### Make Changes

1. Edit Lambda handlers in `src/lambda/employees/`
2. Update models in `src/models/`
3. Modify services in `src/services/`
4. Run tests: `npm test`
5. Deploy: `npm run deploy:dev`

### Deploy Updates

```bash
# Deploy all functions
npm run deploy:dev

# Deploy single function (faster)
serverless deploy function -f createEmployee
```

## 📊 Monitoring

### View Logs

```bash
# View logs for a function
serverless logs -f createEmployee -t

# View logs for last 10 minutes
serverless logs -f createEmployee --startTime 10m
```

### AWS Console

1. **Lambda**: View function metrics and logs
2. **DynamoDB**: Monitor table usage
3. **API Gateway**: Check API metrics
4. **CloudWatch**: View all logs and metrics

## 💰 Cost Management

### Expected Costs

**Development** (< 10K requests/month):
- **~$0-2/month** (mostly free tier)

**Production** (100K requests/month):
- **~$10-20/month**

### Free Tier Benefits

- Lambda: 1M requests/month free
- DynamoDB: 25 GB storage free
- API Gateway: 1M calls free (first 12 months)
- Cognito: 50,000 MAUs free

### Set Up Billing Alerts

1. Go to AWS Billing Console
2. Create billing alarm
3. Set threshold (e.g., $10/month)

## 🔒 Security Best Practices

### For Development

- ✅ Never commit `.env` file
- ✅ Use different Cognito pools for dev/prod
- ✅ Rotate AWS credentials regularly
- ✅ Use IAM roles with least privilege

### For Production

- ✅ Enable MFA on Cognito
- ✅ Set up custom domain with SSL
- ✅ Enable CloudTrail logging
- ✅ Configure API throttling
- ✅ Enable DynamoDB backups
- ✅ Use AWS Secrets Manager for secrets

## 🐛 Troubleshooting

### Common Issues

**1. "Credentials not found"**
```bash
aws configure
# Re-enter credentials
```

**2. "User is not confirmed"**
- Check email for confirmation code
- Use `/auth/confirm` endpoint

**3. "Token expired"**
- Tokens expire after 1 hour
- Sign in again to get new token

**4. "Email already exists"**
- Email must be unique
- Use different email or delete user from Cognito

**5. "Deployment failed"**
- Check AWS credentials
- Verify IAM permissions
- Check CloudFormation console for details

### Get Help

- Check [README.md](./README.md) for detailed docs
- Review [API.md](./API.md) for API reference
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Create an issue in the repository

## 📚 Next Steps

### 1. Frontend Integration

Use the API endpoint in your frontend:

```javascript
// Example: React/Vue/Angular
const API_URL = 'https://your-api-url.com/dev';

// Sign in
const response = await fetch(`${API_URL}/auth/signin`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken } = await response.json();

// Use token for API calls
const employees = await fetch(`${API_URL}/api/employees`, {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### 2. Import Postman Collection

1. Open Postman
2. Import `api-collection.json`
3. Update `baseUrl` variable
4. Test all endpoints

### 3. Set Up CI/CD

The project includes GitHub Actions workflow:
- Automatic testing on push
- Auto-deploy to dev/prod
- See `.github/workflows/deploy.yml`

### 4. Production Deployment

```bash
# Deploy to production
npm run deploy:prod

# Use separate Cognito pool for production
# Update .env with production values
```

## 🎓 Learning Resources

### AWS Services Used

- **Lambda**: Serverless compute
- **DynamoDB**: NoSQL database
- **API Gateway**: REST API
- **Cognito**: User authentication
- **CloudWatch**: Logging and monitoring

### Serverless Framework

- [Serverless Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda Guide](https://docs.aws.amazon.com/lambda/)
- [DynamoDB Guide](https://docs.aws.amazon.com/dynamodb/)

## ✨ Features Implemented

- ✅ User authentication with AWS Cognito
- ✅ Email verification
- ✅ JWT token-based authorization
- ✅ Complete CRUD operations for employees
- ✅ Search and filter functionality
- ✅ Input validation
- ✅ Email uniqueness checks
- ✅ Pagination support
- ✅ Error handling
- ✅ CORS configuration
- ✅ Comprehensive tests
- ✅ API documentation
- ✅ CI/CD workflow

## 🎉 You're Ready!

Your serverless employee management API is now set up and ready to use!

**Quick Commands**:
```bash
npm install              # Install dependencies
npm run deploy:dev       # Deploy to AWS
npm test                 # Run tests
npm run offline          # Run locally
npm run remove           # Remove from AWS
```

**Need Help?**
- 📖 Read the [full documentation](./README.md)
- 🔍 Check the [API reference](./API.md)
- 🚀 Follow the [deployment guide](./DEPLOYMENT.md)
- 🏗️ Review the [architecture](./ARCHITECTURE.md)

---

**Happy Coding! 🚀**
