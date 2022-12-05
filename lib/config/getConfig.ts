import { CachePolicy, ICachePolicy } from 'aws-cdk-lib/aws-cloudfront'

export type Account = 'dev' | 'qa' | 'prd'
export type Env = string | undefined

export interface ConfigProps {
  account: Account
  env: Env
  region: string
}

export interface Config {
  hostedZoneName: string
  hostedZoneId: string
  environmentDomainName: string
  v1KeyToAccountIdSecretArn: string
  cachePolicy: ICachePolicy
}

const rootHostedZoneNames: Record<Account, string> = {
  dev: 'applyproof.dev',
  qa: 'applyproof.xyz',
  prd: 'applyproof.com',
}

const rootHostedZoneIds: Record<Account, string> = {
  dev: 'Z05792265Y2G9JVHB3CL',
  qa: 'Z0051308DHV9MMU51STN',
  prd: 'Z072046633GA9GHDV1TA3',
}

const v1KeyToAccountIdSecretArns: Record<Account, string> = {
  dev: 'arn:aws:secretsmanager:ca-central-1:969776126790:secret:v1KeyToAccountId-x1HdZp',
  qa: 'arn:aws:secretsmanager:ca-central-1:916318772357:secret:V1KeyToAccountId-PVYi6o',
  prd: 'arn:aws:secretsmanager:ca-central-1:775740481686:secret:V1KeyToAccountId-BDhQCy',
}

export function getConfig({ account, env }: ConfigProps): Config {
  const environmentDomainName = env
    ? `${env}.${rootHostedZoneNames[account]}`
    : rootHostedZoneNames[account]

  const cachePolicy =
    account !== 'dev' && env === undefined
      ? CachePolicy.CACHING_OPTIMIZED
      : CachePolicy.CACHING_DISABLED

  return {
    hostedZoneName: rootHostedZoneNames[account],
    hostedZoneId: rootHostedZoneIds[account],
    environmentDomainName: environmentDomainName,
    v1KeyToAccountIdSecretArn: v1KeyToAccountIdSecretArns[account],
    cachePolicy: cachePolicy,
  }
}
