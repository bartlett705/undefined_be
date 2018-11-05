import dotenv from 'dotenv'
dotenv.config({})

export enum BuildType {
  Production = 'prod',
  Development = 'dev',
  Test = 'test'
}

function getBuildType(env: NodeJS.ProcessEnv) {
  switch (env.buildType) {
    case 'prod':
      return BuildType.Production
    case 'dev':
      return BuildType.Development
    case 'test':
      return BuildType.Test
  }
}

const buildType = getBuildType(process.env)

export const config = {
  authSecret: process.env.AUTH_SECRET,
  awsID: process.env.AWS_ACCESS_KEY_ID,
  buildType,
  dynamoSecret: process.env.DYNAMO_SECRET,
  logLevel: 4,
  port: process.env.PORT || 7331,
  prettyPrint: true,
  weatherAPIKey: process.env.WEATHER_API_KEY
}
