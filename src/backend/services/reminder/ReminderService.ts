import {GetReminderParams, ReminderEntity, GetReminderResponse} from '.'
import { Env } from '../env'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { UserData } from 'aws-cdk-lib/aws-ec2'
import { ExternalError } from '../../generics/error'
import { nil } from 'ajv'
const docClient = new DocumentClient()

export class ReminderService {
  static async get(body: GetReminderParams): Promise<GetReminderResponse> {
    // Referencing dynamo table from env variables
    const table = Env.get('REMINDER_TABLE')
    var params = {
      TableName: table,
      Key: {
        id: body.id,
      },
    }
    const response = await docClient.get(params).promise()
    const data = response.Item

    if(data === undefined) {
      throw new ExternalError(404, 'I didnt find the object')
    }

    return {
      name: `${data.name}`,
      description: `${data.description}`
    }
  }

  static async create(params: GetReminderParams): Promise<ReminderEntity> {

    return {
      id: "",
      name: "",
      description: ""
    }
  }

}
