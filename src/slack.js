const { ExpressReceiver } = require("@slack/bolt");
const salesforce = require('./salesforce');
const localStorage = require('./local-storage');
const config = require('./config');

const prefix = (str) => `slack_oauth_${str}`;

const authorizeUrl = `https://slack.com/oauth/v2/authorize?scope=commands,chat:write,chat:write.public,channels:join&client_id=${config.slack.clientId}`;

// Create a Reciever for Installation and OAuth with Slack and Salesforce
const receiver = new ExpressReceiver({
  signingSecret: config.slack.signingSecret,
  clientId: config.slack.clientId,
  clientSecret: config.slack.clientSecret,
  stateSecret: config.slack.stateSecret,
  scopes: ["commands", 'chat:write', 'chat:write.public', 'channels:join'],
  endpoints: {
    events: '/slack/events',
    commands: '/slack/commands'
  },
  installerOptions: {
    authVersion: "v2",
    installPath: "/slack/install",
    redirectUriPath: "/slack/oauth_redirect",
    callbackOptions: {
      success: async (installation, installOptions, req, res) => {
        try {
          // Web based OAuth 2.0 with Salesforce upon Install
          res.redirect(salesforce.getAuthorizeUrl({
            state: installation.user.id
          }));
        } catch (error) {
          throw error;
        }
      },
      failure: (error, installOptions, req, res) => {
        console.error('error', error, installOptions);
        // Do custom failure logic here
        res.send("failure");
      },
    },
  },
  installationStore: {
    storeInstallation: async (installation) => {
      if (installation.isEnterpriseInstall && installation.enterprise !== undefined) {
        // support for org-wide app installation
        return await localStorage.setItem(prefix(installation.enterprise.id), installation);
      }
      if (installation.team !== undefined) {
        // single team app installation
        return await localStorage.setItem(prefix(installation.team.id), installation);
      }
      throw new Error('Failed saving installation data to installationStore');
    },
    fetchInstallation: async (installQuery) => {
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation lookup
        return await localStorage.getItem(prefix(installQuery.enterpriseId));
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation lookup
        return await localStorage.getItem(prefix(installQuery.teamId));
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      if (installQuery.isEnterpriseInstall && installQuery.enterpriseId !== undefined) {
        // org wide app installation deletion
        return await localStorage.deleteItem(prefix(installQuery.enterpriseId));
      }
      if (installQuery.teamId !== undefined) {
        // single team app installation deletion
        return await localStorage.deleteItem(prefix(installQuery.teamId));
      }
      throw new Error('Failed to delete installation');
    },
  }
});

module.exports = {
  authorizeUrl,
  receiver
};
