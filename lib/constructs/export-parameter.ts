import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

import { ConfigProps } from '../config/getConfig'

export interface ExportParameterProps extends ConfigProps {
  name: string
  value: string
}

export class ExportParameter extends Construct {
  constructor(scope: Construct, id: string, props: ExportParameterProps) {
    super(scope, id)
    const { env, name, value } = props

    const parameterName = env ? `/${env}/${name}` : name

    new StringParameter(this, id, {
      parameterName: parameterName,
      stringValue: value,
    })
  }
}
