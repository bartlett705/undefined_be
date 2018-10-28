import Koa from 'koa'
import { config } from './config'
import { CLIRequestBody } from './models/cli'

interface LogData {
  data: any
  errorMessage: string
  errorStack: string
  host: string
  input: string
  method: string
  query: string
  remoteAddress: string
  responseTime: number
  statusCode: number
  url: string
  userAgent: string
}

function outputLog(data: Partial<LogData>, thrownError: any) {
  if (config.prettyPrint) {
    let annotation = ''
    if (data.url === '/' && data.method === 'POST') {
      annotation = `| "${data.input}" |`
    }
    console.log(
      `${data.statusCode} ${data.method} ${
        data.url === '/' ? annotation : data.url
      } - ${data.responseTime}ms`
    )
    if (thrownError) {
      console.error(thrownError)
    }
  } else if (data.statusCode < 400) {
    process.stdout.write(JSON.stringify(data) + '\n')
  } else {
    process.stderr.write(JSON.stringify(data) + '\n')
  }
}

export async function logger(ctx: Koa.Context, next: () => Promise<any>) {
  const start = new Date().getMilliseconds()
  console.warn(ctx.response.headers)
  const logData: Partial<LogData> = {
    host: ctx.headers.host,
    input:
      ctx.method === 'POST' &&
      ctx.request.body &&
      (ctx.request.body as CLIRequestBody).input,
    method: ctx.method,
    query: ctx.query,
    remoteAddress: ctx.request.ip,
    url: ctx.url,
    userAgent: ctx.headers['user-agent']
  }

  let errorThrown: any = null
  try {
    await next()
    logData.statusCode = ctx.status
  } catch (e) {
    errorThrown = e
    logData.errorMessage = e.message
    logData.errorStack = e.stack
    logData.statusCode = e.status || 500
    if (e.data) {
      logData.data = e.data
    }
  }

  logData.responseTime = new Date().getMilliseconds() - start
  outputLog(logData, errorThrown)

  if (errorThrown) {
    throw errorThrown
  }
}
