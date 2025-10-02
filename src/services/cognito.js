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
  ListUsersCommand,
  AdminResetUserPasswordCommand
} = require('@aws-sdk/client-cognito-identity-provider');

const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
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

function generateTemporaryPassword() {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  password += 'A';
  password += 'a';
  password += '1';
  password += '!';
  
  for (let i = password.length; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

class CognitoService {
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
        MessageAction: 'SUPPRESS'
      });

      const response = await cognitoClient.send(command);

      const setPasswordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email,
        Password: temporaryPassword,
        Permanent: true
      });

      await cognitoClient.send(setPasswordCommand);

      const resetCommand = new AdminResetUserPasswordCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: email
      });

      await cognitoClient.send(resetCommand);

      return {
        userSub: response.User.Username,
        email: email,
        temporaryPassword: null,
        status: 'RESET_REQUIRED',
        message: 'Password reset link sent to user email'
      };
    } catch (error) {
      console.error('Cognito create user error:', error);
      throw new Error(`Failed to create Cognito user: ${error.message}`);
    }
  }

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
      console.warn(`Warning: Could not add user to group ${groupName}. Group may not exist.`);
    }
  }

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

  static async getUser(username) {
    try {
      const command = new AdminGetUserCommand({
        UserPoolId: COGNITO_USER_POOL_ID,
        Username: username
      });

      const response = await cognitoClient.send(command);
      
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
