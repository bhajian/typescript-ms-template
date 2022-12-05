import { JSONSchemaType } from 'ajv'
import { Callback, Context, SQSEvent } from 'aws-lambda'

import { SqsController } from '../controller/SqsController'

export type SqsHandler = (
  event: SQSEvent,
  context: Context,
  callback: Callback
) => Promise<void>

export type CreateSqsHandlerParams<T> = {
  schema: T extends undefined ? undefined : JSONSchemaType<T>
}

export function createSqsHandler<T>(
  controller: SqsController<T>,
  params: CreateSqsHandlerParams<T>
): SqsHandler {
  async function handler(
    event: SQSEvent,
    context: Context,
    callback: Callback
  ): Promise<void> {
    const { schema } = params

    try {
      await controller.processEvent(event, schema)
    } catch (err) {
      console.error(err)
    }
  }

  return handler
}
