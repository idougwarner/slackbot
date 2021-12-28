const localStorage = require('./local-storage');

const getCommonBlocks = (userId) => {
  recordTypes = localStorage.getItem('case_record_type_picklist');
  userData = localStorage.getItem(`${userId}-data`);

  return [
    {
      block_id: 'case_category',
      type: 'input',
      label: {
        type: 'plain_text',
        text: 'Category'
      },
      element: {
        type: 'static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select a category'
        },
        options: recordTypes.map((recordType) => ({
          text: {
            type: 'plain_text',
            text: recordType.label
          },
          value: recordType.value
        })),
        action_id: 'select_category'
      },
      dispatch_action: true
    },
    {
      type: 'divider'
    },
    {
      block_id: 'case_account',
      type: 'input',
      label: {
        type: 'plain_text',
        text: 'Teams'
      },
      element: {
        type: 'static_select',
        placeholder: {
          type: 'plain_text',
          text: 'Select a team'
        },
        options: userData.accounts.map((account) => ({
          text: {
            type: 'plain_text',
            text: account.label
          },
          value: account.value
        })),
        action_id: 'select_account'
      }
    }
  ];
};

const recordTypeNotDeterminedModal = ({
  userId,
  triggerId,
  metadata
}) => {
  return {
    trigger_id: triggerId,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Submit a ticket',
      },
      callback_id: 'record_type_not_determined_view',
      private_metadata: JSON.stringify(metadata),
      submit: {
        type: 'plain_text',
        text: 'Submit',
      },
      blocks: getCommonBlocks(userId)
    }
  };
};

const recordTypeDeterminedModal = ({
  viewId,
  hash,
  userId,
  recordTypeId,
  metadata
}) => {
  caseTypes = localStorage.getItem(`case_type_picklist_${recordTypeId}`);
  caseDetails = localStorage.getItem(`case_detail_picklist_${recordTypeId}`);
  casePriorities = localStorage.getItem(`case_priority_picklist_${recordTypeId}`);
  caseWorkLocations = localStorage.getItem(`case_work_location_picklist_${recordTypeId}`);

  return {
    view_id: viewId,
    hash,
    view: {
      type: "modal",
      title: {
        type: "plain_text",
        text: "Submit a ticket",
      },
      callback_id: "record_type_determined_view",
      private_metadata: typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
      submit: {
        type: "plain_text",
        text: "Submit",
      },
      blocks: [
        ...getCommonBlocks(userId),
        {
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Case Type'
          },
          element: {
            type: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select a type'
            },
            options: caseTypes.map((caseType) => ({
              text: {
                type: 'plain_text',
                text: caseType.label
              },
              value: caseType.value
            })),
            action_id: 'select_case_type'
          }
        },
        {
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Case Detail'
          },
          element: {
            type: 'multi_static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select details'
            },
            options: caseDetails.map((caseDetail) => ({
              text: {
                type: 'plain_text',
                text: caseDetail.label
              },
              value: caseDetail.value
            })),
            action_id: 'select_case_detail'
          }
        },
        {
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Subject'
          },
          element: {
            type: 'plain_text_input',
            action_id: 'input_case_subject'
          }
        },
        {
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Description'
          },
          element: {
            type: 'plain_text_input',
            multiline: true,
            action_id: 'input_case_description'
          }
        },
        {
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Due Date'
          },
          element: {
            type: 'datepicker',
            placeholder: {
              type: 'plain_text',
              text: 'Select a date'
            },
            action_id: 'select_due_date'
          }
        },
        {
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Priority'
          },
          element: {
            type: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select a priority'
            },
            options: casePriorities.map((casePriority) => ({
              text: {
                type: 'plain_text',
                text: casePriority.label
              },
              value: casePriority.value
            })),
            action_id: 'select_case_priority'
          }
        },
        {
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Work Location'
          },
          element: {
            type: 'static_select',
            placeholder: {
              type: 'plain_text',
              text: 'Select a work location'
            },
            options: caseWorkLocations.map((caseWorkLocation) => ({
              text: {
                type: 'plain_text',
                text: caseWorkLocation.label
              },
              value: caseWorkLocation.value
            })),
            action_id: 'select_case_work_location'
          }
        },
      ]
    }
  }
};

const createCaseCompletedMessage = (context) => {
  return [{
    type: 'section',
    text: {
      type: 'plain_text',
      text: 'A new ticket was successfully created'
    },
    accessory: {
      type: 'button',
      text: {
        type: 'plain_text',
        text: 'Click to see'
      },
      value: 'click_to_see',
      url: context.url
    }
  }];
};

const appHomeView = (context) => ({
  user_id: context.userId,
  view: {
    type: 'home',
    blocks: [{
      type: 'actions',
      elements: [{
        type: 'button',
        text: {
          type: 'plain_text',
          text: 'Connect Salesforce'
        },
        value: 'connect_salesforce',
        url: context.url
      }]
    }]
  }
});

module.exports = {
  recordTypeNotDeterminedModal,
  recordTypeDeterminedModal,
  createCaseCompletedMessage,
  appHomeView
};
