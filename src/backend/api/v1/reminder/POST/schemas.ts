import { JSONSchemaType } from 'ajv'

import {CreateReminderParams, CreateReminderResponse} from '../../../../services/reminder/types'

export const reminderReponseSchema: JSONSchemaType<CreateReminderResponse> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: {
      type: 'string',
      description: 'The id of the reminder',
    },
  },
}

export const reminderRequestSchema: JSONSchemaType<CreateReminderParams> = {
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
