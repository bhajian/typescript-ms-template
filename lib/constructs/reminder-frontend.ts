import { Construct } from 'constructs'
import * as path from 'path'

import { ConfigProps } from '../config/getConfig'
import { CloudfrontS3Website } from './cloudfront-s3-website'
import { WebsiteBucket } from './website-bucket'

export interface ReminderFrontendProps extends ConfigProps {}

export class ReminderFrontend extends Construct {
  constructor(scope: Construct, id: string, props: ReminderFrontendProps) {
    super(scope, id)

    const websiteBucket = new WebsiteBucket(this, 'WebsiteBucket', {
      ...props,
      sources: [path.join(__dirname, '..', '..', 'src', 'frontend', 'build')],
    })

    new CloudfrontS3Website(this, 'CloudFront', {
      ...props,
      subdomain: 'reminder',
      websiteBucket,
    })
  }
}
