const axios = require('axios').default;
const jsforce = require('jsforce'); //jsforce open source library to connect to Salesforce

const config = require('./config');

// Create Salesforce Connection
const oauth2 = new jsforce.OAuth2({
	loginUrl: config.sfdc.loginUrl,
	clientId: process.env.SALESFORCE_CLIENT_ID,
	clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
	redirectUri: `${process.env.SLACK_APP_URL}/salesforce/oauth_redirect`,
});

const getAuthorizeUrl = (options = {}) => oauth2.getAuthorizationUrl(options);

const getConnectionByAuthCode = async (code) => {
	const connection = new jsforce.Connection({ oauth2 });
	await connection.authorize(code);

	return connection;
};

const getConnectionByAccessToken = (instanceUrl, accessToken, refreshToken) =>
	new jsforce.Connection({
		oauth2,
		instanceUrl,
		accessToken,
		refreshToken,
	});

const getConnectionByUsernameAndPassword = async () => {
	const result = await axios({
		method: 'post',
		url: `${config.sfdc.loginUrl}/services/oauth2/token?grant_type=password&client_id=${config.sfdc.clientId}&client_secret=${config.sfdc.clientSecret}&username=${config.sfdc.username}&password=${config.sfdc.password}${config.sfdc.securityToken}`,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});
	const { instance_url: instanceUrl, access_token: accessToken } =
		result.data;
	return getConnectionByAccessToken(instanceUrl, accessToken);
};

const getAccounts = async (connection) => {
	try {
		const { records } = await connection.query(
			"SELECT Id, Name FROM Account WHERE Stage__c != 'Terminated' AND RecordTypeId = '0123i0000005iQmAAI'"
		);
		return records
			.map((record) => ({
				label: record.Name,
				value: record.Id,
			}))
			.sort((a, b) => (a.label < b.label ? -1 : 1));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getCaseObjectActiveRecordTypes = async (connection) => {
	try {
		const { recordTypeInfos } = await connection.request(
			'/services/data/v53.0/ui-api/object-info/Case'
		);
		return Object.keys(recordTypeInfos)
			.map((id) => recordTypeInfos[id])
			.filter((recordTypeInfo) => recordTypeInfo.available)
			.map((recordTypeInfo) => ({
				label: recordTypeInfo.name,
				value: recordTypeInfo.recordTypeId,
			}))
			.sort((a, b) => (a.label < b.label ? -1 : 1));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getTypePicklistByRecordType = async (connection, recordTypeId) => {
	try {
		const { values } = await connection.request(
			`/services/data/v53.0/ui-api/object-info/Case/picklist-values/${recordTypeId}/Type`
		);
		return values
			.map((value) => ({
				label: value.label,
				value: value.value,
			}))
			.sort((a, b) => (a.label < b.label ? -1 : 1));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getDetailPicklistByRecordType = async (connection, recordTypeId) => {
	try {
		const { values } = await connection.request(
			`/services/data/v53.0/ui-api/object-info/Case/picklist-values/${recordTypeId}/Case_Detail__c`
		);
		return values
			.map((value) => ({
				label: value.label,
				value: value.value,
			}))
			.sort((a, b) => (a.label < b.label ? -1 : 1));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getPriorityPicklistByRecordType = async (connection, recordTypeId) => {
	try {
		const { values } = await connection.request(
			`/services/data/v53.0/ui-api/object-info/Case/picklist-values/${recordTypeId}/Priority`
		);
		return values
			.map((value) => ({
				label: value.label,
				value: value.value,
			}))
			.sort((a, b) => (a.label < b.label ? -1 : 1));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getWorkLocationPicklistByRecordType = async (
	connection,
	recordTypeId
) => {
	try {
		const { values } = await connection.request(
			`/services/data/v53.0/ui-api/object-info/Case/picklist-values/${recordTypeId}/Work_Location__c`
		);
		return values
			.map((value) => ({
				label: value.label,
				value: value.value,
			}))
			.sort((a, b) => (a.label < b.label ? -1 : 1));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const getSoftwarePicklistByRecordType = async (connection, recordTypeId) => {
	try {
		const { values } = await connection.request(
			`/services/data/v53.0/ui-api/object-info/Case/picklist-values/${recordTypeId}/Software__c`
		);
		return values
			.map((value) => ({
				label: value.label,
				value: value.value,
			}))
			.sort((a, b) => (a.label < b.label ? -1 : 1));
	} catch (error) {
		console.error(error);
		return [];
	}
};

const createCase = (connection, payload) =>
	connection.sobject('Case').create(payload);

const getCase = (connection, caseId) =>
	connection.sobject('Case').retrieve(caseId);

module.exports = {
	getConnectionByUsernameAndPassword,
	getConnectionByAuthCode,
	getAuthorizeUrl,
	getConnectionByAccessToken,
	getAccounts,
	getCaseObjectActiveRecordTypes,
	getTypePicklistByRecordType,
	getDetailPicklistByRecordType,
	getPriorityPicklistByRecordType,
	getWorkLocationPicklistByRecordType,
	getSoftwarePicklistByRecordType,
	createCase,
	getCase,
};
