const express = require("express");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const authRoutes = require("./routes/auth");

const app = express();
app.use(express.json());

const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const COGNITO_APP_CLIENT_ID = process.env.COGNITO_APP_CLIENT_ID;
const COGNITO_APP_CLIENT_SECRET = process.env.COGNITO_APP_CLIENT_SECRET;
const COGNITO_TOKEN_USE = process.env.COGNITO_TOKEN_USE || "access";

if (!COGNITO_REGION || !COGNITO_USER_POOL_ID || !COGNITO_APP_CLIENT_ID || !COGNITO_APP_CLIENT_SECRET) {
  console.warn("[WARN] Missing one or more Cognito env vars. Auth operations may fail.");
}

const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: COGNITO_TOKEN_USE,
  clientId: COGNITO_APP_CLIENT_ID,
});

async function authenticateCognito(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = authHeader.substring("Bearer ".length).trim();
    const payload = await verifier.verify(token);
    req.user = payload;
    return next();
  } catch (err) {
    console.error("Cognito auth error:", err?.message || err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

app.get("/", (req, res) => {
  res.send("Employee Management Backend is up.");
});

app.use("/auth", authRoutes);

const swaggerRoutes = require("./routes/swagger");
app.use("/api-docs", swaggerRoutes);

app.get("/api/secure", authenticateCognito, (req, res) => {
  res.json({
    message: "Secure data",
    user: req.user,
  });
});

module.exports = app;

