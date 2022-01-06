const cron = require('node-cron');
const salesforce = require('./salesforce');
const localStorage = require('./local-storage');

const syncDataOverUserPermission = async (userId) => {
  const { instanceUrl, accessToken, refreshToken } = localStorage.getItem(userId);
  const connection = salesforce.getConnectionByAccessToken(instanceUrl, accessToken, refreshToken);

  try {
    const accounts = await salesforce.getAccounts(connection);

    const recordTypes = await salesforce.getCaseObjectActiveRecordTypes(connection);
    const promises = recordTypes.map(async (recordType, index) => {
      const types = await salesforce.getTypePicklistByRecordType(connection, recordType.value);
      const details = await salesforce.getDetailPicklistByRecordType(connection, recordType.value);
      const priorities = await salesforce.getPriorityPicklistByRecordType(connection, recordType.value);
      const worklocations = await salesforce.getWorkLocationPicklistByRecordType(connection, recordType.value);
      const softwares = await salesforce.getSoftwarePicklistByRecordType(connection, recordType.value);
      recordTypes[index].types = types;
      recordTypes[index].details = details;
      recordTypes[index].priorities = priorities;
      recordTypes[index].worklocations = worklocations;
      recordTypes[index].softwares = softwares;
    });
    await Promise.all(promises);

    localStorage.setItem(`${userId}-data`, {
      accounts,
      caseRecordTypes: recordTypes
    });
  } catch (error) {
    console.error(error);
  }
};

cron.schedule('0 * * * *', async () => {
  console.log('syncing ...');

  const users = localStorage.getItem('users');
  const promises = users.map(syncDataOverUserPermission);
  await Promise.all(promises);

  console.log('sync done');
});

module.exports = {
  syncDataOverUserPermission
};
