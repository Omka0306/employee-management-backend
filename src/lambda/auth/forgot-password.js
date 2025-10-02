const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const COGNITO_APP_CLIENT_SECRET = process.env.COGNITO_APP_CLIENT_SECRET;

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION,
});

/**
 * Compute SECRET_HASH required for Cognito app clients with a secret.
 */
function computeSecretHash(username) {
  const message = username + COGNITO_APP_CLIENT_ID;
  const hmac = crypto.createHmac('sha256', COGNITO_APP_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

/**
 * Lambda handler for forgot password
 * Sends password reset code to user's email
 */
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  try {
    console.log('Forgot Password - Event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { email } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Email is required'
        })
      };
    }

    const secretHash = computeSecretHash(email);

    const command = new ForgotPasswordCommand({
      ClientId: COGNITO_APP_CLIENT_ID,
      Username: email,
      SecretHash: secretHash
    });

    await cognitoClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Password reset code sent to your email. Please check your inbox.',
        email: email
      })
    };
  } catch (error) {
    console.error('Forgot password error:', error);
    
    let message = 'Failed to send password reset code';
    let statusCode = 400;

    if (error.name === 'UserNotFoundException') {
      message = 'User not found';
      statusCode = 404;
    } else if (error.name === 'LimitExceededException') {
      message = 'Too many requests. Please try again later.';
      statusCode = 429;
    } else if (error.name === 'InvalidParameterException') {
      message = 'Invalid email address';
      statusCode = 400;
    }

    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({
        message: message,
        code: error.name
      })
    };
  }
};
