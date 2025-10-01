const crypto = require('crypto');
const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminAddUserToGroupCommand,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDisableUserCommand,
  AdminEnableUserCommand,
  AdminDeleteUserCommand,
  ListUsersCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
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
  const hmac = crypto.createHmac('sha256', COGNITO_APP_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
}

/**
 * Generate a random temporary password
 * @returns {string}
 */
function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // Ensure at least one of each required character type
  password += 'A'; // uppercase
  password += 'a'; // lowercase
  password += '1'; // number
  password += '!'; // special char
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Cognito Service for User Management
 */
class CognitoService {
  /**
   * Create a new user in Cognito
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  static async createUser(userData) {
    const { email, name, role, companyId } = userData;
    const temporaryPassword = generateTemporaryPassword();

    try {
      const command = new AdminCreateUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'email_verified', Value: 'true' },
          { Name: 'name', Value: name },
          { Name: 'custom:role', Value: role },
          { Name: 'custom:companyId', Value: companyId }
        ],
        TemporaryPassword: temporaryPassword,
        DesiredDeliveryMediums: ['EMAIL'],
        MessageAction: 'SUPPRESS' // We'll send custom email with temp password
      });

      const response = await cognitoClient.send(command);

      return {
        userSub: response.User.Username,
        email: email,
        temporaryPassword: temporaryPassword,
        status: response.User.UserStatus
      };
    } catch (error) {
      console.error('Cognito create user error:', error);
      throw new Error(`Failed to create Cognito user: ${error.message}`);
    }
  }

  /**
   * Add user to a Cognito group (for role-based access)
   * @param {string} username - Cognito username (email)
   * @param {string} groupName - Group name (admin, manager, employee)
   * @returns {Promise<void>}
   */
  static async addUserToGroup(username, groupName) {
    try {
      const command = new AdminAddUserToGroupCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        GroupName: groupName
      });

      await cognitoClient.send(command);
    } catch (error) {
      console.error('Cognito add user to group error:', error);
      // Don't throw error if group doesn't exist - groups are optional
      console.warn(`Warning: Could not add user to group ${groupName}. Group may not exist.`);
    }
  }

  /**
   * Set permanent password for user (admin action)
   * @param {string} username - Cognito username (email)
   * @param {string} password - New password
   * @param {boolean} permanent - Whether password is permanent
   * @returns {Promise<void>}
   */
  static async setUserPassword(username, password, permanent = true) {
    try {
      const command = new AdminSetUserPasswordCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        Password: password,
        Permanent: permanent
      });

      await cognitoClient.send(command);
    } catch (error) {
      console.error('Cognito set password error:', error);
      throw new Error(`Failed to set user password: ${error.message}`);
    }
  }

  /**
   * Get user details from Cognito
   * @param {string} username - Cognito username (email)
   * @returns {Promise<Object>}
   */
  static async getUser(username) {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username
      });

      const response = await cognitoClient.send(command);
      
      // Parse user attributes
      const attributes = {};
      response.UserAttributes.forEach(attr => {
        attributes[attr.Name] = attr.Value;
      });

      return {
        username: response.Username,
        userSub: attributes.sub,
        email: attributes.email,
        name: attributes.name,
        role: attributes['custom:role'],
        companyId: attributes['custom:companyId'],
        enabled: response.Enabled,
        userStatus: response.UserStatus,
        createdAt: response.UserCreateDate,
        updatedAt: response.UserLastModifiedDate
      };
    } catch (error) {
      console.error('Cognito get user error:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user attributes
   * @param {string} username - Cognito username (email)
   * @param {Object} attributes - Attributes to update
   * @returns {Promise<void>}
   */
  static async updateUserAttributes(username, attributes) {
    try {
      const userAttributes = [];
      
      if (attributes.name) {
        userAttributes.push({ Name: 'name', Value: attributes.name });
      }
      if (attributes.role) {
        userAttributes.push({ Name: 'custom:role', Value: attributes.role });
      }
      if (attributes.companyId) {
        userAttributes.push({ Name: 'custom:companyId', Value: attributes.companyId });
      }

      if (userAttributes.length === 0) {
        return;
      }

      const command = new AdminUpdateUserAttributesCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username,
        UserAttributes: userAttributes
      });

      await cognitoClient.send(command);
    } catch (error) {
      console.error('Cognito update user attributes error:', error);
      throw new Error(`Failed to update user attributes: ${error.message}`);
    }
  }

  /**
   * Disable user account
   * @param {string} username - Cognito username (email)
   * @returns {Promise<void>}
   */
  static async disableUser(username) {
    try {
      const command = new AdminDisableUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username
      });

      await cognitoClient.send(command);
    } catch (error) {
      console.error('Cognito disable user error:', error);
      throw new Error(`Failed to disable user: ${error.message}`);
    }
  }

  /**
   * Enable user account
   * @param {string} username - Cognito username (email)
   * @returns {Promise<void>}
   */
  static async enableUser(username) {
    try {
      const command = new AdminEnableUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username
      });

      await cognitoClient.send(command);
    } catch (error) {
      console.error('Cognito enable user error:', error);
      throw new Error(`Failed to enable user: ${error.message}`);
    }
  }

  /**
   * Delete user account
   * @param {string} username - Cognito username (email)
   * @returns {Promise<void>}
   */
  static async deleteUser(username) {
    try {
      const command = new AdminDeleteUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username
      });

      await cognitoClient.send(command);
    } catch (error) {
      console.error('Cognito delete user error:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * List all users (with optional filter)
   * @param {Object} options - Filter options
   * @returns {Promise<Array>}
   */
  static async listUsers(options = {}) {
    try {
      const { limit = 60, paginationToken, filter } = options;

      const command = new ListUsersCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Limit: limit,
        PaginationToken: paginationToken,
        Filter: filter
      });

      const response = await cognitoClient.send(command);

      const users = response.Users.map(user => {
        const attributes = {};
        user.Attributes.forEach(attr => {
          attributes[attr.Name] = attr.Value;
        });

        return {
          username: user.Username,
          userSub: attributes.sub,
          email: attributes.email,
          name: attributes.name,
          role: attributes['custom:role'],
          companyId: attributes['custom:companyId'],
          enabled: user.Enabled,
          userStatus: user.UserStatus,
          createdAt: user.UserCreateDate,
          updatedAt: user.UserLastModifiedDate
        };
      });

      return {
        users,
        paginationToken: response.PaginationToken
      };
    } catch (error) {
      console.error('Cognito list users error:', error);
      throw new Error(`Failed to list users: ${error.message}`);
    }
  }
}

module.exports = CognitoService;
