import { JSONSchemaType } from 'ajv'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
} from 'aws-lambda'

import { ApiController } from '../controller'
import { ExternalError, InternalError } from '../error'

export type ApiHandler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback
) => Promise<APIGatewayProxyResult>

export interface RouteSpec<T, K> {
  /** A short description */
  summary: string
  /** A longer description */
  description?: string
  // if the request body type T is undefined then requestContentType is also undefined
  requestContentType: T extends undefined ? undefined : string
  responseContentType: K extends undefined | void ? undefined : string
  responseHeaders?: Record<string, string>
  successCode: number
  errorCodes: Array<number>
  requestBodySchema: T extends undefined ? undefined : JSONSchemaType<T>
  responseBodySchema: K extends undefined | void ? undefined : JSONSchemaType<K>
  isBase64Encoded: boolean
}

export function createApiHandler<T, K>(
  controller: ApiController<T, K>,
  spec: RouteSpec<T, K>
): ApiHandler {
  async function handler(
    event: APIGatewayProxyEvent,
    context: Context,
    callback: Callback
  ): Promise<APIGatewayProxyResult> {
    try {
      const response = await controller.processEvent(
        event,
        spec.requestBodySchema
      )

      const body: string =
        typeof response === 'string'
          ? response
          : JSON.stringify(response, undefined, 2)

      const result: APIGatewayProxyResult = {
        statusCode: spec.successCode ?? 200,
        body: body,
        headers: {
          ...spec.responseHeaders,
          ...(spec.responseContentType && {
            'content-type': spec.responseContentType,
          }),
        },
        isBase64Encoded: spec.isBase64Encoded ?? false,
      }

      return result
    } catch (err) {
      console.error(err)

      // forward ExternalErrors to users
      if (err instanceof ExternalError) {
        return {
          statusCode: err.statusCode,
          body: err.message,
        }
        // hide InternalErrors from users
      } else if (err instanceof InternalError) {
        return {
          statusCode: 500,
          // body: err.message, // temp for faster error debugging
          body: 'Internal Server Error',
        }
      } else {
        return {
          statusCode: 500,
          body: 'Internal Server Error',
        }
      }
    }
  }

  return handler
}
