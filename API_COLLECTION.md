# API Collection

Complete API reference for Employee Management Backend.

## Base URL

```
https://{api-id}.execute-api.{region}.amazonaws.com/{stage}
```

## Authentication

Protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {accessToken}
```

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Error details"]
}
```

---

## Authentication Endpoints

### Sign Up
```http
POST /auth/signup

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Check your email for confirmation code.",
  "userSub": "uuid",
  "userConfirmed": false
}
```

### Confirm Sign Up
```http
POST /auth/confirm

{
  "email": "user@example.com",
  "code": "123456"
}
```

### Sign In
```http
POST /auth/signin

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Sign-in successful",
  "idToken": "eyJ...",
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 3600
}
```

---

## Company Endpoints

### Create Company (Admin Only)
```http
POST /api/companies
Authorization: Bearer {token}

{
  "companyName": "Tech Corp",
  "companyCode": "TECH",
  "industry": "Technology",
  "contactEmail": "info@techcorp.com",
  "contactPhone": "+1-555-0100",
  "address": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94105",
    "country": "USA"
  },
  "website": "https://techcorp.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "companyId": "COMP00101",
    "companyName": "Tech Corp",
    "companyCode": "TECH",
    ...
  }
}
```

### Get All Companies (Admin Only)
```http
GET /api/companies?limit=50&status=active
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": {
    "companies": [...],
    "count": 10,
    "lastKey": null
  }
}
```

### Get Company by ID
```http
GET /api/companies/{companyId}
Authorization: Bearer {token}
```

### Update Company (Admin Only)
```http
PUT /api/companies/{companyId}
Authorization: Bearer {token}

{
  "companyName": "Tech Corp LLC",
  "website": "https://newsite.com"
}
```

### Delete Company (Admin Only)
```http
DELETE /api/companies/{companyId}
Authorization: Bearer {token}
```

---

## Employee Endpoints

### Create Employee
```http
POST /api/employees
Authorization: Bearer {token}

{
  "companyId": "COMP00101",
  "role": "employee",
  "firstName": "Jane",
  "middleName": "M",
  "lastName": "Smith",
  "email": "jane.smith@techcorp.com",
  "mobile": "9876543210",
  "address": {
    "street": "456 Oak Ave",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  },
  "designation": "Software Engineer",
  "department": "Engineering",
  "dateOfJoining": "2025-01-15",
  "salary": 85000,
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "employee": {
      "employeeId": "EMP001001",
      "companyId": "COMP00101",
      "role": "employee",
      "cognitoUserId": "abc-123",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@techcorp.com",
      ...
    },
    "temporaryPassword": "TempPass123!",
    "message": "Employee created successfully. User must change password on first login."
  }
}
```

**Notes:**
- Admin can create employees in any company
- Manager can create employees in their company only (companyId auto-set)
- Manager cannot create admin/manager roles
- Cognito user created automatically
- Temporary password must be changed on first login

### Get All Employees
```http
GET /api/employees?limit=50&status=active
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `status` (optional): Filter by status (active/inactive/terminated)
- `lastKey` (optional): For pagination

**Response (200):**
```json
{
  "success": true,
  "message": "Employees retrieved successfully",
  "data": {
    "employees": [...],
    "count": 25,
    "lastKey": "encoded-key"
  }
}
```

**Access Control:**
- Admin: All employees across all companies
- Manager: Employees in their company
- Employee: Employees in their company (limited data for others)

### Get Employee by ID
```http
GET /api/employees/{employeeId}
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "employeeId": "EMP001001",
    "companyId": "COMP00101",
    "role": "employee",
    ...
  }
}
```

### Update Employee
```http
PUT /api/employees/{employeeId}
Authorization: Bearer {token}

{
  "designation": "Senior Software Engineer",
  "salary": 95000,
  "department": "Engineering"
}
```

**Access Control:**
- Admin: Can update any field
- Manager: Can update employees in their company (not admin/manager roles)
- Employee: Can only update own profile (mobile, address, middleName)

**Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": { ... }
}
```

### Delete Employee
```http
DELETE /api/employees/{employeeId}
Authorization: Bearer {token}
```

**Access Control:**
- Admin: Can delete any employee
- Manager: Can delete employees in their company (employee role only)
- Employee: Cannot delete

**Response (200):**
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": {
    "employeeId": "EMP001001"
  }
}
```

### Search Employees
```http
GET /api/employees/search?q=john
Authorization: Bearer {token}
```

**Query Parameters:**
- `q` or `search`: Search term (searches name and email)

**Response (200):**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "employees": [...],
    "count": 5,
    "searchTerm": "john"
  }
}
```

**Access Control:**
- Results filtered by company (except admin)
- Data filtered by role

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Role-Based Access Summary

### Admin
- Full access to all endpoints
- Can manage companies
- Can create/update/delete employees in any company
- Can assign any role

### Manager
- Can view their company
- Can create/update/delete employees in their company
- Can only create employee role (not admin/manager)
- Cannot change roles

### Employee
- Can view their own profile (full)
- Can update own profile (mobile, address, middleName only)
- Can view colleagues (limited: name, email, designation, department, status)
- Cannot create/delete

---

## Field-Level Permissions

### Employee Update - Allowed Fields

**Admin:** All fields

**Manager:** All fields except:
- Cannot change role
- Cannot modify admin/manager accounts

**Employee (self only):**
- mobile
- address
- middleName

---

## Examples

### Complete Flow: Admin Creates Company and Manager

**1. Admin signs in**
```http
POST /auth/signin
{ "email": "admin@system.com", "password": "..." }
```

**2. Admin creates company**
```http
POST /api/companies
Authorization: Bearer {admin-token}
{
  "companyName": "New Corp",
  "companyCode": "NEWCO",
  "contactEmail": "info@newcorp.com"
}
```

**3. Admin creates manager for company**
```http
POST /api/employees
Authorization: Bearer {admin-token}
{
  "companyId": "COMP00101",
  "role": "manager",
  "firstName": "Manager",
  "lastName": "User",
  "email": "manager@newcorp.com",
  "mobile": "1234567890",
  "designation": "HR Manager"
}
```
Response includes `temporaryPassword`

**4. Manager signs in with temporary password**
```http
POST /auth/signin
{ "email": "manager@newcorp.com", "password": "TempPass123!" }
```
Cognito forces password change

**5. Manager creates employee**
```http
POST /api/employees
Authorization: Bearer {manager-token}
{
  "firstName": "Employee",
  "lastName": "User",
  "email": "employee@newcorp.com",
  "mobile": "9876543210",
  "designation": "Developer"
}
```
Note: companyId auto-set to manager's company

---

## Validation Rules

### Company
- `companyName`: Required, string
- `companyCode`: Required, 2-10 uppercase alphanumeric, unique
- `contactEmail`: Required, valid email format

### Employee
- `companyId`: Required
- `role`: Must be admin, manager, or employee
- `firstName`: Required
- `lastName`: Required
- `email`: Required, valid format, unique
- `mobile`: Required, 10 digits
- `designation`: Required
- `status`: Must be active, inactive, or terminated

---

## Pagination

For endpoints that return lists:

**Request:**
```http
GET /api/employees?limit=50
```

**Response includes lastKey:**
```json
{
  "data": {
    "employees": [...],
    "lastKey": "eyJlbXBsb3llZUlkIjoiRU1QMDAxMDUwIn0="
  }
}
```

**Next page:**
```http
GET /api/employees?limit=50&lastKey=eyJlbXBsb3llZUlkIjoiRU1QMDAxMDUwIn0=
```

---

## Testing with cURL

### Sign In
```bash
curl -X POST https://api-url/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
```

### Create Employee
```bash
curl -X POST https://api-url/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","mobile":"1234567890","designation":"Engineer","companyId":"COMP00101"}'
```

### Get Employees
```bash
curl -X GET https://api-url/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```
