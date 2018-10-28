import cors from '@koa/cors'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import { config } from './config'
import { logger } from './logger'
import { routes } from './routes'

const app = new Koa()

app.use(
  bodyParser({
    onerror(err, ctx) {
      ctx.throw('body parse error', 422)
    }
  })
)

app.use(logger)
app.use(
  cors({
    allowMethods: ['GET', 'POST'],
    credentials: true
  })
)

app.use(routes)
app.listen(config.port)

console.log(`undefined backend running on port ${config.port}`)
