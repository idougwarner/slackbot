const config = {
  isProd: process.env.NODE_ENV === 'production',
  serverBaseUrl: process.env.SLACK_APP_URL,
  slack: {
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.STATE_SECRET
  },
  sfdc: {
    loginUrl: process.env.NODE_ENV === 'production' ? 'https://login.salesforce.com' : 'https://test.salesforce.com',
    clientId: process.env.SALESFORCE_CLIENT_ID,
    clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
    username: process.env.SALESFORCE_USERNAME,
    password: process.env.SALESFORCE_PASSWORD,
    securityToken: process.env.SALESFORCE_USER_SECRET_TOKEN
  }
};

module.exports = config;
