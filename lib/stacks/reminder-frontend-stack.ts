import * as cdk from 'aws-cdk-lib'
import { execSync } from 'child_process'
import { Construct } from 'constructs'
import * as path from 'path'

import { ConfigProps } from '../config/getConfig'
import { ReminderFrontend } from '../constructs/reminder-frontend'

export interface ReminderFrontendStackProps extends ConfigProps {}

export class ReminderFrontendStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: ReminderFrontendStackProps,
    stackProps?: cdk.StackProps
  ) {
    super(scope, id, stackProps)
    const { account, env } = props

    execSync(
      `npx ts-node getConfig.ts ${account ?? ''} ca-central-1 ${env ?? ''}`,
      {
        cwd: path.join(__dirname, '..', '..', 'src', 'frontend', 'scripts'),
        stdio: 'inherit',
      }
    )

    execSync(`yarn build`, {
      cwd: path.join(__dirname, '..', '..', 'src', 'frontend'),
      stdio: 'inherit',
    })

    new ReminderFrontend(this, 'ExampleDashboard', props)
  }
}
