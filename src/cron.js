const cron = require('node-cron');
const salesforce = require('./salesforce');
const localStorage = require('./local-storage');

const syncPicklistValues = async () => {
  const connection = await salesforce.getConnectionByUsernameAndPassword();

  const recordTypes = await salesforce.getCaseObjectActiveRecordTypes(connection);
  localStorage.setItem('case_record_type_picklist', recordTypes);

  const promises = recordTypes.map(async (recordType) => {
    const types = await salesforce.getTypePicklistByRecordType(connection, recordType.value);
    localStorage.setItem(`case_type_picklist_${recordType.value}`, types);

    const details = await salesforce.getDetailPicklistByRecordType(connection, recordType.value);
    localStorage.setItem(`case_detail_picklist_${recordType.value}`, details);

    const priorities = await salesforce.getPriorityPicklistByRecordType(connection, recordType.value);
    localStorage.setItem(`case_priority_picklist_${recordType.value}`, priorities);

    const worlocations = await salesforce.getWorkLocationPicklistByRecordType(connection, recordType.value);
    localStorage.setItem(`case_work_location_picklist_${recordType.value}`, worlocations);
  });

  await Promise.all(promises);
  console.log('syncPicklistValues done');
};

const syncDataOverUserPermission = async (userId) => {
  const { instanceUrl, accessToken, refreshToken } = localStorage.getItem(userId);
  const connection = salesforce.getConnectionByAccessToken(instanceUrl, accessToken, refreshToken);

  try {
    const accounts = await salesforce.getAccounts(connection);
    localStorage.setItem(`${userId}-data`, {
      accounts
    });
  } catch (error) {
    console.error(error);
  }
};

cron.schedule('*/5 * * * *', async () => {
  console.log('syncing ...');

  await syncPicklistValues();

  const users = localStorage.getItem('users');
  const promises = users.map(syncDataOverUserPermission);
  await Promise.all(promises);

  console.log('sync done');
});

module.exports = {
  syncPicklistValues,
  syncDataOverUserPermission
};
