const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand
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
 * Lambda handler for reset password with code
 * Confirms the password reset using the code sent via email
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
    console.log('Reset Password - Event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Email, code, and new password are required'
        })
      };
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Password must be at least 8 characters long'
        })
      };
    }

    const secretHash = computeSecretHash(email);

    const command = new ConfirmForgotPasswordCommand({
      ClientId: COGNITO_APP_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: secretHash
    });

    await cognitoClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Password reset successful. You can now sign in with your new password.',
        email: email
      })
    };
  } catch (error) {
    console.error('Reset password error:', error);
    
    let message = 'Failed to reset password';
    let statusCode = 400;

    if (error.name === 'CodeMismatchException') {
      message = 'Invalid verification code';
      statusCode = 400;
    } else if (error.name === 'ExpiredCodeException') {
      message = 'Verification code has expired. Please request a new one.';
      statusCode = 400;
    } else if (error.name === 'InvalidPasswordException') {
      message = 'Password does not meet requirements. Must be at least 8 characters with uppercase, lowercase, number, and special character.';
      statusCode = 400;
    } else if (error.name === 'UserNotFoundException') {
      message = 'User not found';
      statusCode = 404;
    } else if (error.name === 'LimitExceededException') {
      message = 'Too many attempts. Please try again later.';
      statusCode = 429;
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
