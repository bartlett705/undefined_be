import cors from '@koa/cors'
import AWS from 'aws-sdk'
import chalk from 'chalk'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import statuses from 'statuses'
import { BuildType, config } from './config'
import { Logger, requestLoggerMiddleware } from './logger'
import { routes } from './routes'

const logger = new Logger(config.logLevel)

export const dynamodb = new AWS.DynamoDB({
  accessKeyId: config.awsID,
  region: 'us-west-2',
  secretAccessKey: config.dynamoSecret
})

const app = new Koa()

// The meanies at KOA won't let us use non-standard http codes without this hack.
statuses[223] = 'Alive'
statuses.codes.push(223)
statuses.Alive = 223

app.use(
  bodyParser({
    onerror(err, ctx) {
      logger.error('Body Parser shat:', err)
      ctx.throw('body parse error', 422)
    }
  })
)

app.use(requestLoggerMiddleware(logger))
app.use(
  cors({
    allowMethods: ['GET', 'POST'],
    credentials: true
  })
)

app.use(routes)
app.listen(config.port)

logger.warn('hi yall ^_^')
console.log(
  chalk.greenBright(`undefined backend is running on port ${config.port} | `),
  chalk.greenBright('build type:'),
  config.buildType === BuildType.Production
    ? chalk.redBright('PROD')
    : chalk.yellowBright(config.buildType)
)
