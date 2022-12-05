import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

import { ConfigProps } from '../config/getConfig'
import { ReminderTable } from '../constructs/reminder-table'

export interface ReminderStatefulResourcesStackProps extends ConfigProps {}

export class ReminderStatefulResourcesStack extends cdk.Stack {
  public readonly reminderTable: ReminderTable

  constructor(
    scope: Construct,
    id: string,
    props: ReminderStatefulResourcesStackProps,
    stackProps?: cdk.StackProps
  ) {
    super(scope, id, stackProps)

    this.reminderTable = new ReminderTable(this, 'ReminderTable', props)
  }
}
