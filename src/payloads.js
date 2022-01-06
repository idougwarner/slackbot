const localStorage = require('./local-storage');

const getCommonBlocks = (userId) => {
  const userData = localStorage.getItem(`${userId}-data`);

  return [
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
    },
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
        options: userData.caseRecordTypes.map((recordType) => ({
          text: {
            type: 'plain_text',
            text: recordType.label
          },
          value: recordType.value
        })),
        action_id: 'select_category'
      },
      dispatch_action: true
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
  const userData = localStorage.getItem(`${userId}-data`);
  const recordType = userData.caseRecordTypes.find(recordType => recordType.value === recordTypeId);

  const softwareBlock = {
    type: 'input',
    label: {
      type: 'plain_text',
      text: 'Software'
    },
    element: {
      type: 'static_select',
      placeholder: {
        type: 'plain_text',
        text: 'Select software'
      },
      options: recordType.softwares.map((software) => ({
        text: {
          type: 'plain_text',
          text: software.label
        },
        value: software.value
      })),
      action_id: 'select_software'
    }
  };

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
            options: recordType.types.map((caseType) => ({
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
            options: recordType.details.map((caseDetail) => ({
              text: {
                type: 'plain_text',
                text: caseDetail.label
              },
              value: caseDetail.value
            })),
            action_id: 'select_case_detail'
          }
        },
        ...(recordType.label === 'Software' ? [softwareBlock] : []),
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
            options: recordType.priorities.map((casePriority) => ({
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
            text: '-'
          },
          element: {
            type: 'checkboxes',
            options: [{
              text: {
                type: 'plain_text',
                text: 'This is preventing me from doing my job'
              },
              value: 'job_preventing'
            }],
            action_id: 'select_job_preventing'
          },
          optional: true
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
            options: recordType.worklocations.map((caseWorkLocation) => ({
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
      url: context.url,
      action_id: 'url_button'
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
          text: context.hasSalesforceToken ? 'Reconnect Salesforce' : 'Connect Salesforce'
        },
        value: 'connect_salesforce',
        url: context.url,
        action_id: 'url_button'
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
