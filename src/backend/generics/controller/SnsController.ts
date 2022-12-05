import { SNSEvent } from 'aws-lambda'

/**
 * SNS event controller class. Has one method for processsing an SNS event
 * Used by `createSnsHandler`. The generic type T is the type for the body.
 */
export interface SnsController {
  processEvent(event: SNSEvent): Promise<void>
}
