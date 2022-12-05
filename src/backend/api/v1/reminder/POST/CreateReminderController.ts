import { Identity } from 'aws-cdk-lib/aws-ses'
import { APIGatewayProxyEvent } from 'aws-lambda'
import { JSONSchemaType } from 'ajv'
import { ApiController } from '../../../../generics/controller'
import { ExternalError } from '../../../../generics/error/ExternalError'
import {
  CreateReminderParams, CreateReminderResponse,
} from '../../../../services/reminder'

export class CreateReminderController
  implements ApiController<CreateReminderParams, CreateReminderResponse>
{
  async processEvent(
    event: APIGatewayProxyEvent,
    schema: JSONSchemaType<CreateReminderParams>
  ): Promise<CreateReminderResponse> {
    const id = this.validateParameter(event)


    return {id: id}
  }

  private validateParameter(event: APIGatewayProxyEvent): string {
    const id: string | undefined = event.pathParameters
      ? event['pathParameters']['id']
      : undefined
    if (!id) {
      throw new ExternalError(400, 'Path must contain path parameter `id`.')
    }
    return id
  }

}
