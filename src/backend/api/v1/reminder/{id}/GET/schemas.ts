import { JSONSchemaType } from 'ajv'

import { GetReminderResponse } from '../../../../../services/reminder'

export const reminderReponseSchema: JSONSchemaType<GetReminderResponse> = {
  type: 'object',
  required: ['name', 'description'],
  properties: {
    name: {
      type: 'string',
      description: 'The name of the reminder',
    },
    description: {
      type: 'string',
      description: 'The description of the reminder',
    },
  },
}
