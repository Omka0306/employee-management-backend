# Architecture Documentation

## System Architecture Overview

The Employee Management Backend is built using a serverless architecture on AWS, providing scalability, cost-efficiency, and high availability.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Application                     │
│                    (React/Angular/Vue/Mobile)                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS API Gateway                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Cognito Authorizer (JWT Token Validation)               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Invokes
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Lambda Functions                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Create     │  │   Get All    │  │   Get By ID  │         │
│  │   Employee   │  │   Employees  │  │   Employee   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Update     │  │   Delete     │  │   Search     │         │
│  │   Employee   │  │   Employee   │  │   Employees  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Read/Write
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS DynamoDB                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Employees Table                                          │  │
│  │  - Primary Key: employeeId (HASH)                        │  │
│  │  - GSI: EmailIndex (email)                               │  │
│  │  - GSI: CreatedAtIndex (createdAt)                       │  │
│  │  - Billing: Pay-per-request                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AWS Cognito User Pool                       │
│  - User Registration & Authentication                            │
│  - JWT Token Generation                                          │
│  - Email Verification                                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AWS CloudWatch                              │
│  - Lambda Logs                                                   │
│  - API Gateway Logs                                              │
│  - Metrics & Monitoring                                          │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. AWS API Gateway

**Purpose**: HTTP API endpoint for client applications

**Features**:
- RESTful API endpoints
- CORS configuration for frontend integration
- Cognito User Pool authorizer for protected routes
- Request/response transformation
- Throttling and rate limiting
- API key management (optional)

**Endpoints**:
```
POST   /auth/signup              - Public
POST   /auth/confirm             - Public
POST   /auth/signin              - Public
POST   /api/employees            - Protected
GET    /api/employees            - Protected
GET    /api/employees/{id}       - Protected
PUT    /api/employees/{id}       - Protected
DELETE /api/employees/{id}       - Protected
GET    /api/employees/search     - Protected
```

### 2. AWS Lambda Functions

**Purpose**: Serverless compute for business logic

**Runtime**: Node.js 18.x

**Configuration**:
- Memory: 256 MB
- Timeout: 30 seconds
- Concurrency: Auto-scaling
- Environment variables: DynamoDB table name, Cognito config

**Functions**:

#### createEmployee
- Validates employee data
- Checks email uniqueness
- Creates DynamoDB record
- Returns created employee

#### getAllEmployees
- Retrieves employees with pagination
- Supports filtering by status
- Returns employee list with pagination token

#### getEmployee
- Retrieves single employee by ID
- Returns 404 if not found

#### updateEmployee
- Validates update data
- Checks email uniqueness (if changed)
- Updates DynamoDB record
- Returns updated employee

#### deleteEmployee
- Soft or hard delete (configurable)
- Returns success confirmation

#### searchEmployees
- Full-text search on name and email
- Returns matching employees

### 3. AWS DynamoDB

**Purpose**: NoSQL database for employee data

**Configuration**:
- Billing Mode: Pay-per-request (on-demand)
- Point-in-time recovery: Enabled
- Encryption: AWS managed keys

**Table Schema**:

```javascript
{
  employeeId: String (HASH KEY),
  firstName: String,
  middleName: String,
  lastName: String,
  fullName: String,
  email: String,
  mobile: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  designation: String,
  department: String,
  dateOfJoining: String,
  salary: Number,
  status: String,
  createdAt: String,
  updatedAt: String,
  createdBy: String,
  updatedBy: String
}
```

**Global Secondary Indexes**:

1. **EmailIndex**
   - Partition Key: email
   - Purpose: Fast email lookups for uniqueness checks
   - Projection: ALL

2. **CreatedAtIndex**
   - Partition Key: createdAt
   - Purpose: Time-based queries
   - Projection: ALL

### 4. AWS Cognito User Pool

**Purpose**: User authentication and authorization

**Features**:
- Email-based authentication
- Password policies
- Email verification
- JWT token generation
- User management

**Token Types**:
- **ID Token**: User identity information
- **Access Token**: API authorization (used in this system)
- **Refresh Token**: Token renewal

**Token Expiration**: 1 hour (configurable)

### 5. AWS CloudWatch

**Purpose**: Monitoring and logging

**Features**:
- Lambda execution logs
- API Gateway access logs
- Custom metrics
- Alarms and notifications
- Performance monitoring

**Key Metrics**:
- Lambda invocations
- Lambda errors
- Lambda duration
- API Gateway 4xx/5xx errors
- DynamoDB read/write capacity

## Data Flow

### Authentication Flow

```
1. User signs up
   Frontend → API Gateway → Auth Route → Cognito
   ↓
   Cognito sends verification email

2. User confirms email
   Frontend → API Gateway → Auth Route → Cognito
   ↓
   User account activated

3. User signs in
   Frontend → API Gateway → Auth Route → Cognito
   ↓
   Cognito returns JWT tokens
   ↓
   Frontend stores access token

4. User makes API request
   Frontend (with token) → API Gateway
   ↓
   API Gateway validates token with Cognito
   ↓
   If valid, invokes Lambda
   ↓
   Lambda processes request
   ↓
   Returns response
```

### Employee CRUD Flow

```
1. Create Employee
   Frontend → API Gateway (validates token)
   ↓
   Lambda: createEmployee
   ↓
   Validate data
   ↓
   Check email uniqueness (DynamoDB EmailIndex)
   ↓
   Create record in DynamoDB
   ↓
   Return success response

2. Get All Employees
   Frontend → API Gateway (validates token)
   ↓
   Lambda: getAllEmployees
   ↓
   Scan DynamoDB (with filters)
   ↓
   Return employee list

3. Update Employee
   Frontend → API Gateway (validates token)
   ↓
   Lambda: updateEmployee
   ↓
   Get existing employee
   ↓
   Validate update data
   ↓
   Update DynamoDB record
   ↓
   Return updated employee

4. Delete Employee
   Frontend → API Gateway (validates token)
   ↓
   Lambda: deleteEmployee
   ↓
   Delete from DynamoDB
   ↓
   Return success response
```

## Security Architecture

### Authentication & Authorization

1. **Cognito User Pool**: Manages user identities
2. **JWT Tokens**: Stateless authentication
3. **API Gateway Authorizer**: Validates tokens before Lambda invocation
4. **IAM Roles**: Lambda execution roles with least privilege

### Data Security

1. **Encryption at Rest**: DynamoDB encryption with AWS managed keys
2. **Encryption in Transit**: HTTPS/TLS for all API calls
3. **Environment Variables**: Secure storage of sensitive configuration
4. **Secrets Management**: AWS Secrets Manager (optional for production)

### Network Security

1. **CORS**: Configured for specific frontend domains
2. **API Throttling**: Rate limiting to prevent abuse
3. **WAF** (optional): Web Application Firewall for advanced protection

## Scalability

### Auto-Scaling Components

1. **Lambda**: Automatic scaling based on request volume
2. **DynamoDB**: On-demand capacity scaling
3. **API Gateway**: Handles millions of requests

### Performance Optimization

1. **DynamoDB GSIs**: Fast queries on email and timestamps
2. **Lambda Cold Start**: Minimized with proper memory allocation
3. **Pagination**: Efficient data retrieval for large datasets
4. **Connection Reuse**: DynamoDB client reuse across Lambda invocations

## Cost Optimization

### Pay-per-use Model

1. **Lambda**: Pay only for execution time
2. **DynamoDB**: Pay-per-request (no idle costs)
3. **API Gateway**: Pay per API call

### Free Tier Benefits

1. **Lambda**: 1M free requests/month
2. **DynamoDB**: 25 GB storage free
3. **API Gateway**: 1M calls free (first 12 months)
4. **Cognito**: 50,000 MAUs free

### Cost Estimation

**Low Usage** (< 10,000 requests/month):
- Lambda: $0
- DynamoDB: $0-1
- API Gateway: $0
- **Total: ~$0-2/month**

**Medium Usage** (100,000 requests/month):
- Lambda: $2-3
- DynamoDB: $5-8
- API Gateway: $3-5
- **Total: ~$10-20/month**

## Disaster Recovery

### Backup Strategy

1. **DynamoDB Point-in-Time Recovery**: Enabled
2. **CloudFormation Stack**: Infrastructure as Code
3. **Version Control**: All code in Git

### Recovery Procedures

1. **Data Recovery**: Restore from DynamoDB backup
2. **Infrastructure Recovery**: Redeploy from CloudFormation
3. **Code Recovery**: Deploy from Git repository

## Monitoring & Observability

### Key Metrics

1. **Application Metrics**:
   - API response times
   - Error rates
   - Request volume

2. **Infrastructure Metrics**:
   - Lambda duration
   - DynamoDB throttling
   - API Gateway latency

3. **Business Metrics**:
   - Employee creation rate
   - Active users
   - Search queries

### Alerting

1. **Error Rate Alerts**: > 5% error rate
2. **Latency Alerts**: > 3 seconds response time
3. **Cost Alerts**: Unexpected cost increases

## Future Enhancements

### Potential Improvements

1. **Caching**: Add ElastiCache for frequently accessed data
2. **CDN**: CloudFront for global distribution
3. **Advanced Search**: Elasticsearch for full-text search
4. **File Storage**: S3 for employee documents/photos
5. **Notifications**: SNS/SES for email notifications
6. **Analytics**: Kinesis for real-time analytics
7. **Multi-Region**: Cross-region replication for HA

### Scalability Roadmap

1. **Phase 1**: Current serverless architecture (0-10K users)
2. **Phase 2**: Add caching and CDN (10K-100K users)
3. **Phase 3**: Multi-region deployment (100K+ users)

---

**Architecture Version**: 1.0  
**Last Updated**: 2025-09-30
