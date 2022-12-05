import { createApiHandler, RouteSpec } from '../../../../../generics/handler'
import { GetReminderResponse } from '../../../../../services/reminder'
import { GetReminderController } from './GetReminderController'
import { reminderReponseSchema } from './schemas'

export const spec: RouteSpec<undefined, GetReminderResponse> = {
  summary: 'Reminder Get',
  description: 'Get a reminder by ID.',
  requestBodySchema: undefined,
  requestContentType: undefined,
  responseBodySchema: reminderReponseSchema,
  responseContentType: 'application/json',
  successCode: 200,
  errorCodes: [401, 403, 404, 500],
  isBase64Encoded: false,
}

export const handler = createApiHandler<undefined, GetReminderResponse>(
  new GetReminderController(),
  spec
)
