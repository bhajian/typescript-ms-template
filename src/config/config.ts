import cognitoConfig from './config.json'
export const config = getEnvironmentConfiguration()

type Configuration = {
  hostedZoneName: string
}

function getEnvironmentConfiguration(): Configuration {
  return {
    hostedZoneName: cognitoConfig.hostedZoneName,
  }
}
