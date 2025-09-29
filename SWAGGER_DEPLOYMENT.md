# Swagger Documentation Deployment Guide

## 🚀 Deploy Swagger to AWS Lambda

Your Swagger documentation is now configured to deploy as Lambda functions on AWS!

---

## 📦 What Was Created

### **Lambda Functions:**
1. ✅ **`swaggerUI`** - Serves interactive Swagger UI (HTML page)
2. ✅ **`swaggerSpec`** - Serves raw swagger.yaml file

### **Files:**
1. ✅ `src/lambda/swagger/docs.js` - Swagger UI handler
2. ✅ `src/lambda/swagger/spec.js` - Swagger YAML handler
3. ✅ Updated `serverless.yml` - Added Swagger endpoints
4. ✅ Updated `package.json` - Added yamljs dependency

---

## 🚀 Deploy to AWS

### **Step 1: Deploy All Functions**

```bash
npm run deploy:dev
```

This will deploy **11 Lambda functions**:
- 3 Auth functions (signup, confirm, signin)
- 6 Employee functions (create, getAll, getById, update, delete, search)
- **2 Swagger functions (swaggerUI, swaggerSpec)** ← NEW!

### **Step 2: Get Your Swagger URL**

After deployment, you'll see:

```
endpoints:
  ...
  GET - https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api-docs
  GET - https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/swagger.yaml
  ...
```

---

## 🌐 Access Swagger Documentation

### **Swagger UI (Interactive):**
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api-docs
```

**Features:**
- ✅ Interactive API testing
- ✅ Try out endpoints directly
- ✅ Built-in authentication
- ✅ Request/response examples
- ✅ Schema validation

### **Swagger YAML (Raw Spec):**
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/swagger.yaml
```

**Use for:**
- ✅ Import into Postman
- ✅ Generate client SDKs
- ✅ Share with team
- ✅ API versioning

---

## 🧪 Test Swagger Deployment

### **1. Access Swagger UI:**

Open in browser:
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api-docs
```

### **2. Test Authentication:**

1. Expand **POST /auth/signin**
2. Click **"Try it out"**
3. Enter credentials:
   ```json
   {
     "email": "test@example.com",
     "password": "Test@123456"
   }
   ```
4. Click **"Execute"**
5. Copy the `accessToken` from response

### **3. Authorize:**

1. Click **"Authorize"** button (🔒 icon at top)
2. Paste your `accessToken`
3. Click **"Authorize"**
4. Click **"Close"**

### **4. Test Employee Endpoints:**

1. Expand **POST /api/employees**
2. Click **"Try it out"**
3. Modify the example request
4. Click **"Execute"**
5. See the response!

---

## 📤 Share Documentation

### **Option 1: Share URL**

Send this URL to your team:
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api-docs
```

### **Option 2: Share YAML File**

Send this URL for import:
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/swagger.yaml
```

They can import into:
- Swagger Editor (https://editor.swagger.io/)
- Postman
- Insomnia
- Any OpenAPI tool

### **Option 3: Embed in Website**

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: 'https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/swagger.yaml',
      dom_id: '#swagger-ui'
    });
  </script>
</body>
</html>
```

---

## 🔄 Update Swagger Documentation

### **1. Edit swagger.yaml**

Make your changes to the `swagger.yaml` file.

### **2. Validate Changes**

```bash
npx swagger-cli validate swagger.yaml
```

### **3. Redeploy**

```bash
npm run deploy:dev
```

The updated documentation will be live immediately!

---

## 💰 Cost

**Swagger Lambda Functions:**
- **Free Tier**: 1M requests/month free
- **After Free Tier**: ~$0.20 per 1M requests
- **Typical Cost**: $0-1/month for documentation access

---

## 🎯 Production Deployment

### **Deploy to Production:**

```bash
npm run deploy:prod
```

### **Production URLs:**

```
Swagger UI:   https://your-api.com/prod/api-docs
Swagger YAML: https://your-api.com/prod/swagger.yaml
```

### **Custom Domain (Optional):**

1. **Register domain in Route 53**
2. **Create SSL certificate in ACM**
3. **Add custom domain to API Gateway**

```yaml
# In serverless.yml
custom:
  customDomain:
    domainName: api.yourdomain.com
    certificateName: '*.yourdomain.com'
    basePath: ''
    stage: ${self:provider.stage}
```

Then access at:
```
https://api.yourdomain.com/api-docs
```

---

## 🔒 Secure Swagger Documentation (Optional)

### **Option 1: API Key Protection**

Add API key requirement in `serverless.yml`:

```yaml
swaggerUI:
  handler: src/lambda/swagger/docs.handler
  events:
    - http:
        path: api-docs
        method: get
        cors: true
        private: true  # Requires API key
```

### **Option 2: Cognito Protection**

Require authentication to view docs:

```yaml
swaggerUI:
  handler: src/lambda/swagger/docs.handler
  events:
    - http:
        path: api-docs
        method: get
        cors: true
        authorizer:
          type: COGNITO_USER_POOLS
          authorizerId:
            Ref: ApiGatewayAuthorizer
```

### **Option 3: IP Whitelist**

Use AWS WAF to restrict access by IP address.

---

## 📊 Monitor Documentation Usage

### **CloudWatch Metrics:**

1. Go to AWS CloudWatch Console
2. Select **Lambda** → **Functions**
3. View metrics for `swaggerUI` and `swaggerSpec` functions

**Key Metrics:**
- Invocations (how many people viewed docs)
- Duration (page load time)
- Errors (if any)

### **API Gateway Logs:**

```bash
# View Swagger UI access logs
serverless logs -f swaggerUI -t

# View Swagger YAML access logs
serverless logs -f swaggerSpec -t
```

---

## 🛠️ Troubleshooting

### **Issue: Swagger UI not loading**

**Solution:**
1. Check Lambda logs: `serverless logs -f swaggerUI`
2. Verify `swagger.yaml` exists in deployment package
3. Check CORS settings

### **Issue: "Try it out" not working**

**Solution:**
1. Check CORS configuration
2. Verify API Gateway endpoints are correct in `swagger.yaml`
3. Update `servers` section in `swagger.yaml` with correct URL

### **Issue: Authentication not working**

**Solution:**
1. Get fresh token from `/auth/signin`
2. Click "Authorize" in Swagger UI
3. Paste token with `Bearer ` prefix
4. Click "Authorize" button

---

## 📚 Alternative Deployment Options

### **Option 1: S3 + CloudFront (Static)**

**Pros:** Cheaper, faster  
**Cons:** No server-side logic

```bash
# Build static Swagger UI
npx swagger-ui-dist

# Upload to S3
aws s3 sync swagger-ui-dist s3://your-bucket/docs/ --acl public-read
aws s3 cp swagger.yaml s3://your-bucket/swagger.yaml --acl public-read
```

### **Option 2: Docker Container**

```dockerfile
FROM swaggerapi/swagger-ui
COPY swagger.yaml /usr/share/nginx/html/swagger.yaml
ENV SWAGGER_JSON=/usr/share/nginx/html/swagger.yaml
```

Deploy to:
- AWS ECS/Fargate
- AWS App Runner
- Kubernetes

### **Option 3: GitHub Pages**

```bash
# Push to gh-pages branch
git checkout -b gh-pages
git add swagger.yaml
git commit -m "Add API docs"
git push origin gh-pages
```

Access at: `https://your-username.github.io/your-repo/swagger.yaml`

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Update `swagger.yaml` with production URLs
- [ ] Test all endpoints in Swagger UI
- [ ] Validate swagger.yaml: `npx swagger-cli validate swagger.yaml`
- [ ] Update API descriptions and examples
- [ ] Add contact information
- [ ] Set up custom domain (optional)
- [ ] Configure security (API key/Cognito)
- [ ] Set up monitoring and alerts
- [ ] Share documentation URL with team
- [ ] Add link to docs in README.md

---

## 🎉 You're Done!

Your Swagger documentation is now deployed to AWS Lambda!

**Access your live documentation:**
```
https://ec4msgjtx3.execute-api.ap-south-1.amazonaws.com/dev/api-docs
```

**Next Steps:**
1. Deploy: `npm run deploy:dev`
2. Open the URL above
3. Test your APIs interactively
4. Share with your team!

---

**Need help?** Check the main documentation in `SWAGGER_SETUP.md`
