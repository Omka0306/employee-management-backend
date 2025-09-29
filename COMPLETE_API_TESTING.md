# Complete API Testing Guide - All Details

## 🔧 Setup

### Prerequisites:
1. **Start Express Server** (for auth endpoints):
   ```bash
   npm start
   ```
   Server will run on: `http://localhost:3000`

2. **AWS Lambda** (already deployed):
   Base URL: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev`

---

## 📋 Complete API Testing Details

---

## 1️⃣ SIGN UP

### Request Details:
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/signup`
- **Headers**:
  ```
  Content-Type: application/json
  ```

### Request Body:
```json
{
  "email": "testuser@example.com",
  "password": "Test@123456",
  "name": "Test User"
}
```

### Success Response (201):
```json
{
  "message": "User registered successfully. Check your email for confirmation code.",
  "userSub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "userConfirmed": false
}
```

### Error Responses:

**400 - Missing Fields:**
```json
{
  "message": "Email and password are required"
}
```

**400 - User Already Exists:**
```json
{
  "message": "An account with the given email already exists.",
  "code": "UsernameExistsException"
}
```

**400 - Weak Password:**
```json
{
  "message": "Password did not conform with policy: Password must have uppercase characters",
  "code": "InvalidPasswordException"
}
```

### Notes:
- Password must be at least 8 characters
- Must include: uppercase, lowercase, number, special character
- Check your email for verification code (valid for 24 hours)

---

## 2️⃣ CONFIRM SIGN UP

### Request Details:
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/confirm`
- **Headers**:
  ```
  Content-Type: application/json
  ```

### Request Body:
```json
{
  "email": "testuser@example.com",
  "code": "123456"
}
```
*Replace `123456` with the actual code from your email*

### Success Response (200):
```json
{
  "message": "User confirmed successfully. You can now sign in."
}
```

### Error Responses:

**400 - Invalid Code:**
```json
{
  "message": "Invalid verification code provided, please try again.",
  "code": "CodeMismatchException"
}
```

**400 - Expired Code:**
```json
{
  "message": "Invalid code provided, please request a code again.",
  "code": "ExpiredCodeException"
}
```

**400 - Missing Fields:**
```json
{
  "message": "Email and confirmation code are required"
}
```

---

## 3️⃣ SIGN IN

### Request Details:
- **Method**: `POST`
- **URL**: `http://localhost:3000/auth/signin`
- **Headers**:
  ```
  Content-Type: application/json
  ```

### Request Body:
```json
{
  "email": "testuser@example.com",
  "password": "Test@123456"
}
```

### Success Response (200):
```json
{
  "message": "Sign-in successful",
  "idToken": "eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoLTEuYW1hem9uYXdzLmNvbVwvYXAtc291dGgtMV9xU3dVMEkwSm0iLCJjb2duaXRvOnVzZXJuYW1lIjoidGVzdHVzZXJAZXhhbXBsZS5jb20iLCJvcmlnaW5fanRpIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwiYXVkIjoiNjlyOWVxNTY0YmExaWYxbmViMzY5MGMxdmIiLCJldmVudF9pZCI6ImExYjJjM2Q0LWU1ZjYtNzg5MC1hYmNkLWVmMTIzNDU2Nzg5MCIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNzI3NjM1MjAwLCJleHAiOjE3Mjc2Mzg4MDAsImlhdCI6MTcyNzYzNTIwMCwianRpIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0dXNlckBleGFtcGxlLmNvbSJ9.signature",
  "accessToken": "eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJhMWIyYzNkNC1lNWY2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xX3FTd1UwSTBKbSIsImNsaWVudF9pZCI6IjY5cjllcTU2NGJhMWlmMW5lYjM2OTBjMXZiIiwib3JpZ2luX2p0aSI6ImExYjJjM2Q0LWU1ZjYtNzg5MC1hYmNkLWVmMTIzNDU2Nzg5MCIsImV2ZW50X2lkIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTcyNzYzNTIwMCwiZXhwIjoxNzI3NjM4ODAwLCJpYXQiOjE3Mjc2MzUyMDAsImp0aSI6ImExYjJjM2Q0LWU1ZjYtNzg5MC1hYmNkLWVmMTIzNDU2Nzg5MCIsInVzZXJuYW1lIjoidGVzdHVzZXJAZXhhbXBsZS5jb20ifQ.signature",
  "refreshToken": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.encrypted_content.signature",
  "expiresIn": 3600
}
```

### Error Responses:

**401 - Wrong Password:**
```json
{
  "message": "Incorrect username or password.",
  "code": "NotAuthorizedException"
}
```

**400 - User Not Confirmed:**
```json
{
  "message": "User is not confirmed.",
  "code": "UserNotConfirmedException"
}
```

**400 - User Not Found:**
```json
{
  "message": "User does not exist.",
  "code": "UserNotFoundException"
}
```

### Notes:
- **Save the `accessToken`** - you'll need it for all employee endpoints
- Token expires in 3600 seconds (1 hour)
- Use `refreshToken` to get new tokens without signing in again

---

## 4️⃣ CREATE EMPLOYEE

### Request Details:
- **Method**: `POST`
- **URL**: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees`
- **Headers**:
  ```
  Authorization: Bearer eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0...
  Content-Type: application/json
  ```
  *Replace with your actual accessToken from sign-in*

### Request Body (Full):
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

### Request Body (Minimal - Required Fields Only):
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "mobile": "9876543211",
  "designation": "Manager"
}
```

### Success Response (201):
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employeeId": "EMP001001",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "fullName": "John Michael Doe",
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
    "status": "active",
    "createdAt": "2025-09-30T02:00:00.000Z",
    "updatedAt": "2025-09-30T02:00:00.000Z"
  }
}
```

### Error Responses:

**401 - Unauthorized (Missing/Invalid Token):**
```json
{
  "message": "Unauthorized"
}
```

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "First name is required",
    "Last name is required",
    "Email is required",
    "Invalid email format",
    "Mobile number is required",
    "Invalid mobile number format (should be 10 digits)",
    "Designation is required"
  ]
}
```

**409 - Duplicate Email:**
```json
{
  "success": false,
  "message": "Employee with this email already exists"
}
```

**400 - Invalid JSON:**
```json
{
  "success": false,
  "message": "Invalid JSON in request body"
}
```

### Field Validations:
- **firstName**: Required, string
- **middleName**: Optional, string
- **lastName**: Required, string
- **email**: Required, valid email format, unique
- **mobile**: Required, exactly 10 digits
- **designation**: Required, string
- **department**: Optional, string
- **address**: Optional, object with street, city, state, zipCode, country
- **dateOfJoining**: Optional, date string (defaults to current date)
- **salary**: Optional, number (defaults to 0)
- **status**: Optional, must be "active", "inactive", or "terminated" (defaults to "active")

### Notes:
- **Save the `employeeId`** from response for update/delete operations
- Employee ID format: `EMP001001`, `EMP001002`, etc. (auto-generated, sequential)
- Email must be unique across all employees
- Mobile number must be exactly 10 digits (no spaces or dashes)

---

## 5️⃣ GET ALL EMPLOYEES

### Request Details:
- **Method**: `GET`
- **URL**: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees`
- **Headers**:
  ```
  Authorization: Bearer eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0...
  ```

### Query Parameters (Optional):
```
?limit=50                    # Number of employees to return (default: 50, max: 100)
?status=active               # Filter by status (active/inactive/terminated)
?lastKey=encodedPaginationKey  # For pagination (from previous response)
```

### Example URLs:
```
# Get first 50 employees
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees

# Get only active employees
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees?status=active

# Get 10 employees
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees?limit=10

# Get next page (use lastKey from previous response)
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees?limit=50&lastKey=eyJlbXBsb3llZUlkIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIn0%3D
```

### Success Response (200):
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [
      {
        "employeeId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "firstName": "John",
        "middleName": "Michael",
        "lastName": "Doe",
        "fullName": "John Michael Doe",
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
        "status": "active",
        "createdAt": "2025-09-30T02:00:00.000Z",
        "updatedAt": "2025-09-30T02:00:00.000Z"
      },
      {
        "employeeId": "b2c3d4e5-f6a7-8901-bcde-f23456789012",
        "firstName": "Jane",
        "middleName": "",
        "lastName": "Smith",
        "fullName": "Jane Smith",
        "email": "jane.smith@example.com",
        "mobile": "9876543211",
        "address": {},
        "designation": "Manager",
        "department": "Management",
        "dateOfJoining": "2025-01-10",
        "salary": 95000,
        "status": "active",
        "createdAt": "2025-09-30T01:55:00.000Z",
        "updatedAt": "2025-09-30T01:55:00.000Z"
      }
    ],
    "count": 2,
    "lastKey": null
  }
}
```

### Success Response (Empty):
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [],
    "count": 0,
    "lastKey": null
  }
}
```

### Error Responses:

**401 - Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "message": "Failed to retrieve employees",
  "errors": ["DynamoDB error message"]
}
```

### Notes:
- `lastKey` is `null` when there are no more results
- If `lastKey` is present, there are more employees to fetch
- Use `lastKey` in next request for pagination

---

## 6️⃣ GET EMPLOYEE BY ID

### Request Details:
- **Method**: `GET`
- **URL**: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{employeeId}`
- **Headers**:
  ```
  Authorization: Bearer eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0...
  ```

### Example URL:
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Success Response (200):
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "employeeId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "fullName": "John Michael Doe",
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
    "status": "active",
    "createdAt": "2025-09-30T02:00:00.000Z",
    "updatedAt": "2025-09-30T02:00:00.000Z"
  }
}
```

### Error Responses:

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**400 - Missing ID:**
```json
{
  "success": false,
  "message": "Employee ID is required"
}
```

**401 - Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

---

## 7️⃣ UPDATE EMPLOYEE

### Request Details:
- **Method**: `PUT`
- **URL**: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{employeeId}`
- **Headers**:
  ```
  Authorization: Bearer eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0...
  Content-Type: application/json
  ```

### Example URL:
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Request Body (Partial Update - Only Fields to Change):
```json
{
  "designation": "Senior Software Engineer",
  "salary": 95000,
  "department": "Engineering"
}
```

### Request Body (Full Update Example):
```json
{
  "firstName": "John",
  "middleName": "Michael",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "9876543210",
  "address": {
    "street": "456 New Street",
    "city": "Bangalore",
    "state": "Karnataka",
    "zipCode": "560001",
    "country": "India"
  },
  "designation": "Senior Software Engineer",
  "department": "Engineering",
  "dateOfJoining": "2025-01-15",
  "salary": 95000,
  "status": "active"
}
```

### Success Response (200):
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employeeId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "firstName": "John",
    "middleName": "Michael",
    "lastName": "Doe",
    "fullName": "John Michael Doe",
    "email": "john.doe@example.com",
    "mobile": "9876543210",
    "address": {
      "street": "456 New Street",
      "city": "Bangalore",
      "state": "Karnataka",
      "zipCode": "560001",
      "country": "India"
    },
    "designation": "Senior Software Engineer",
    "department": "Engineering",
    "dateOfJoining": "2025-01-15",
    "salary": 95000,
    "status": "active",
    "createdAt": "2025-09-30T02:00:00.000Z",
    "updatedAt": "2025-09-30T02:15:00.000Z"
  }
}
```

### Error Responses:

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**400 - Validation Error:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Invalid email format",
    "Invalid mobile number format (should be 10 digits)"
  ]
}
```

**409 - Duplicate Email:**
```json
{
  "success": false,
  "message": "Employee with this email already exists"
}
```

**401 - Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

### Notes:
- You can update any field except `employeeId`, `createdAt`, `createdBy`
- Only include fields you want to update (partial update supported)
- `updatedAt` is automatically updated
- Email uniqueness is validated if email is being changed

---

## 8️⃣ DELETE EMPLOYEE

### Request Details:
- **Method**: `DELETE`
- **URL**: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{employeeId}`
- **Headers**:
  ```
  Authorization: Bearer eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0...
  ```

### Example URL:
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### No Request Body Required

### Success Response (200):
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": {
    "employeeId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

### Error Responses:

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Employee not found"
}
```

**400 - Missing ID:**
```json
{
  "success": false,
  "message": "Employee ID is required"
}
```

**401 - Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

### Notes:
- This is a **hard delete** - employee is permanently removed from database
- Cannot be undone
- Verify employee ID before deleting

---

## 9️⃣ SEARCH EMPLOYEES

### Request Details:
- **Method**: `GET`
- **URL**: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/search?q={searchTerm}`
- **Headers**:
  ```
  Authorization: Bearer eyJraWQiOiJxVGhWXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRXC9cL0pqYnBcL0VRPSIsImFsZyI6IlJTMjU2In0...
  ```

### Query Parameters:
```
q=searchTerm          # Search term (required)
# OR
search=searchTerm     # Alternative parameter name
```

### Example URLs:
```
# Search by first name
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/search?q=john

# Search by email
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/search?q=example.com

# Search by last name
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/search?search=smith
```

### Success Response (200):
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "employees": [
      {
        "employeeId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "firstName": "John",
        "middleName": "Michael",
        "lastName": "Doe",
        "fullName": "John Michael Doe",
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
        "status": "active",
        "createdAt": "2025-09-30T02:00:00.000Z",
        "updatedAt": "2025-09-30T02:00:00.000Z"
      }
    ],
    "count": 1,
    "searchTerm": "john"
  }
}
```

### Success Response (No Results):
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "employees": [],
    "count": 0,
    "searchTerm": "xyz"
  }
}
```

### Error Responses:

**400 - Missing Search Term:**
```json
{
  "success": false,
  "message": "Search term is required (use ?q=searchTerm or ?search=searchTerm)"
}
```

**401 - Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```

### Search Behavior:
- **Case-insensitive** search
- Searches in: `fullName` and `email` fields
- **Partial matches** supported (e.g., "joh" will match "John")
- Returns all matching employees (no pagination)

### Notes:
- Search term must be at least 1 character
- Use `q` or `search` parameter (both work the same)
- Empty search term returns error

---

## 📊 Complete Testing Workflow

### Step-by-Step Testing Order:

1. **Start Express Server**
   ```bash
   npm start
   ```

2. **Authentication Flow:**
   - ✅ Sign Up → Get confirmation code via email
   - ✅ Confirm Sign Up → Verify account
   - ✅ Sign In → Get access token (save it!)

3. **Employee Operations:**
   - ✅ Create Employee #1 (John Doe)
   - ✅ Create Employee #2 (Jane Smith)
   - ✅ Get All Employees (should see 2 employees)
   - ✅ Get Employee by ID (John's ID)
   - ✅ Update Employee (Promote John to Senior)
   - ✅ Search Employees (search "john")
   - ✅ Search Employees (search "example.com")
   - ✅ Delete Employee (Delete Jane)
   - ✅ Get All Employees (should see only John)

---

## 🔑 Important Notes

### Access Token:
- **Expires in 1 hour** (3600 seconds)
- When expired, you'll get `401 Unauthorized`
- Solution: Run **Sign In** again to get new token

### Employee ID:
- **Auto-generated UUID** when creating employee
- **Save it** from create response for update/delete operations
- Format: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### Email Uniqueness:
- Each employee must have **unique email**
- Duplicate email returns `409 Conflict` error
- Use different emails for testing multiple employees

### Mobile Number:
- Must be **exactly 10 digits**
- No spaces, dashes, or special characters
- Examples: `9876543210`, `1234567890`

---

## 🎯 Quick Copy-Paste Examples

### Complete Test Sequence (PowerShell/CMD):

```powershell
# 1. Sign Up
curl -X POST http://localhost:3000/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test@123456\",\"name\":\"Test User\"}"

# 2. Confirm (replace CODE with actual code from email)
curl -X POST http://localhost:3000/auth/confirm -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"code\":\"CODE\"}"

# 3. Sign In
curl -X POST http://localhost:3000/auth/signin -H "Content-Type: application/json" -d "{\"email\":\"test@example.com\",\"password\":\"Test@123456\"}"

# Save the accessToken from response!

# 4. Create Employee (replace YOUR_TOKEN)
curl -X POST https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"mobile\":\"9876543210\",\"designation\":\"Software Engineer\"}"

# Save the employeeId from response!

# 5. Get All Employees
curl -X GET https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees -H "Authorization: Bearer YOUR_TOKEN"

# 6. Get Employee by ID (replace EMPLOYEE_ID)
curl -X GET https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/EMPLOYEE_ID -H "Authorization: Bearer YOUR_TOKEN"

# 7. Update Employee (replace EMPLOYEE_ID)
curl -X PUT https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/EMPLOYEE_ID -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"designation\":\"Senior Software Engineer\",\"salary\":95000}"

# 8. Search Employees
curl -X GET "https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/search?q=john" -H "Authorization: Bearer YOUR_TOKEN"

# 9. Delete Employee (replace EMPLOYEE_ID)
curl -X DELETE https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/EMPLOYEE_ID -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📱 Import to Postman

1. **Import Collection:**
   - Open Postman
   - Click **Import**
   - Select `api-collection.json`

2. **Collection Variables (Auto-configured):**
   - `authBaseUrl`: `http://localhost:3000`
   - `baseUrl`: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev`
   - `accessToken`: Auto-saved after sign-in
   - `employeeId`: Auto-saved after create employee

3. **Test in Order:**
   - Authentication → Sign Up
   - Authentication → Confirm Sign Up
   - Authentication → Sign In (token auto-saved!)
   - Employees → Create Employee (ID auto-saved!)
   - Employees → Get All Employees
   - Employees → Get Employee by ID
   - Employees → Update Employee
   - Employees → Search Employees
   - Employees → Delete Employee

---

**🎉 You now have complete details for testing all APIs in Postman!**
