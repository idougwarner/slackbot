## Setup

### Create a Slack app

1. Create an app at [https://api.slack.com/apps](https://api.slack.com/apps)
1. Add a slash command (See *Add a Slash Command* section below)
1. Enable the interactivity (See *Enable Interactivity* section below)
1. Subscribe to a slack event (See *Enable Event Subscription* section below)
1. Turn on the Home Tab (See *Turn on the Home Tab* section below)
1. Navigate to the **OAuth & Permissions** page and select the following bot token scopes:
    * `commands`
    * `chat:write`
    * `chat:write.public`
    * `channels:join`
1. In the **OAuth & Permissions** page, add a redirect URL item and set it to your server + `/slack/oauth_redirect`.
1. Click 'Save Changes' and install the app (You should get an OAuth access token after the installation)

#### Add a Slash Command
1. Go back to the app settings and click on **Slash Commands**.
1. Click the 'Create New Command' button and fill in the following:
    * Command: `/ticket`
    * Request URL: Your server + `/slack/events`
    * Short description: `Create a case`
    * Usage hint: `[the problem you're having]`

#### Enable Interactivity
1. Go back to the app settings and click on **Interactivity & Shortcuts**.
1. Set the Request URL to your server + `/slack/events`.
1. Save the change.

#### Enable Event Subscription
1. Go back to the app settings and click on **Event Subscription**.
1. Click the Enable Events button and set the Request URL to your server + `/slack/events`.
1. Subscribe to a bot event - `app_home_opened`.
1. Save the change

#### Turn on the Home Tab
1. Go back to the app settings and click on App Home.
1. Enable Home Tab in the Show Tabs section


### Create a connected app on Salesforce

1. Go to Setup -> Apps -> App Manager
1. Click on the New Connected App button
1. Enter the Name of the Application.
1. Enter Contact Email and any additional information suitable for your application.
1. Enable OAuth settings in API section.
1. Enter a Callback URL. This is the URL that a user’s browser is redirected to after successful authentication. Set it to your server + `/salesforce/oauth_redirect`.
1. Add OAuth Scopes.
    * Access the identity URL service (id, profile, email, address, phone)
    * Manage user data via APIs (api)
    * Perform requests at any time (refresh_token, offline_access)
1. Click on ‘Save’ button.
1. You will be redirected to your Connected App’s Page.
1. Click on Click to reveal link to get Consumer secret.
1. Make a note of “Consumer Key “ and “Consumer secret”, as you need these details to authenticate the external application.


### Set Your Credentials

1. Set the following environment variables to `.env` (see `.env.sample`):
    * `SLACK_CLIENT_ID`: Your app client ID. (available on the **Basic Information** page)
    * `SLACK_CLIENT_SECRET`: Your app client ID. (available on the **Basic Information** page)
    * `SLACK_SIGNING_SECRET`: Your app's Signing Secret (available on the **Basic Information** page)
    * `SALESFORCE_CLIENT_ID`: Your connected app's consumer key
    * `SALESFORCE_CLIENT_SECRET`: Your connected app's secret key

#### Run the app 

1. Get the code
    * Clone this repo and run `npm install`
1. If you're running the app locally, run the app (`npm start`).

If you want to run it locally, I recommend creating a localhost tunnel with [ngrok](https://ngrok.com)!
