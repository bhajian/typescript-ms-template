import {
  CorsHttpMethod,
  DomainName,
  HttpApi,
  HttpApiProps,
} from '@aws-cdk/aws-apigatewayv2-alpha'
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha'
import { Stack } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
  DnsValidatedCertificate,
} from 'aws-cdk-lib/aws-certificatemanager'
import { HttpMethod } from 'aws-cdk-lib/aws-events'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import {
  CfnHealthCheck,
  CfnRecordSet,
  HostedZone,
  IHostedZone,
} from 'aws-cdk-lib/aws-route53'
import { Construct } from 'constructs'
import * as path from 'path'

import { ConfigProps, getConfig } from '../config/getConfig'

export interface CustomDomainApiProps extends ConfigProps {
  subdomain: string
  httpApiProps?: HttpApiProps
  failover: 'PRIMARY' | 'SECONDARY'
}

/**
 * Create an HTTP API with a custom domain name.
 * Automatically creates the required SSL certificate for the domain.
 */
export class CustomDomainApi extends Construct {
  public readonly api: HttpApi
  /** Includes subdomain */
  public readonly domainName: string
  public readonly certificate: Certificate
  public readonly hostedZone: IHostedZone

  constructor(scope: Construct, id: string, props: CustomDomainApiProps) {
    super(scope, id)
    const { env, subdomain, httpApiProps, failover } = props

    const { environmentDomainName, hostedZoneName, hostedZoneId } =
      getConfig(props)

    this.hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      zoneName: hostedZoneName,
      hostedZoneId: hostedZoneId,
    })

    this.domainName = `${subdomain}.${environmentDomainName}`

    this.certificate = new DnsValidatedCertificate(this, 'Certificate', {
      hostedZone: this.hostedZone,
      domainName: this.domainName,
      validation: CertificateValidation.fromDns(this.hostedZone),
    })

    const apiDomainName = new DomainName(this, 'DomainName', {
      domainName: this.domainName,
      certificate: this.certificate,
    })

    const apiName = env ? `${env}-${id}` : id

    this.api = new HttpApi(this, apiName, {
      ...httpApiProps,
      defaultDomainMapping: {
        domainName: apiDomainName,
      },
      corsPreflight: {
        allowCredentials: true,
        allowHeaders: ['*'],
        allowMethods: [CorsHttpMethod.ANY],
        allowOrigins: [
          'http://localhost:3000', // local development
        ],
      },
    })

    const healthCheckLambda = new NodejsFunction(this, 'HealthCheck', {
      entry: path.join(__dirname, '..', 'health-check', 'index.js'),
      environment: {
        STATUS: 'OK',
      },
    })

    this.api.addRoutes({
      path: '/health',
      methods: [HttpMethod.GET],
      integration: new HttpLambdaIntegration(
        'HealthCheckIntegration',
        healthCheckLambda
      ),
    })

    const region = Stack.of(this).region
    const apiUrl = `${this.api.apiId}.execute-api.${region}.amazonaws.com`
    const cfnHealthCheck = new CfnHealthCheck(this, 'CfnHealthCheck', {
      healthCheckConfig: {
        type: 'HTTPS',
        fullyQualifiedDomainName: apiUrl,
        requestInterval: 30,
        resourcePath: '/health',
      },
    })

    new CfnRecordSet(this, 'CfnRecordSet', {
      name: this.domainName,
      type: 'CNAME',
      healthCheckId: cfnHealthCheck.attrHealthCheckId,
      hostedZoneId: this.hostedZone.hostedZoneId,
      failover: failover,
      resourceRecords: [apiDomainName.regionalDomainName],
      ttl: '60',
      setIdentifier: region, // uniquely identify by region
    })
  }
}
