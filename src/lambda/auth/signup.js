const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  SignUpCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const COGNITO_APP_CLIENT_SECRET = process.env.COGNITO_APP_CLIENT_SECRET;

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION,
});

function computeSecretHash(username) {
  const message = username + COGNITO_APP_CLIENT_ID;
  const hmac = crypto.createHmac('sha256', COGNITO_APP_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const { email, password, name } = body;

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

    const command = new SignUpCommand({
      ClientId: COGNITO_APP_CLIENT_ID,
      Username: email,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: 'email', Value: email },
        ...(name ? [{ Name: 'name', Value: name }] : []),
      ],
    });

    const response = await cognitoClient.send(command);

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: 'User registered successfully. Check your email for confirmation code.',
        userSub: response.UserSub,
        userConfirmed: response.UserConfirmed,
      })
    };
  } catch (error) {
    console.error('Sign-up error:', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: error.message || 'Sign-up failed',
        code: error.name,
      })
    };
  }
};
