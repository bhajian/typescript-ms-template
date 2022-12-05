import { Fn, Stack } from 'aws-cdk-lib'
import { AttributeType, CfnGlobalTable } from 'aws-cdk-lib/aws-dynamodb'
import { Effect, IGrantable, PolicyStatement } from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

import { ConfigProps } from '../config/getConfig'

export interface ExampleTableProps extends ConfigProps {}

/**
 * Create an API route backed by a lambda function.
 */
export class ReminderTable extends Construct {
  public readonly table: CfnGlobalTable
  public readonly tableName: string

  constructor(scope: Construct, id: string, props: ExampleTableProps) {
    const {} = props
    super(scope, id)

    this.table = new CfnGlobalTable(this, 'ReminderTable', {
      attributeDefinitions: [
        {
          attributeName: 'id',
          attributeType: AttributeType.STRING,
        },
      ],
      keySchema: [
        {
          attributeName: 'id',
          keyType: 'HASH',
        },
      ],
      replicas: [
        {
          region: Stack.of(this).region,
        },
        // Enable if you want to deploy to new region
        // {
        //   region: 'eu-west-1',
        // },
      ],
      billingMode: 'PAY_PER_REQUEST',
    })

    // Do not use this.table.tableName, which is undefined
    this.tableName = Fn.select(1, Fn.split('/', this.table.attrArn))
  }

  public grantFullAccess<T extends IGrantable>(principal: T) {
    principal.grantPrincipal.addToPrincipalPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['dynamodb:*'],
        resources: [
          Stack.of(this).formatArn({
            service: 'dynamodb',
            region: '*',
            resource: 'table',
            resourceName: this.tableName,
          }),
          Stack.of(this).formatArn({
            service: 'dynamodb',
            region: '*',
            resource: 'table',
            resourceName: `${this.tableName}/*`,
          }),
        ],
      })
    )
  }
}
