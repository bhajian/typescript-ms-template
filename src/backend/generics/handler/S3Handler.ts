import { Callback, Context, S3Event } from 'aws-lambda'

import { S3Controller } from '../controller'

export type S3Handler = (
  event: S3Event,
  context: Context,
  callback: Callback
) => Promise<void>

export function createS3Handler(controller: S3Controller): S3Handler {
  async function handler(
    event: S3Event,
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
