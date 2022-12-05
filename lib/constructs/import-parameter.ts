import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

import { ConfigProps } from '../config/getConfig'

export interface ImportParameterProps extends ConfigProps {
  name: string
}

export class ImportParameter extends Construct {
  public readonly value: string

  constructor(scope: Construct, id: string, props: ImportParameterProps) {
    super(scope, id)
    const { env, name } = props

    const parameterName = env ? `/${env}/${name}` : name

    const parameter = StringParameter.fromStringParameterAttributes(
      this,
      parameterName,
      {
        parameterName: parameterName,
      }
    )

    this.value = parameter.stringValue
  }
}
