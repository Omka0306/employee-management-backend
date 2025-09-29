# Setup Checklist

Complete this checklist to get your Employee Management Backend up and running.

## ✅ Pre-Deployment Checklist

### 1. Prerequisites
- [ ] Node.js 18+ installed
- [ ] AWS Account created
- [ ] AWS CLI installed
- [ ] Git installed (for version control)

### 2. Install Dependencies

```bash
# Install project dependencies
npm install

# Install Serverless Framework globally
npm install -g serverless
```

**Note**: If you encounter PowerShell execution policy errors on Windows, run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. AWS Configuration
- [ ] AWS credentials configured (`aws configure`)
- [ ] IAM user has required permissions:
  - [ ] AWSLambdaFullAccess
  - [ ] AmazonDynamoDBFullAccess
  - [ ] AmazonAPIGatewayAdministrator
  - [ ] CloudFormationFullAccess
  - [ ] IAMFullAccess
  - [ ] AmazonS3FullAccess

### 4. AWS Cognito Setup
- [ ] User Pool created
- [ ] Email sign-in enabled
- [ ] App Client created with secret
- [ ] `USER_PASSWORD_AUTH` flow enabled
- [ ] User Pool ID saved
- [ ] App Client ID saved
- [ ] App Client Secret saved

### 5. Environment Configuration
- [ ] `.env` file created from `.env.example`
- [ ] `AWS_REGION` set
- [ ] `COGNITO_REGION` set
- [ ] `COGNITO_USER_POOL_ID` set
- [ ] `COGNITO_APP_CLIENT_ID` set
- [ ] `COGNITO_APP_CLIENT_SECRET` set
- [ ] `COGNITO_TOKEN_USE` set to "access"

### 6. Verify Setup
- [ ] Run tests: `npm test`
- [ ] All tests passing
- [ ] No dependency errors

## 🚀 Deployment Checklist

### 1. Pre-Deployment
- [ ] All environment variables configured
- [ ] AWS credentials verified
- [ ] Tests passing
- [ ] Code committed to Git

### 2. Deploy to Development
```bash
npm run deploy:dev
```

- [ ] Deployment successful
- [ ] API Gateway endpoint URL saved
- [ ] DynamoDB table created
- [ ] Lambda functions deployed
- [ ] Cognito authorizer configured

### 3. Post-Deployment Verification

#### Test Authentication
- [ ] Sign up endpoint works
- [ ] Email verification received
- [ ] Confirm endpoint works
- [ ] Sign in endpoint works
- [ ] JWT tokens received

#### Test Employee API
- [ ] Create employee works
- [ ] Get all employees works
- [ ] Get employee by ID works
- [ ] Update employee works
- [ ] Delete employee works
- [ ] Search employees works

### 4. Postman Setup
- [ ] Import `api-collection.json`
- [ ] Update `baseUrl` variable with API endpoint
- [ ] Test sign-in (token auto-saves)
- [ ] Test all employee endpoints

## 📊 Monitoring Setup

### 1. CloudWatch
- [ ] Lambda logs accessible
- [ ] API Gateway logs enabled
- [ ] No error logs present

### 2. Billing Alerts
- [ ] Billing alarm created
- [ ] Threshold set (e.g., $10/month)
- [ ] Email notification configured

## 🔒 Security Checklist

### Development
- [ ] `.env` file in `.gitignore`
- [ ] No credentials in code
- [ ] AWS credentials secured
- [ ] Separate Cognito pools for dev/prod

### Production (When Ready)
- [ ] MFA enabled on Cognito
- [ ] Custom domain configured
- [ ] SSL certificate installed
- [ ] API throttling configured
- [ ] DynamoDB backups enabled
- [ ] CloudTrail logging enabled
- [ ] Secrets in AWS Secrets Manager

## 📝 Documentation Review

- [ ] README.md reviewed
- [ ] QUICKSTART.md followed
- [ ] API.md bookmarked
- [ ] DEPLOYMENT.md understood
- [ ] ARCHITECTURE.md reviewed

## 🧪 Testing Checklist

### Unit Tests
- [ ] Employee model tests passing
- [ ] All validation tests passing

### Integration Tests
- [ ] Lambda handler tests passing
- [ ] CRUD operations tested
- [ ] Error scenarios tested

### Manual Testing
- [ ] Sign up flow tested
- [ ] Sign in flow tested
- [ ] Create employee tested
- [ ] Update employee tested
- [ ] Delete employee tested
- [ ] Search tested
- [ ] Pagination tested

## 🎯 Frontend Integration Checklist

- [ ] API endpoint URL shared with frontend team
- [ ] API documentation shared (API.md)
- [ ] Postman collection shared
- [ ] CORS configured for frontend domain
- [ ] Authentication flow documented
- [ ] Error handling documented
- [ ] Example code provided

## 🔄 CI/CD Setup (Optional)

### GitHub Actions
- [ ] Repository connected to GitHub
- [ ] Secrets configured:
  - [ ] AWS_ACCESS_KEY_ID
  - [ ] AWS_SECRET_ACCESS_KEY
  - [ ] AWS_REGION
  - [ ] COGNITO_USER_POOL_ID
  - [ ] COGNITO_APP_CLIENT_ID
  - [ ] COGNITO_APP_CLIENT_SECRET
- [ ] Workflow file reviewed (`.github/workflows/deploy.yml`)
- [ ] Test workflow triggered
- [ ] Auto-deployment working

## 📈 Production Deployment Checklist

### Pre-Production
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Separate production Cognito pool created
- [ ] Production environment variables set
- [ ] Backup strategy defined
- [ ] Rollback plan documented

### Production Deployment
```bash
npm run deploy:prod
```

- [ ] Deployment successful
- [ ] Production API endpoint saved
- [ ] All endpoints tested in production
- [ ] Monitoring configured
- [ ] Alerts configured
- [ ] Team notified

### Post-Production
- [ ] Production smoke tests passed
- [ ] Monitoring dashboard created
- [ ] Documentation updated with prod URLs
- [ ] Support team briefed
- [ ] Incident response plan ready

## 🎉 Completion Checklist

- [ ] Development environment working
- [ ] All tests passing
- [ ] Documentation complete
- [ ] API tested with Postman
- [ ] Frontend team has access
- [ ] Monitoring configured
- [ ] Security measures in place
- [ ] Ready for production (when needed)

## 📞 Support Resources

### Documentation
- **Quick Start**: QUICKSTART.md
- **Full Docs**: README.md
- **API Reference**: API.md
- **Deployment**: DEPLOYMENT.md
- **Architecture**: ARCHITECTURE.md

### Troubleshooting
1. Check CloudWatch logs
2. Verify AWS credentials
3. Review Cognito configuration
4. Test with Postman
5. Check documentation

### Common Commands
```bash
# Install dependencies
npm install

# Run tests
npm test

# Deploy to dev
npm run deploy:dev

# View logs
serverless logs -f createEmployee -t

# Run locally
npm run offline

# Remove deployment
npm run remove
```

## ✨ Success Criteria

Your setup is complete when:
- ✅ All dependencies installed
- ✅ AWS configured correctly
- ✅ Cognito User Pool created
- ✅ Environment variables set
- ✅ Tests passing
- ✅ Deployed to AWS
- ✅ API endpoints working
- ✅ Authentication working
- ✅ CRUD operations working
- ✅ Documentation reviewed

---

**Ready to Deploy?** Follow QUICKSTART.md for a 10-minute setup!

**Need Help?** Check README.md for detailed documentation.

**Questions?** Review API.md for complete API reference.

---

**Last Updated**: 2025-09-30  
**Version**: 1.0
