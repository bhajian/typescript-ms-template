import { Callback, Context, SNSEvent } from 'aws-lambda'

import { SnsController } from '../controller'

export type SnsHandler = (
  event: SNSEvent,
  context: Context,
  callback: Callback
) => Promise<void>

export function createSnsHandler(controller: SnsController): SnsHandler {
  async function handler(
    event: SNSEvent,
    context: Context,
    callback: Callback
  ): Promise<void> {
    try {
      await controller.processEvent(event)
    } catch (err) {
      console.error(err)
    }
  }

  return handler
}
