# Quick Start Guide

Get your Employee Management API up and running in 10 minutes!

## 🚀 Prerequisites

- Node.js 18+ installed
- AWS Account
- AWS CLI configured

## 📦 Installation (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Serverless Framework Globally

```bash
npm install -g serverless
```

### 3. Configure AWS Credentials

```bash
aws configure
```

Enter your AWS credentials when prompted.

## 🔐 AWS Cognito Setup (3 minutes)

### Create User Pool via AWS Console

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito)
2. Click **"Create user pool"**
3. **Sign-in options**: Select "Email"
4. **Password policy**: Use default
5. **MFA**: Skip for now (optional)
6. **User account recovery**: Email only
7. **Self-registration**: Enable
8. **Required attributes**: email, name
9. **Email delivery**: Use Cognito (for testing)
10. **User pool name**: `employee-management-users`
11. **App client name**: `employee-management-client`
12. **Generate client secret**: ✅ YES (Important!)
13. **Authentication flows**: Enable `USER_PASSWORD_AUTH`
14. Click **"Create user pool"**

### Save Your Credentials

After creation, note down:
- **User Pool ID**: `ap-south-1_XXXXXXXXX`
- **App Client ID**: From "App integration" tab
- **App Client Secret**: From "App integration" → "App clients" → View details

## ⚙️ Configuration (1 minute)

### Create `.env` file

```bash
cp .env.example .env
```

### Edit `.env` with your Cognito details

```env
AWS_REGION=ap-south-1
COGNITO_REGION=ap-south-1
COGNITO_USER_POOL_ID=ap-south-1_XXXXXXXXX
COGNITO_APP_CLIENT_ID=your-app-client-id
COGNITO_APP_CLIENT_SECRET=your-app-client-secret
COGNITO_TOKEN_USE=access
```

## 🚀 Deploy to AWS (1 minute)

```bash
npm run deploy:dev
```

**Save the API endpoint URL from the output!**

Example output:
```
endpoints:
  POST - https://abc123.execute-api.ap-south-1.amazonaws.com/dev/api/employees
  ...

Stack Outputs:
  ApiEndpoint: https://abc123.execute-api.ap-south-1.amazonaws.com/dev
```

## ✅ Test Your API

### 1. Sign Up a User

```bash
curl -X POST https://YOUR_API_ENDPOINT/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "name": "Test User"
  }'
```

### 2. Check Email for Confirmation Code

Check your email inbox for the verification code.

### 3. Confirm User

```bash
curl -X POST https://YOUR_API_ENDPOINT/dev/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "YOUR_CODE_FROM_EMAIL"
  }'
```

### 4. Sign In

```bash
curl -X POST https://YOUR_API_ENDPOINT/dev/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

**Save the `accessToken` from the response!**

### 5. Create an Employee

```bash
curl -X POST https://YOUR_API_ENDPOINT/dev/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "designation": "Software Engineer",
    "department": "Engineering",
    "salary": 75000
  }'
```

### 6. Get All Employees

```bash
curl -X GET https://YOUR_API_ENDPOINT/dev/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎉 Success!

Your Employee Management API is now live on AWS!

## 📱 Use with Postman

1. Import `api-collection.json` into Postman
2. Update the `baseUrl` variable with your API endpoint
3. Run the "Sign In" request to automatically save the access token
4. Test all endpoints!

## 🧪 Run Tests Locally

```bash
npm test
```

## 🔧 Local Development

Run the API locally without deploying:

```bash
npm run offline
```

API will be available at `http://localhost:3000`

## 📚 Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Review the [API Collection](./api-collection.json) for all endpoints

## 🆘 Common Issues

### "Credentials not found"
```bash
aws configure
# Re-enter your AWS credentials
```

### "User is not confirmed"
- Check your email for the confirmation code
- Run the confirm endpoint with the code

### "Invalid authentication token"
- Token expires after 1 hour
- Sign in again to get a new token

### "Email already exists" (Cognito)
- Use a different email
- Or delete the user from Cognito console and try again

## 💰 Cost Estimate

For development/testing with low usage:
- **~$0-2/month** for the first few thousand requests
- AWS Free Tier covers most development usage

## 🗑️ Clean Up

To remove all AWS resources:

```bash
npm run remove
```

---

**Need help?** Check the full documentation in [README.md](./README.md)
