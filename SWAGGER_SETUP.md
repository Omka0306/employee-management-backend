# Swagger/OpenAPI Documentation Setup

## 📄 Files Created

- ✅ **`swagger.yaml`** - Complete OpenAPI 3.0 specification for all APIs

## 🌐 View Swagger Documentation

### **Option 1: Swagger Editor (Online)**

1. Go to https://editor.swagger.io/
2. Click **File** → **Import file**
3. Select `swagger.yaml` from this project
4. View and test your API documentation!

### **Option 2: Swagger UI (Local)**

#### Install Swagger UI Express:

```bash
npm install --save swagger-ui-express yamljs
```

#### Create Swagger Route:

Create `src/routes/swagger.js`:

```javascript
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const router = express.Router();

// Load swagger document
const swaggerDocument = YAML.load(path.join(__dirname, '../../swagger.yaml'));

// Swagger UI options
const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Employee Management API Docs"
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, options));

module.exports = router;
```

#### Add to Express App:

In `src/app.js`, add:

```javascript
const swaggerRoutes = require('./routes/swagger');

// Swagger documentation
app.use('/api-docs', swaggerRoutes);
```

#### Access Documentation:

```
http://localhost:3000/api-docs
```

### **Option 3: Swagger UI (Docker)**

```bash
docker run -p 8080:8080 -e SWAGGER_JSON=/swagger.yaml -v ${PWD}/swagger.yaml:/swagger.yaml swaggerapi/swagger-ui
```

Access at: `http://localhost:8080`

### **Option 4: VS Code Extension**

1. Install **Swagger Viewer** extension in VS Code
2. Open `swagger.yaml`
3. Press `Shift + Alt + P` (Windows) or `Shift + Option + P` (Mac)
4. View rendered documentation in VS Code

### **Option 5: Redoc (Alternative UI)**

```bash
npm install --save redoc-express
```

```javascript
const { redoc } = require('redoc-express');

app.get('/docs', redoc({
  title: 'Employee Management API',
  specUrl: '/swagger.yaml'
}));
```

---

## 📝 What's Included in swagger.yaml

### **API Information:**
- Title, description, version
- Contact information
- License details
- Server URLs (dev, prod)

### **Authentication:**
- AWS Cognito JWT bearer token
- Security scheme definitions

### **Endpoints Documented:**

#### **Authentication (3 endpoints):**
1. `POST /auth/signup` - User registration
2. `POST /auth/confirm` - Email verification
3. `POST /auth/signin` - User login

#### **Employees (6 endpoints):**
1. `POST /api/employees` - Create employee
2. `GET /api/employees` - Get all employees
3. `GET /api/employees/{id}` - Get employee by ID
4. `PUT /api/employees/{id}` - Update employee
5. `DELETE /api/employees/{id}` - Delete employee
6. `GET /api/employees/search` - Search employees

### **For Each Endpoint:**
- ✅ Description and summary
- ✅ Request parameters
- ✅ Request body schema
- ✅ Response codes (200, 201, 400, 401, 404, 409, 500)
- ✅ Response schemas
- ✅ Examples
- ✅ Authentication requirements

### **Schemas Defined:**
- ✅ Employee (full object)
- ✅ EmployeeInput (for create)
- ✅ EmployeeUpdate (for update)
- ✅ Error (error responses)

### **Reusable Components:**
- ✅ Security schemes
- ✅ Response templates
- ✅ Schema definitions

---

## 🚀 Deploy Swagger to AWS

### **Option A: Host on S3 + CloudFront**

1. **Build static Swagger UI:**
   ```bash
   npx swagger-ui-dist
   ```

2. **Upload to S3:**
   ```bash
   aws s3 cp swagger.yaml s3://your-bucket/swagger.yaml
   aws s3 sync swagger-ui-dist s3://your-bucket/ --acl public-read
   ```

3. **Access:**
   ```
   https://your-bucket.s3.amazonaws.com/index.html
   ```

### **Option B: Add to API Gateway**

Add a new Lambda function to serve Swagger UI:

```yaml
# In serverless.yml
functions:
  swaggerUI:
    handler: src/lambda/swagger.handler
    events:
      - http:
          path: api-docs
          method: get
          cors: true
```

---

## 🧪 Test API with Swagger UI

1. Open Swagger UI (any method above)
2. Click **"Authorize"** button
3. Enter your JWT access token from `/auth/signin`
4. Click **"Authorize"**
5. Now you can test all protected endpoints directly from Swagger UI!

---

## 📤 Export Options

### **Generate Postman Collection from Swagger:**

```bash
npm install -g openapi-to-postmanv2
openapi2postmanv2 -s swagger.yaml -o postman-collection.json
```

### **Generate Client SDKs:**

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate JavaScript client
openapi-generator-cli generate -i swagger.yaml -g javascript -o ./client-sdk

# Generate Python client
openapi-generator-cli generate -i swagger.yaml -g python -o ./client-sdk-python

# Generate Java client
openapi-generator-cli generate -i swagger.yaml -g java -o ./client-sdk-java
```

---

## 🔄 Keep Swagger Updated

When you add/modify endpoints:

1. Update `swagger.yaml`
2. Validate the file:
   ```bash
   npx swagger-cli validate swagger.yaml
   ```
3. Commit to Git
4. Redeploy documentation

---

## 📚 Additional Resources

- **OpenAPI Specification**: https://swagger.io/specification/
- **Swagger Editor**: https://editor.swagger.io/
- **Swagger UI**: https://swagger.io/tools/swagger-ui/
- **OpenAPI Generator**: https://openapi-generator.tech/

---

## ✅ Benefits of Swagger Documentation

1. **✅ Interactive Testing** - Test APIs directly from browser
2. **✅ Auto-Generated Docs** - Always up-to-date
3. **✅ Client SDK Generation** - Generate code for any language
4. **✅ API Validation** - Validate requests/responses
5. **✅ Team Collaboration** - Share with frontend developers
6. **✅ API Versioning** - Track changes over time
7. **✅ Standards Compliant** - OpenAPI 3.0 standard

---

**Your API is now fully documented with Swagger/OpenAPI! 🎉**
