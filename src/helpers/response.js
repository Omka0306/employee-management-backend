/**
 * Helper functions for Lambda HTTP responses
 */

/**
 * Create a success response
 * @param {number} statusCode 
 * @param {Object} data 
 * @param {string} message 
 * @returns {Object}
 */
function successResponse(statusCode, data, message = 'Success') {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify({
      success: true,
      message,
      data
    })
  };
}

/**
 * Create an error response
 * @param {number} statusCode 
 * @param {string} message 
 * @param {Array} errors 
 * @returns {Object}
 */
function errorResponse(statusCode, message, errors = []) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
    },
    body: JSON.stringify({
      success: false,
      message,
      errors
    })
  };
}

/**
 * Parse request body
 * @param {Object} event 
 * @returns {Object}
 */
function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Extract user information from Cognito authorizer
 * @param {Object} event 
 * @returns {Object}
 */
function getUserFromEvent(event) {
  if (event.requestContext && event.requestContext.authorizer) {
    const claims = event.requestContext.authorizer.claims;
    return {
      userId: claims.sub,
      email: claims.email,
      username: claims['cognito:username']
    };
  }
  return null;
}

module.exports = {
  successResponse,
  errorResponse,
  parseBody,
  getUserFromEvent
};
