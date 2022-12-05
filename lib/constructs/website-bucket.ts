import { RemovalPolicy } from 'aws-cdk-lib'
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront'
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { Construct } from 'constructs'

import { ConfigProps } from '../config/getConfig'

export interface WebsiteBucketProps extends ConfigProps {
  sources: string[]
}

export class WebsiteBucket extends Construct {
  public readonly bucket: Bucket
  public readonly originAccessIdentity: OriginAccessIdentity

  constructor(scope: Construct, id: string, props: WebsiteBucketProps) {
    super(scope, id)

    this.bucket = new Bucket(this, 'Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    })

    this.originAccessIdentity = new OriginAccessIdentity(
      this,
      'OriginAccessIdentity'
    )
    this.bucket.grantRead(this.originAccessIdentity)

    new BucketDeployment(this, 'Deployment', {
      sources: props.sources.map((source) => Source.asset(source)),
      destinationBucket: this.bucket,
    })
  }
}
