const fs = require('fs');
const path = require('path');

/**
 * Lambda handler to serve Swagger YAML specification
 */
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/x-yaml',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,OPTIONS'
  };

  try {
    // Load swagger YAML file
    const swaggerPath = path.join(__dirname, '../../../swagger.yaml');
    const swaggerYaml = fs.readFileSync(swaggerPath, 'utf8');

    return {
      statusCode: 200,
      headers,
      body: swaggerYaml
    };
  } catch (error) {
    console.error('Error serving Swagger spec:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Failed to load API specification',
        error: error.message
      })
    };
  }
};
