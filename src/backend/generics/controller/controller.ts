import { JSONSchemaType } from 'ajv'
import { APIGatewayProxyEvent } from 'aws-lambda'

/**
 * Generic controller class. Has one method for processsing the event and
 * returning the result. Used by `createHandler`. The generic type T is the
 * type for the body and the generic type K is the type for the response.
 * If the controller is for a GET route (no data to process) then the generic
 * T can be set to undefined and the `schema` parameter of processEvent can be
 * left as undefined as well.
 *
 * The implementation of the Controller class is responsible for using the
 * `schema` parameter of `processEvent` to perform validation. However, this
 * is not enforced. There is a `validate` function that uses Ajv that can be
 * used to validate the body of the request in the `validate` folder.
 */
export interface ApiController<T, K> {
  processEvent(
    event: APIGatewayProxyEvent,
    schema: T extends undefined ? undefined : JSONSchemaType<T>
  ): Promise<K>
}
