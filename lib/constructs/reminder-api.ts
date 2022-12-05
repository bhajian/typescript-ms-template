import { HttpIamAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha'
import { HttpMethod } from 'aws-cdk-lib/aws-events'
import { Construct } from 'constructs'

import { DocumentationGenerator, OpenApiSpec } from '../../src/backend/docs'
import { ConfigProps } from '../config/getConfig'
import { CustomDomainApi } from './custom-domain-api'
import { ReminderTable } from './reminder-table'
import { LambdaApiRoute, LambdaApiRouteProps } from './lambda-api-route'

export interface ReminderApiProps extends ConfigProps {
  disasterRecovery: boolean
  reminderTable: ReminderTable
}

/**
 * Create an HTTP API with a custom domain name.
 * Automatically creates the required SSL certificate for the domain.
 */
export class ReminderApi extends Construct {
  private readonly routes: LambdaApiRoute[]
  public readonly docs: OpenApiSpec

  constructor(scope: Construct, id: string, props: ReminderApiProps) {
    super(scope, id)
    this.routes = []

    const { reminderTable: reminderTable } = props

    const api = new CustomDomainApi(this, 'ReminderApi', {
      ...props,
      subdomain: 'reminder.api',
      failover: props.disasterRecovery ? 'SECONDARY' : 'PRIMARY',
    })

    const reminderAuthorizer = new HttpIamAuthorizer()

    const getReminderRoute = this.addRoute('GetReminder', {
      ...props,
      api,
      method: HttpMethod.GET,
      path: '/v1/reminder/{id}',
      authorizer: undefined,
      environment: {
        REMINDER_TABLE: reminderTable.tableName,
      },
    })

    reminderTable.grantFullAccess(getReminderRoute)

    // Generate API documentation
    this.docs = DocumentationGenerator.generateOpenApiSpec({
      routeSpecs: this.routes.map((route) => route.docs),
      baseUrl: api.domainName,
    })
    // Save output files
    DocumentationGenerator.generateOutputFiles(this.docs)
  }

  /**
   * Create a LambdaApiRoute and save it to this API's list of routes.
   * Use this method if you want the route you are adding to be included the
   * API's auto-generated documentation. If you do not use this method, the
   * route will not automatically be documented.
   *
   * @param id The logical ID of the route
   * @param props Props to pass to LambdaApiRoute constructor
   * @returns The newly created LambdaAPIRoute
   */
  private addRoute(id: string, props: LambdaApiRouteProps): LambdaApiRoute {
    const lambdaApiRoute = new LambdaApiRoute(this, id, props)
    this.routes.push(lambdaApiRoute)
    return lambdaApiRoute
  }
}
