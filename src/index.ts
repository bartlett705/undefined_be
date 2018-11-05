import cors from '@koa/cors'
import AWS from 'aws-sdk'
import chalk from 'chalk'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { config } from './config'
import { requestLoggerMiddleware } from './logger'
import { routes } from './routes'

export const dynamodb = new AWS.DynamoDB({
  accessKeyId: config.awsID,
  region: 'us-west-2',
  secretAccessKey: config.dynamoSecret
})

const app = new Koa()

app.use(
  bodyParser({
    onerror(err, ctx) {
      ctx.throw('body parse error', 422)
    }
  })
)

app.use(requestLoggerMiddleware)
app.use(
  cors({
    allowMethods: ['GET', 'POST'],
    credentials: true
  })
)

app.use(routes)
app.listen(config.port)

console.log(
  chalk.greenBright(`undefined backend running on port ${config.port}`)
)
