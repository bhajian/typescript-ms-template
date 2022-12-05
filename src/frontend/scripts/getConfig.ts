/**
 * Generate config.json
 * Run like
 * npx ts-node getConfig.ts <account> <region> [<env>]
 */
import { SSM } from 'aws-sdk'
import * as fs from 'fs'
import * as path from 'path'

export type Account = 'dev' | 'qa' | 'prd'
export type Env = string | undefined

interface ConfigProps {
  account: Account
  env: Env
  region: string
}

interface ImportParameterParams extends ConfigProps {
  parameterName: string
}

type Config = {
  hostedZoneName: string
}

const rootHostedZoneNames: Record<Account, string> = {
  dev: 'applyproof.dev',
  qa: 'applyproof.xyz',
  prd: 'applyproof.com',
}

async function importParameter({
                                 env: environmentName,
                                 parameterName,
                                 region,
                               }: ImportParameterParams): Promise<string> {
  const qualifiedParameterName = environmentName
    ? `/${environmentName}/${parameterName}`
    : parameterName

  const ssm = new SSM({ region: region })
  const response = await ssm
    .getParameter({
      Name: qualifiedParameterName,
    })
    .promise()

  if (
    response.Parameter === undefined ||
    response.Parameter.Value === undefined
  ) {
    throw new Error(
      `Failed to fetch parameter ${qualifiedParameterName} in region ${region}`
    )
  }

  return response.Parameter.Value
}

async function getConfig(props: ConfigProps): Promise<void> {
  const { env, account } = props

  const environmentDomainName = env
    ? `${env}.${rootHostedZoneNames[account]}`
    : rootHostedZoneNames[account]

  const config: Config = {
    hostedZoneName: environmentDomainName,
  }

  await fs.promises.writeFile(
    path.join(__dirname, '../../../src/config/config.json'),
    JSON.stringify(config, undefined, 2)
  )
}

if (require.main === module) {
  const account: Account | undefined = process.argv[2] as Account
  if (account === undefined) {
    throw new Error(`Missing positional argument [1]: account`)
  }
  if (!['dev', 'qa', 'prd'].includes(account)) {
    throw new Error(
      `Bad positional argument [1]: account - ${account} must be one of: [dev, qa, prd]`
    )
  }
  const region: string | undefined = process.argv[3]
  if (region === undefined) {
    throw new Error(`Missing positional argument [2]: region`)
  }
  const env: Env = process.argv[4]
  if (env === undefined) {
    console.warn(
      `Missing positional argument [3]: env - defaulting to root domain.`
    )
  }
  getConfig({ account, env, region })
}
