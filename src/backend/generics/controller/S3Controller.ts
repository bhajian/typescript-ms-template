import { S3Event } from 'aws-lambda'

/**
 * Generic S3 Event controller class. Has one method for processsing the event and
 * returning the result. Used by `createS3Handler`.
 */
export interface S3Controller {
  processEvent(event: S3Event): Promise<void>
}
