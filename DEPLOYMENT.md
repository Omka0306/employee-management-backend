# Deployment Guide

This guide will walk you through deploying the Employee Management Backend to AWS.

## Prerequisites Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed and configured
- [ ] Node.js 18+ installed
- [ ] Serverless Framework installed globally
- [ ] AWS Cognito User Pool created
- [ ] Environment variables configured

## Step-by-Step Deployment

### 1. AWS Account Setup

1. **Create an AWS Account** at https://aws.amazon.com
2. **Create an IAM User** with programmatic access
3. **Attach the following policies** to the IAM user:
   - `AWSLambdaFullAccess`
   - `AmazonDynamoDBFullAccess`
   - `AmazonAPIGatewayAdministrator`
   - `CloudFormationFullAccess`
   - `IAMFullAccess` (for creating Lambda execution roles)
   - `AmazonS3FullAccess` (for Serverless deployment artifacts)

4. **Save the Access Key ID and Secret Access Key**

### 2. Configure AWS CLI

```bash
aws configure
```

Enter the following when prompted:
```
AWS Access Key ID: YOUR_ACCESS_KEY
AWS Secret Access Key: YOUR_SECRET_KEY
Default region name: ap-south-1 (or your preferred region)
Default output format: json
```

Verify configuration:
```bash
aws sts get-caller-identity
```

### 3. Create AWS Cognito User Pool

#### Option A: Using AWS Console

1. Go to **AWS Cognito Console**
2. Click **Create user pool**
3. Configure sign-in options:
   - Select **Email** as sign-in option
4. Configure security requirements:
   - Password policy: Default or custom
   - MFA: Optional (recommended for production)
5. Configure sign-up experience:
   - Enable self-registration
   - Required attributes: email, name
6. Configure message delivery:
   - Email provider: Cognito (for testing) or SES (for production)
7. Integrate your app:
   - User pool name: `employee-management-users`
   - App client name: `employee-management-client`
   - **Important**: Generate a client secret
   - Enable `USER_PASSWORD_AUTH` flow
8. Review and create

#### Option B: Using AWS CLI

```bash
# Create User Pool
aws cognito-idp create-user-pool \
  --pool-name employee-management-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}" \
  --auto-verified-attributes email \
  --username-attributes email \
  --region ap-south-1

# Note the UserPoolId from the output

# Create App Client
aws cognito-idp create-user-pool-client \
  --user-pool-id YOUR_USER_POOL_ID \
  --client-name employee-management-client \
  --generate-secret \
  --explicit-auth-flows USER_PASSWORD_AUTH \
  --region ap-south-1

# Note the ClientId and ClientSecret from the output
```

### 4. Configure Environment Variables

1. **Copy the example environment file:**
```bash
cp .env.example .env
```

2. **Edit `.env` with your values:**
```env
AWS_REGION=ap-south-1
COGNITO_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your-client-id-here
COGNITO_APP_CLIENT_SECRET=your-client-secret-here
COGNITO_TOKEN_USE=access
PORT=3000
NODE_ENV=production
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Run Tests (Optional but Recommended)

```bash
npm test
```

### 7. Deploy to AWS

#### Deploy to Development Environment

```bash
npm run deploy:dev
```

#### Deploy to Production Environment

```bash
npm run deploy:prod
```

#### Deploy with Custom Stage

```bash
serverless deploy --stage staging
```

### 8. Deployment Output

After successful deployment, you'll see output similar to:

```
✔ Service deployed to stack employee-management-api-dev (112s)

endpoints:
  POST - https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev/api/employees
  GET - https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev/api/employees
  GET - https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{id}
  PUT - https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{id}
  DELETE - https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{id}
  GET - https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev/api/employees/search

functions:
  createEmployee: employee-management-api-dev-createEmployee (1.2 MB)
  getAllEmployees: employee-management-api-dev-getAllEmployees (1.2 MB)
  getEmployee: employee-management-api-dev-getEmployee (1.2 MB)
  updateEmployee: employee-management-api-dev-updateEmployee (1.2 MB)
  deleteEmployee: employee-management-api-dev-deleteEmployee (1.2 MB)
  searchEmployees: employee-management-api-dev-searchEmployees (1.2 MB)

Stack Outputs:
  ApiEndpoint: https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev
  EmployeesTableName: employee-management-api-employees-dev
```

**Save this API endpoint URL** - you'll need it for frontend integration.

### 9. Test the Deployment

#### Test Authentication Endpoint (Public)

```bash
# Sign up a new user
curl -X POST https://YOUR_API_ENDPOINT/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "name": "Test User"
  }'

# Confirm user (check email for code)
curl -X POST https://YOUR_API_ENDPOINT/dev/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'

# Sign in
curl -X POST https://YOUR_API_ENDPOINT/dev/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

#### Test Employee Endpoint (Protected)

```bash
# Get all employees (requires authentication)
curl -X GET https://YOUR_API_ENDPOINT/dev/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create employee
curl -X POST https://YOUR_API_ENDPOINT/dev/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "designation": "Software Engineer"
  }'
```

## Post-Deployment Configuration

### 1. Set Up Custom Domain (Optional)

```bash
# Install serverless domain manager plugin
npm install --save-dev serverless-domain-manager

# Add to serverless.yml
plugins:
  - serverless-domain-manager

custom:
  customDomain:
    domainName: api.yourdomain.com
    certificateName: '*.yourdomain.com'
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true

# Create domain
serverless create_domain

# Deploy with domain
serverless deploy
```

### 2. Enable CloudWatch Logs

CloudWatch logs are automatically enabled. View logs:

```bash
# View logs for a specific function
serverless logs -f createEmployee -t

# View logs for the last 10 minutes
serverless logs -f createEmployee --startTime 10m
```

### 3. Set Up Monitoring

1. Go to **AWS CloudWatch Console**
2. Create a dashboard for your API
3. Add metrics:
   - Lambda invocations
   - Lambda errors
   - Lambda duration
   - API Gateway 4xx/5xx errors
   - DynamoDB read/write capacity

### 4. Configure Alarms

```bash
# Example: Create alarm for Lambda errors
aws cloudwatch put-metric-alarm \
  --alarm-name employee-api-errors \
  --alarm-description "Alert on Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1
```

## Updating the Deployment

### Update Lambda Functions Only

```bash
serverless deploy function -f createEmployee
```

### Full Redeployment

```bash
npm run deploy:dev
```

### Rollback to Previous Version

```bash
serverless rollback -t TIMESTAMP
```

## Removing the Deployment

To remove all AWS resources:

```bash
npm run remove
# or
serverless remove --stage dev
```

**Warning**: This will delete:
- All Lambda functions
- API Gateway
- DynamoDB table (and all data)
- CloudWatch logs
- IAM roles

## Troubleshooting Deployment Issues

### Issue: "Credentials not found"

**Solution:**
```bash
aws configure
# Re-enter your credentials
```

### Issue: "Insufficient permissions"

**Solution:**
- Check IAM user has required policies
- Verify AWS account has service limits available

### Issue: "Stack already exists"

**Solution:**
```bash
# Remove existing stack
serverless remove --stage dev
# Deploy again
npm run deploy:dev
```

### Issue: "Rate exceeded"

**Solution:**
- AWS API rate limits hit
- Wait a few minutes and try again
- Consider using `--concurrency` flag

### Issue: "DynamoDB table already exists"

**Solution:**
```bash
# Delete the table manually
aws dynamodb delete-table --table-name employee-management-api-employees-dev
# Deploy again
npm run deploy:dev
```

## Production Deployment Checklist

Before deploying to production:

- [ ] Update environment variables for production
- [ ] Enable MFA on Cognito User Pool
- [ ] Configure custom domain
- [ ] Set up CloudWatch alarms
- [ ] Enable API Gateway throttling
- [ ] Configure DynamoDB backups
- [ ] Set up WAF rules (if needed)
- [ ] Review IAM permissions
- [ ] Enable CloudTrail logging
- [ ] Configure CORS for production frontend domain
- [ ] Test all endpoints thoroughly
- [ ] Document API for frontend team
- [ ] Set up CI/CD pipeline (optional)

## Cost Monitoring

Set up billing alerts:

1. Go to **AWS Billing Console**
2. Create a billing alarm
3. Set threshold (e.g., $10/month)
4. Configure SNS notification

## Next Steps

1. **Integrate with Frontend**: Use the API endpoint URL in your frontend application
2. **Set Up CI/CD**: Automate deployments with GitHub Actions or AWS CodePipeline
3. **Monitor Performance**: Use CloudWatch dashboards
4. **Scale as Needed**: DynamoDB and Lambda auto-scale, but monitor costs

---

**Deployment Complete! 🎉**

Your Employee Management API is now live on AWS.
