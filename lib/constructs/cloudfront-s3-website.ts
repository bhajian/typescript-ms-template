import { Duration } from 'aws-cdk-lib'
import {
  Certificate,
  CertificateValidation,
  DnsValidatedCertificate,
} from 'aws-cdk-lib/aws-certificatemanager'
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins'
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'
import { Construct } from 'constructs'
import * as path from 'path'

import { ConfigProps, getConfig } from '../config/getConfig'
import { CloudFrontAcl } from './cloudfront-acl'
import { WebsiteBucket } from './website-bucket'

export interface CloudfrontS3WebsiteProps extends ConfigProps {
  subdomain: string
  websiteBucket: WebsiteBucket
}

/**
 * Create an HTTP API with a custom domain name.
 * Automatically creates the required SSL certificate for the domain.
 */
export class CloudfrontS3Website extends Construct {
  public readonly distribution: Distribution
  /** Includes subdomain */
  public readonly domainName: string
  public readonly certificate: Certificate
  public readonly hostedZone: IHostedZone

  constructor(scope: Construct, id: string, props: CloudfrontS3WebsiteProps) {
    super(scope, id)
    const { subdomain } = props

    const { environmentDomainName, hostedZoneName, hostedZoneId, cachePolicy } =
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
    const addSecurityHeadersLambda = new Function(
      this,
      'AddSecurityHeadersHomePage',
      {
        code: FunctionCode.fromFile({
          filePath: path.join(
            __dirname,
            '..',
            'cloudfront-functions',
            'index.js'
          ),
        }),
      }
    )

    const cloudfrontAcl = new CloudFrontAcl(this, 'Acl', {
      requiresVpn: true,
    })

    this.distribution = new Distribution(this, 'Distribution', {
      domainNames: [this.domainName],
      certificate: this.certificate,
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
      ],
      defaultBehavior: {
        origin: new S3Origin(props.websiteBucket.bucket, {
          originAccessIdentity: props.websiteBucket.originAccessIdentity,
        }),
        functionAssociations: [
          {
            function: addSecurityHeadersLambda,
            eventType: FunctionEventType.VIEWER_RESPONSE,
          },
        ],
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachePolicy: cachePolicy,
        originRequestPolicy: OriginRequestPolicy.USER_AGENT_REFERER_HEADERS,
      },
      webAclId: cloudfrontAcl.acl.attrArn,
      enableLogging: false,
    })

    const recordName = props.env ? `${subdomain}.${props.env}` : subdomain
    new ARecord(this, 'ARecord', {
      recordName: recordName,
      zone: this.hostedZone,
      target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
    })
  }
}
