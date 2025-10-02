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

function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

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
