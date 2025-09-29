# API Documentation

Complete API reference for the Employee Management Backend.

## Base URL

```
https://{api-gateway-id}.execute-api.{region}.amazonaws.com/{stage}
```

Example:
```
https://abc123xyz.execute-api.ap-south-1.amazonaws.com/dev
```

## Authentication

All employee endpoints require authentication using AWS Cognito JWT tokens.

### Headers

```http
Authorization: Bearer {accessToken}
Content-Type: application/json
```

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Error detail 1", "Error detail 2"]
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Authentication Endpoints

### 1. Sign Up

Create a new user account.

**Endpoint**: `POST /auth/signup`

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Validation Rules**:
- Email: Valid email format, required
- Password: Minimum 8 characters, must include uppercase, lowercase, number, and special character
- Name: Optional

**Success Response** (201):
```json
{
  "message": "User registered successfully. Check your email for confirmation code.",
  "userSub": "uuid-here",
  "userConfirmed": false
}
```

**Error Response** (400):
```json
{
  "message": "UsernameExistsException",
  "code": "UsernameExistsException"
}
```

**Example**:
```bash
curl -X POST https://your-api.com/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@123456",
    "name": "John Doe"
  }'
```

---

### 2. Confirm Sign Up

Confirm user registration with email verification code.

**Endpoint**: `POST /auth/confirm`

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Success Response** (200):
```json
{
  "message": "User confirmed successfully. You can now sign in."
}
```

**Error Response** (400):
```json
{
  "message": "CodeMismatchException",
  "code": "CodeMismatchException"
}
```

**Example**:
```bash
curl -X POST https://your-api.com/dev/auth/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "123456"
  }'
```

---

### 3. Sign In

Authenticate user and receive JWT tokens.

**Endpoint**: `POST /auth/signin`

**Authentication**: None (Public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response** (200):
```json
{
  "message": "Sign-in successful",
  "idToken": "eyJraWQiOiI...",
  "accessToken": "eyJraWQiOiI...",
  "refreshToken": "eyJjdHkiOiI...",
  "expiresIn": 3600
}
```

**Token Details**:
- **idToken**: Contains user identity claims
- **accessToken**: Use this for API authorization
- **refreshToken**: Use to get new tokens when expired
- **expiresIn**: Token expiration time in seconds (3600 = 1 hour)

**Error Response** (401):
```json
{
  "message": "Incorrect username or password.",
  "code": "NotAuthorizedException"
}
```

**Example**:
```bash
curl -X POST https://your-api.com/dev/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Test@123456"
  }'
```

---

## Employee Endpoints

All employee endpoints require authentication.

### 1. Create Employee

Create a new employee record.

**Endpoint**: `POST /api/employees`

**Authentication**: Required

**Request Body**:
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "9876543210",
  "address": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "designation": "Software Engineer",
  "department": "Engineering",
  "dateOfJoining": "2025-01-15",
  "salary": 75000,
  "status": "active"
}
```

**Required Fields**:
- firstName
- lastName
- email (must be unique)
- mobile (10 digits)
- designation

**Optional Fields**:
- middleName
- address (object)
- department
- dateOfJoining (defaults to current date)
- salary (defaults to 0)
- status (defaults to "active")

**Validation Rules**:
- Email: Valid format, unique across all employees
- Mobile: Exactly 10 digits
- Status: Must be one of: "active", "inactive", "terminated"

**Success Response** (201):
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "uuid-here",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "fullName": "John Michael Doe",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "address": { ... },
    "designation": "Software Engineer",
    "department": "Engineering",
    "dateOfJoining": "2025-01-15",
    "salary": 75000,
    "status": "active",
    "createdAt": "2025-09-30T01:30:00.000Z",
    "updatedAt": "2025-09-30T01:30:00.000Z"
  }
}
```

**Error Response** (400 - Validation):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "First name is required",
    "Invalid email format"
  ]
}
```

**Error Response** (409 - Duplicate):
```json
{
  "success": false,
  "message": "Employee with this email already exists"
}
```

**Example**:
```bash
curl -X POST https://your-api.com/dev/api/employees \
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

---

### 2. Get All Employees

Retrieve all employees with optional filtering and pagination.

**Endpoint**: `GET /api/employees`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of employees to return (default: 50, max: 100) |
| status | string | No | Filter by status: "active", "inactive", "terminated" |
| lastKey | string | No | Pagination token from previous response |

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [
      {
        "employeeId": "uuid-1",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        ...
      },
      {
        "employeeId": "uuid-2",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane.smith@example.com",
        ...
      }
    ],
    "count": 2,
    "lastKey": "encoded-pagination-token"
  }
}
```

**Pagination**:
- If `lastKey` is present in response, there are more results
- Pass `lastKey` in next request to get next page
- If `lastKey` is null, you've reached the end

**Examples**:

Get first 50 employees:
```bash
curl -X GET https://your-api.com/dev/api/employees \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Get active employees only:
```bash
curl -X GET "https://your-api.com/dev/api/employees?status=active" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Get next page:
```bash
curl -X GET "https://your-api.com/dev/api/employees?limit=50&lastKey=ENCODED_KEY" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 3. Get Employee by ID

Retrieve a specific employee by their ID.

**Endpoint**: `GET /api/employees/{id}`

**Authentication**: Required

**Path Parameters**:
- `id`: Employee ID (UUID)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "employeeId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "address": { ... },
    "designation": "Software Engineer",
    "department": "Engineering",
    "dateOfJoining": "2025-01-15",
    "salary": 75000,
    "status": "active",
    "createdAt": "2025-09-30T01:30:00.000Z",
    "updatedAt": "2025-09-30T01:30:00.000Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**Example**:
```bash
curl -X GET https://your-api.com/dev/api/employees/uuid-here \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 4. Update Employee

Update an existing employee's information.

**Endpoint**: `PUT /api/employees/{id}`

**Authentication**: Required

**Path Parameters**:
- `id`: Employee ID (UUID)

**Request Body** (partial update supported):
```json
{
  "designation": "Senior Software Engineer",
  "salary": 95000,
  "department": "Engineering",
  "status": "active"
}
```

**Notes**:
- Only include fields you want to update
- Cannot update `employeeId`, `createdAt`, or `createdBy`
- Email uniqueness is validated if email is being changed
- `updatedAt` is automatically updated

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employeeId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    "designation": "Senior Software Engineer",
    "salary": 95000,
    ...
    "updatedAt": "2025-09-30T02:00:00.000Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Invalid email format"]
}
```

**Error Response** (409):
```json
{
  "success": false,
  "message": "Employee with this email already exists"
}
```

**Example**:
```bash
curl -X PUT https://your-api.com/dev/api/employees/uuid-here \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "designation": "Senior Software Engineer",
    "salary": 95000
  }'
```

---

### 5. Delete Employee

Delete an employee record.

**Endpoint**: `DELETE /api/employees/{id}`

**Authentication**: Required

**Path Parameters**:
- `id`: Employee ID (UUID)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": {
    "employeeId": "uuid-here"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**Example**:
```bash
curl -X DELETE https://your-api.com/dev/api/employees/uuid-here \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 6. Search Employees

Search employees by name or email.

**Endpoint**: `GET /api/employees/search`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | Yes | Search term (searches in name and email) |
| search | string | Yes | Alternative to 'q' parameter |

**Note**: Use either `q` or `search` parameter (both work the same way)

**Success Response** (200):
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "employees": [
      {
        "employeeId": "uuid-1",
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        ...
      }
    ],
    "count": 1,
    "searchTerm": "john"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Search term is required (use ?q=searchTerm or ?search=searchTerm)"
}
```

**Search Behavior**:
- Case-insensitive
- Searches in: firstName, middleName, lastName, fullName, email
- Partial matches supported
- Returns all matching employees

**Examples**:

Search by name:
```bash
curl -X GET "https://your-api.com/dev/api/employees/search?q=john" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Search by email:
```bash
curl -X GET "https://your-api.com/dev/api/employees/search?search=example.com" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Error Handling

### Common Error Scenarios

#### 1. Unauthorized (401)

**Cause**: Missing or invalid authentication token

**Response**:
```json
{
  "message": "Unauthorized"
}
```

**Solution**: 
- Ensure you're including the Authorization header
- Check that the token hasn't expired (tokens expire after 1 hour)
- Sign in again to get a new token

#### 2. Validation Error (400)

**Cause**: Invalid input data

**Response**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "First name is required",
    "Invalid email format",
    "Mobile number must be 10 digits"
  ]
}
```

**Solution**: Fix the validation errors listed in the response

#### 3. Resource Not Found (404)

**Cause**: Employee ID doesn't exist

**Response**:
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**Solution**: Verify the employee ID is correct

#### 4. Duplicate Resource (409)

**Cause**: Email already exists

**Response**:
```json
{
  "success": false,
  "message": "Employee with this email already exists"
}
```

**Solution**: Use a different email address

---

## Rate Limiting

API Gateway applies default rate limiting:
- **Burst**: 5,000 requests
- **Steady**: 10,000 requests per second

If you exceed these limits, you'll receive a `429 Too Many Requests` response.

---

## Best Practices

### 1. Token Management

- Store tokens securely (never in localStorage for sensitive apps)
- Implement token refresh logic
- Handle 401 errors by redirecting to login

### 2. Error Handling

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    // Handle error
    console.error(data.message, data.errors);
  }
  
  return data;
} catch (error) {
  console.error('Network error:', error);
}
```

### 3. Pagination

```javascript
let allEmployees = [];
let lastKey = null;

do {
  const url = lastKey 
    ? `/api/employees?limit=50&lastKey=${lastKey}`
    : `/api/employees?limit=50`;
    
  const response = await fetch(url, { headers });
  const data = await response.json();
  
  allEmployees = [...allEmployees, ...data.data.employees];
  lastKey = data.data.lastKey;
} while (lastKey);
```

### 4. Search Debouncing

Implement debouncing for search to avoid excessive API calls:

```javascript
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const searchEmployees = debounce(async (term) => {
  const response = await fetch(`/api/employees/search?q=${term}`, { headers });
  const data = await response.json();
  // Update UI
}, 300);
```

---

## Postman Collection

Import the provided `api-collection.json` file into Postman for easy testing.

**Steps**:
1. Open Postman
2. Click Import
3. Select `api-collection.json`
4. Update collection variables:
   - `baseUrl`: Your API Gateway URL
   - `accessToken`: Will be auto-filled after sign-in

---

## Support

For API issues or questions:
- Check the [README.md](./README.md) for general documentation
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Create an issue in the repository

---

**API Version**: 1.0  
**Last Updated**: 2025-09-30
