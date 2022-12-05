import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { ConfigProps } from '../config/getConfig'
import { ReminderApi, ReminderApiProps } from '../constructs/reminder-api'

export interface ReminderApiStackProps extends ConfigProps, ReminderApiProps {}

export class ReminderApiStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ReminderApiStackProps,
    stackProps?: cdk.StackProps
  ) {
    super(scope, id, stackProps)

    new ReminderApi(this, 'ReminderApi', props)
  }
}
