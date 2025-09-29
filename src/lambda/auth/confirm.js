const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand
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
 * Lambda handler for confirming user sign up
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
    console.log('Confirm Sign Up - Event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { email, code } = body;

    if (!email || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Email and confirmation code are required'
        })
      };
    }

    const secretHash = computeSecretHash(email);

    const command = new ConfirmSignUpCommand({
      ClientId: COGNITO_APP_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'User confirmed successfully. You can now sign in.',
      })
    };
  } catch (error) {
    console.error('Confirm error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: error.message || 'Confirmation failed',
        code: error.name,
      })
    };
  }
};
