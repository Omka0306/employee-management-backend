const fs = require('fs');
const path = require('path');
const YAML = require('yamljs');

/**
 * Lambda handler to serve Swagger documentation
 */
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'text/html',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  try {
    // Load swagger YAML file
    const swaggerPath = path.join(__dirname, '../../../swagger.yaml');
    const swaggerYaml = fs.readFileSync(swaggerPath, 'utf8');
    const swaggerDoc = YAML.parse(swaggerYaml);

    // Generate Swagger UI HTML
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Employee Management API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui.css">
  <style>
    body { margin: 0; padding: 0; }
    .topbar { display: none !important; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.10.0/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const spec = ${JSON.stringify(swaggerDoc)};
      
      window.ui = SwaggerUIBundle({
        spec: spec,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true
      });
    };
  </script>
</body>
</html>
    `;

    return {
      statusCode: 200,
      headers,
      body: html
    };
  } catch (error) {
    console.error('Error serving Swagger docs:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Failed to load API documentation',
        error: error.message
      })
    };
  }
};
