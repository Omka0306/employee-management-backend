# Postman Testing Guide

## 🚀 Quick Setup

### Step 1: Start Express Server for Auth
```bash
npm start
```
This runs on `http://localhost:3000` for authentication endpoints.

### Step 2: Import Postman Collection
1. Open Postman
2. Click **Import**
3. Select `api-collection.json` from this project
4. Collection will be imported with all endpoints configured

---

## 📍 API Endpoints

### **Base URLs:**
- **Auth Endpoints**: `http://localhost:3000` (Express server)
- **Employee Endpoints**: `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev` (AWS Lambda)

---

## 🔐 Authentication Flow (Use Express Server)

### 1️⃣ Sign Up
**POST** `http://localhost:3000/auth/signup`

**Body:**
```json
{
  "email": "test@example.com",
  "password": "Test@123456",
  "name": "Test User"
}
```

**Expected Response:**
```json
{
  "message": "User registered successfully. Check your email for confirmation code.",
  "userSub": "uuid-here",
  "userConfirmed": false
}
```

---

### 2️⃣ Confirm Sign Up
**POST** `http://localhost:3000/auth/confirm`

**Body:**
```json
{
  "email": "test@example.com",
  "code": "123456"
}
```
*Replace `123456` with the code from your email*

**Expected Response:**
```json
{
  "message": "User confirmed successfully. You can now sign in."
}
```

---

### 3️⃣ Sign In
**POST** `http://localhost:3000/auth/signin`

**Body:**
```json
{
  "email": "test@example.com",
  "password": "Test@123456"
}
```

**Expected Response:**
```json
{
  "message": "Sign-in successful",
  "idToken": "eyJraWQiOiI...",
  "accessToken": "eyJraWQiOiI...",
  "refreshToken": "eyJjdHkiOiI...",
  "expiresIn": 3600
}
```

**✅ The Postman collection automatically saves the `accessToken` for you!**

---

## 👥 Employee CRUD Operations (AWS Lambda)

**All employee endpoints require the `Authorization` header with the access token from sign-in.**

### 1️⃣ Create Employee
**POST** `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees`

**Headers:**
- `Authorization: Bearer {{accessToken}}`
- `Content-Type: application/json`

**Body:**
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

**Expected Response:**
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
    "address": {...},
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

**✅ The Postman collection automatically saves the `employeeId` for you!**

---

### 2️⃣ Get All Employees
**GET** `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees`

**Headers:**
- `Authorization: Bearer {{accessToken}}`

**Query Parameters (Optional):**
- `limit=50` - Number of employees to return
- `status=active` - Filter by status (active/inactive/terminated)
- `lastKey=...` - For pagination

**Expected Response:**
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
        ...
      }
    ],
    "count": 1,
    "lastKey": null
  }
}
```

---

### 3️⃣ Get Employee by ID
**GET** `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{{employeeId}}`

**Headers:**
- `Authorization: Bearer {{accessToken}}`

**Expected Response:**
```json
{
  "success": true,
  "message": "Employee retrieved successfully",
  "data": {
    "employeeId": "uuid-here",
    "firstName": "John",
    "lastName": "Doe",
    ...
  }
}
```

---

### 4️⃣ Update Employee
**PUT** `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{{employeeId}}`

**Headers:**
- `Authorization: Bearer {{accessToken}}`
- `Content-Type: application/json`

**Body (partial update):**
```json
{
  "designation": "Senior Software Engineer",
  "salary": 95000,
  "department": "Engineering"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "employeeId": "uuid-here",
    "designation": "Senior Software Engineer",
    "salary": 95000,
    ...
    "updatedAt": "2025-09-30T02:10:00.000Z"
  }
}
```

---

### 5️⃣ Delete Employee
**DELETE** `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/{{employeeId}}`

**Headers:**
- `Authorization: Bearer {{accessToken}}`

**Expected Response:**
```json
{
  "success": true,
  "message": "Employee deleted successfully",
  "data": {
    "employeeId": "uuid-here"
  }
}
```

---

### 6️⃣ Search Employees
**GET** `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api/employees/search?q=john`

**Headers:**
- `Authorization: Bearer {{accessToken}}`

**Query Parameters:**
- `q=john` - Search term (searches in name and email)

**Expected Response:**
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
        ...
      }
    ],
    "count": 1,
    "searchTerm": "john"
  }
}
```

---

## 📝 Testing Workflow in Postman

### **Step-by-Step:**

1. **Start Express Server**
   ```bash
   npm start
   ```

2. **In Postman, run these requests in order:**
   
   ✅ **Authentication** → **Sign Up**
   - Enter your email and password
   - Check your email for verification code
   
   ✅ **Authentication** → **Confirm Sign Up**
   - Enter the code from email
   
   ✅ **Authentication** → **Sign In**
   - Access token is automatically saved!
   
   ✅ **Employees** → **Create Employee**
   - Employee ID is automatically saved!
   
   ✅ **Employees** → **Get All Employees**
   - View all employees
   
   ✅ **Employees** → **Get Employee by ID**
   - Uses saved employee ID
   
   ✅ **Employees** → **Update Employee**
   - Modify employee details
   
   ✅ **Employees** → **Search Employees**
   - Search by name or email
   
   ✅ **Employees** → **Delete Employee**
   - Remove employee

---

## 🔧 Troubleshooting

### ❌ "Unauthorized" Error
**Cause:** Token expired or missing

**Solution:**
1. Run **Sign In** request again
2. New access token will be saved automatically
3. Retry your request

### ❌ "User is not confirmed"
**Cause:** Email not verified

**Solution:**
1. Check email for verification code
2. Run **Confirm Sign Up** request
3. Then run **Sign In**

### ❌ "Employee with this email already exists"
**Cause:** Duplicate email

**Solution:**
- Use a different email address
- Or delete the existing employee first

### ❌ "Validation failed"
**Cause:** Invalid data format

**Solution:**
- Check required fields: firstName, lastName, email, mobile, designation
- Ensure email format is valid
- Ensure mobile is 10 digits
- Ensure status is: active, inactive, or terminated

---

## 🎯 Quick Test Script

Run all tests in sequence:

1. **Sign Up** → Check email → **Confirm** → **Sign In**
2. **Create Employee** (John Doe)
3. **Get All Employees** (should see John)
4. **Get Employee by ID** (John's details)
5. **Update Employee** (promote John)
6. **Search Employees** (search "john")
7. **Delete Employee** (remove John)
8. **Get All Employees** (should be empty or not include John)

---

## 📊 Collection Variables

The Postman collection uses these variables:

| Variable | Value | Auto-saved? |
|----------|-------|-------------|
| `authBaseUrl` | `http://localhost:3000` | No |
| `baseUrl` | `https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev` | No |
| `accessToken` | JWT token from sign-in | ✅ Yes |
| `employeeId` | UUID from create employee | ✅ Yes |

---

## 🚀 Ready to Test!

1. ✅ Import `api-collection.json` into Postman
2. ✅ Start Express server: `npm start`
3. ✅ Run **Sign In** to get access token
4. ✅ Test all employee endpoints!

**Happy Testing! 🎉**
