import dotenv from 'dotenv'
dotenv.config({})

export enum BuildType {
  Production = 'prod',
  Development = 'dev',
  Test = 'test'
}

function getBuildType(env: NodeJS.ProcessEnv) {
  switch (env.BUILD_TYPE) {
    case 'prod':
      return BuildType.Production
    case 'dev':
      return BuildType.Development
    case 'test':
    default:
      return BuildType.Test
  }
}

const buildType = getBuildType(process.env)

export const config = {
  authSecret: process.env.AUTH_SECRET,
  awsID: process.env.AWS_ACCESS_KEY_ID,
  buildType,
  dynamoSecret: process.env.DYNAMO_SECRET,
  logLevel: buildType === BuildType.Production ? 0 : 4,
  port: buildType === BuildType.Production ? 7331 : 7337,
  prettyPrint: buildType !== BuildType.Production,
  weatherAPIKey: process.env.WEATHER_API_KEY
}
