import { JSONSchemaType } from 'ajv'
import { SQSEvent } from 'aws-lambda'

/**
 * SQS event controller class. Has one method for processsing an SQS event
 * Used by `createSqsHandler`. The generic type T is the type for the body.
 *
 * The implementation of the Controller class is responsible for using the
 * `schema` parameter of `processEvent` to perform validation. However, this
 * is not enforced. There is a `validate` function that uses Ajv that can be
 * used to validate the body of the request in the `validate` folder.
 */
export interface SqsController<T> {
  processEvent(
    event: SQSEvent,
    schema: T extends undefined ? undefined : JSONSchemaType<T>
  ): Promise<void>
}
