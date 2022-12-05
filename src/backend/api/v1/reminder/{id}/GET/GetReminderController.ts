import { Identity } from 'aws-cdk-lib/aws-ses'
import { APIGatewayProxyEvent } from 'aws-lambda'

import { ApiController } from '../../../../../generics/controller'
import { ExternalError } from '../../../../../generics/error/ExternalError'
import {
  GetReminderResponse,
  ReminderService,
} from '../../../../../services/reminder'

export class GetReminderController
  implements ApiController<undefined, GetReminderResponse>
{
  async processEvent(event: APIGatewayProxyEvent): Promise<GetReminderResponse> {

    const id = this.validateParameter(event)
    return await ReminderService.get({ id: id })
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
