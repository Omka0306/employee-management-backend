express = require("express");
const crypto = require("crypto");
const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const router = express.Router();

// Load Cognito config from environment
const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const COGNITO_APP_CLIENT_SECRET = process.env.COGNITO_APP_CLIENT_SECRET;

// Initialize AWS Cognito client
const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_REGION,
});

/**
 * Compute SECRET_HASH required for Cognito app clients with a secret.
 * Formula: Base64(HMAC_SHA256(username + clientId, clientSecret))
 */
function computeSecretHash(username) {
  const message = username + COGNITO_APP_CLIENT_ID;
  const hmac = crypto.createHmac("sha256", COGNITO_APP_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest("base64");
}

/**
 * POST /auth/signup
 * Body: { email, password, name }
 * Creates a new user in Cognito User Pool.
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const secretHash = computeSecretHash(email);

    const command = new SignUpCommand({
      ClientId: COGNITO_APP_CLIENT_ID,
      Username: email,
      Password: password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: "email", Value: email },
        ...(name ? [{ Name: "name", Value: name }] : []),
      ],
    });

    const response = await cognitoClient.send(command);

    return res.status(201).json({
      message:
        "User registered successfully. Check your email for confirmation code.",
      userSub: response.UserSub,
      userConfirmed: response.UserConfirmed,
    });
  } catch (error) {
    console.error("Sign-up error:", error);
    return res.status(400).json({
      message: error.message || "Sign-up failed",
      code: error.name,
    });
  }
});

/**
 * POST /auth/confirm
 * Body: { email, code }
 * Confirms user registration with the code sent via email/SMS.
 */
router.post("/confirm", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and confirmation code are required" });
    }

    const secretHash = computeSecretHash(email);

    const command = new ConfirmSignUpCommand({
      ClientId: COGNITO_APP_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
      SecretHash: secretHash,
    });

    await cognitoClient.send(command);

    return res.status(200).json({
      message: "User confirmed successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Confirm error:", error);
    return res.status(400).json({
      message: error.message || "Confirmation failed",
      code: error.name,
    });
  }
});

/**
 * POST /auth/signin
 * Body: { email, password }
 * Authenticates user and returns tokens (IdToken, AccessToken, RefreshToken).
 */
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const secretHash = computeSecretHash(email);

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: COGNITO_APP_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: secretHash,
      },
    });

    const response = await cognitoClient.send(command);

    if (!response.AuthenticationResult) {
      return res.status(400).json({
        message: "Authentication failed. No tokens returned.",
      });
    }

    const { IdToken, AccessToken, RefreshToken, ExpiresIn } =
      response.AuthenticationResult;

    return res.status(200).json({
      message: "Sign-in successful",
      idToken: IdToken,
      accessToken: AccessToken,
      refreshToken: RefreshToken,
      expiresIn: ExpiresIn,
    });
  } catch (error) {
    console.error("Sign-in error:", error);
    return res.status(401).json({
      message: error.message || "Sign-in failed",
      code: error.name,
    });
  }
});

module.exports = router;
