#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import 'source-map-support/register'

import { Account } from '../lib/config/getConfig'
import { ReminderApiStack as ReminderApiStack } from '../lib/stacks/reminder-stack'
import { ReminderStatefulResourcesStack } from '../lib/stacks/reminder-stateful-resources-stack'
import { ReminderFrontendStack } from '../lib/stacks/reminder-frontend-stack'


const app = new cdk.App()

// Get account (dev, qa, prd)
const account: Account | undefined = app.node.tryGetContext('account')
if (account === undefined) {
  throw new Error(`No -c account=<dev | qa | prd> flag provided.`)
}
if (!['dev', 'qa', 'prd'].includes(account)) {
  throw new Error(`-c account must be one of: [dev, qa, prd]`)
}

// Get env (alex, yang, uat3, undefined)
const env: string | undefined = app.node.tryGetContext('env')
if (env === undefined) {
  console.warn(`No -c env=<env> flag provided. Defaulting to main stack.`)
}

const exampleStatefulResourcesStack = new ReminderStatefulResourcesStack(
  app,
  env ? `${env}-Example-StatefulResources` : 'Example-StatefulResources',
  {
    env,
    account,
    region: 'ca-central-1',
  },
  {
    env: {
      region: 'ca-central-1',
    },
  }
)

new ReminderApiStack(
  app,
  env ? `${env}-Reminder-Api` : 'Reminder-Api',
  {
    disasterRecovery: false,
    reminderTable: exampleStatefulResourcesStack.reminderTable,
    env,
    account,
    region: 'ca-central-1',
  },
  {
    env: {
      region: 'ca-central-1',
    },
  }
)

const reminderFrontendStack = new ReminderFrontendStack(
  app,
  env ? `${env}-reminder-frontend` : 'reminder-frontend',
  {
    env,
    account,
    region: 'us-east-1',
  },
  {
    env: {
      region: 'us-east-1',
    },
  }
)

// We need to be able to import the user pool parameters when building the website.
reminderFrontendStack.addDependency(exampleStatefulResourcesStack)
