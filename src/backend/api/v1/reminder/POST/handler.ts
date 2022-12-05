import { createApiHandler, RouteSpec } from '../../../../generics/handler'
import {CreateReminderParams, CreateReminderResponse} from '../../../../services/reminder'
import { CreateReminderController } from './CreateReminderController'
import {reminderReponseSchema, reminderRequestSchema} from './schemas'

export const spec: RouteSpec<CreateReminderParams, CreateReminderResponse> = {
  summary: 'Create Reminder',
  description: 'Creates a reminder object.',
  requestBodySchema: reminderRequestSchema,
  requestContentType: 'application/json',
  responseBodySchema: reminderReponseSchema,
  responseContentType: 'application/json',
  successCode: 200,
  errorCodes: [401, 403, 404, 500],
  isBase64Encoded: false,
}

export const handler = createApiHandler<CreateReminderParams, CreateReminderResponse>(
  new CreateReminderController(),
  spec
)
