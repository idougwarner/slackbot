require("dotenv").config();

const { App, LogLevel } = require("@slack/bolt");

const slack = require('./slack');
const salesforce = require('./salesforce');
const localStorage = require('./local-storage');
const { syncDataOverUserPermission } = require('./cron');
const slackPayloads = require('./payloads');

// Instantiate Slack App with Custom Reciever
const app = new App({
  logLevel: LogLevel.DEBUG,
  receiver: slack.receiver,
});

slack.receiver.router.get("/salesforce/oauth_redirect", async (req, res) => {
  const code = req.query.code;
  const installingUserId = req.query.state;

  try {
    const connection = await salesforce.getConnectionByAuthCode(code);

    const userInfo = await connection.identity();

    // Add the new installing user to the users table
    let users = localStorage.getItem('users');
    if (!users) {
      users = [];
    }
    if (!users.find(userId => userId === installingUserId)) {
      users.push(installingUserId);
      localStorage.setItem('users', users);
    }

    // Save the profile of the new installing user to the database
    localStorage.setItem(installingUserId, {
      slackUserId: installingUserId,
      email: userInfo.email,
      username: userInfo.username,
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
      instanceUrl: connection.instanceUrl,
    });

    await syncDataOverUserPermission(installingUserId);

    res.send(
      "Successfully connected slack with your Salesforce User. You can close this window"
    );
  } catch (error) {
    console.error(error);
  }
});

// Listen for users opening the App Home
app.event('app_home_opened', async ({ event, client, logger }) => {
  // Acknowledge command request
  await ack();

  try {
    // Call views.publish with the built-in client
    const result = await client.views.publish(slackPayloads.appHomeView({
      userId: event.user,
      url: salesforce.getAuthorizeUrl({
        state: event.user
      })
    }));

    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

app.command('/submit-ticket', async ({ ack, body, client, logger }) => {
  // Acknowledge command request
  await ack();

  try {
    // Call views.open with the built-in client
    const result = await client.views.open(slackPayloads.recordTypeNotDeterminedModal({
      // Pass a valid trigger_id within 3 seconds of receiving it
      triggerId: body.trigger_id,
      // Slack user ID
      userId: body.user_id,
      // Metadata
      metadata: {
        channelId: body.channel_id
      }
    }));
    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

app.action('select_category', async ({ ack, body, client, logger }) => {
  await ack();

  const selectedRecordType = body.view.state.values['case_category']['select_category']['selected_option'];

  try {
    // Call views.update with the built-in client
    const result = await client.views.update(slackPayloads.recordTypeDeterminedModal({
      // Pass the view_id to update the modal
      viewId: body.view.id,
      // Pass the current hash to avoid race conditions
      hash: body.view.hash,
      // Slack user ID
      userId: body.user.id,
      // The ticket form depends on the selected case category
      recordTypeId: selectedRecordType.value,
      // Metadata
      metadata: body.view.private_metadata
    }));
    logger.info(result);
  } catch (error) {
    logger.error(error);
  }
});

app.view('record_type_determined_view', async ({ ack, body, view, client, logger }) => {
  // Acknowledge the view_submission request
  await ack();

  const channelId = JSON.parse(body.view['private_metadata']).channelId;

  // Collect the values of all form fields on the view.
  const values = Object.keys(view['state']['values']).reduce((acc, key) => ({
    ...acc,
    ...view['state']['values'][key]
  }), {});

  // Re-use the access token to establish a secure connection to the salesforce.
  const { instanceUrl, accessToken, refreshToken } = localStorage.getItem(body.user.id);
  const connection = salesforce.getConnectionByAccessToken(instanceUrl, accessToken, refreshToken);

  try {
    // Create a case
    const result = await salesforce.createCase(connection, {
      RecordTypeId: values['select_category']['selected_option']['value'],
      AccountId: values['select_account']['selected_option']['value'],
      Type: values['select_case_type']['selected_option']['value'],
      Case_Detail__c: values['select_case_detail']['selected_options'].map(option => option.value).join(';'),
      Subject: values['input_case_subject']['value'],
      Description: values['input_case_description']['value'],
      Due_Date__c: values['select_due_date']['selected_date'],
      Priority: values['select_case_priority']['selected_option']['value'],
      Work_Location__c: values['select_case_work_location']['selected_option']['value']
    });

    // Call chat.postMessage with the built-in client
    await client.chat.postMessage({
      channel: channelId,
      blocks: slackPayloads.createCaseCompletedMessage({
        url: `${instanceUrl}/lightning/r/Case/${result.id}/view`
      })
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: channelId,
      text: 'There was an error while creating a ticket. Try again later!'
    });

    logger.error(error);
  }
});

(async () => {
  await app.start(process.env.PORT || 5000);

  console.log("⚡️ Bolt app is running!");
})();
