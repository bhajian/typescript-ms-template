import {
  HttpMethod,
  IHttpRouteAuthorizer,
} from '@aws-cdk/aws-apigatewayv2-alpha'
import {
  HttpIamAuthorizer,
  HttpJwtAuthorizer,
  HttpUserPoolAuthorizer,
} from '@aws-cdk/aws-apigatewayv2-authorizers-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { aws_lambda_nodejs, Duration, Stack } from 'aws-cdk-lib'
import {
  Effect,
  IGrantable,
  IPrincipal,
  PolicyStatement,
} from 'aws-cdk-lib/aws-iam'
import { IFunction } from 'aws-cdk-lib/aws-lambda'
import { Construct } from 'constructs'
import * as pathLib from 'path'

import {
  DocumentationGenerator,
  OpenApiRouteSpec,
  SecurityScheme,
} from '../../src/backend/docs'
import { ConfigProps } from '../config/getConfig'
import { CustomDomainApi } from './custom-domain-api'

export interface LambdaApiRouteProps extends ConfigProps {
  /** The HttpApi instance to attach routes to. */
  api: CustomDomainApi
  /** The API path for this route, beginning with / */
  path: string
  /** The method for this route */
  method: HttpMethod
  /** Auth for the route */
  authorizer?: IHttpRouteAuthorizer
  /** Scopes for the route */
  authorizationScopes?: Array<string>
  /** Environment variables to pass to Lambda handler */
  environment?: Record<string, string>
  /** Memory (MB) to assign to the lambda */
  memorySize?: number
}

/**
 * Create an API route backed by a lambda function.
 */
export class LambdaApiRoute extends Construct implements IGrantable {
  public readonly lambda: IFunction
  public readonly grantPrincipal: IPrincipal
  public readonly docs: OpenApiRouteSpec

  constructor(scope: Construct, id: string, props: LambdaApiRouteProps) {
    const {
      api,
      path,
      method,
      authorizer,
      authorizationScopes,
      environment,
      memorySize,
    } = props
    super(scope, id)

    if (!path.startsWith('/')) {
      throw new Error('`path` must begin with /')
    }

    const apiEntry = pathLib.resolve(
      pathLib.join(__dirname, '..', '..', 'src', 'backend', 'api')
    )

    const pathWithoutLeadingSlash = path.replace(/^\//, '')

    // Entry points are defined like <entry>/<path>/<method>/handler.ts
    const handlerEntry = pathLib.join(
      apiEntry,
      pathWithoutLeadingSlash,
      method,
      'handler.ts'
    )

    this.lambda = new aws_lambda_nodejs.NodejsFunction(this, 'Lambda', {
      entry: handlerEntry,
      environment,
      timeout: Duration.seconds(30),
      memorySize: memorySize ?? 512,
    })
    this.lambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['execute-api:Invoke'],
        resources: [
          Stack.of(this).formatArn({
            service: 'execute-api',
            resource: '*',
            resourceName: `*/*/*`,
          }),
        ],
      })
    )

    // Allows us to call resource.grantAction(route)
    this.grantPrincipal = this.lambda.grantPrincipal

    const integration = new HttpLambdaIntegration('Integration', this.lambda)

    api.api.addRoutes({
      methods: [method],
      path: path,
      integration,
      authorizer,
      authorizationScopes,
    })

    // Add docs docs
    let securityScheme: SecurityScheme | undefined = undefined
    if (authorizer instanceof HttpIamAuthorizer) {
      securityScheme = SecurityScheme.IAM
    } else if (
      authorizer instanceof HttpUserPoolAuthorizer ||
      authorizer instanceof HttpJwtAuthorizer
    ) {
      securityScheme = SecurityScheme.JWT
    }

    this.docs = DocumentationGenerator.generateOpenApiRouteSpec({
      handlerEntry,
      securityScheme,
      authorizationScopes,
    })
    console.debug(this.docs)
  }
}
