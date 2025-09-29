const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand
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
 * Lambda handler for user sign in
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
    console.log('Sign In - Event:', JSON.stringify(event, null, 2));

    const body = JSON.parse(event.body || '{}');
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Email and password are required'
        })
      };
    }

    const secretHash = computeSecretHash(email);

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: COGNITO_APP_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Authentication failed. No tokens returned.',
        })
      };
    }

    const { IdToken, AccessToken, RefreshToken, ExpiresIn } =
      response.AuthenticationResult;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Sign-in successful',
        idToken: IdToken,
        accessToken: AccessToken,
        refreshToken: RefreshToken,
        expiresIn: ExpiresIn,
      })
    };
  } catch (error) {
    console.error('Sign-in error:', error);
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        message: error.message || 'Sign-in failed',
        code: error.name,
      })
    };
  }
};
