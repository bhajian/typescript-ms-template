import aws4Interceptor, { Credentials } from 'aws4-axios'
import axios, { AxiosInstance } from 'axios'

import { Env } from '../env'

export interface SignedClientProps {
  region?: string
  service?: 'es' | 'execute-api'
  credentials?: Credentials
}

/**
 * Creates an AWS4 signed Axios client that passes along AWS credentials
 * with each HTTP request.
 */
export function createSignedClient({
  region,
  service,
  credentials,
}: SignedClientProps): AxiosInstance {
  const client = axios.create()
  const interceptor = aws4Interceptor(
    {
      region: region ?? Env.get('AWS_REGION'),
      service: service ?? 'execute-api',
    },
    credentials
  )
  client.interceptors.request.use(interceptor)
  return client
}
