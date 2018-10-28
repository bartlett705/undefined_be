import Koa from 'koa'
import Router from 'koa-router'
import { config } from './config'
import { CLIRequestBody, CLIResponse, CLIResponseType } from './models/cli'
import { authUser } from './user'

const router = new Router()

router.get('/', (ctx: Koa.Context) => console.log('foo'))

router.post('/', async (ctx: Koa.Context) => {
  const { body } = ctx.request
  const { response } = ctx

  if (!body || typeof body !== 'object') {
    response.status = 412
    return
  }

  const { input } = body as CLIRequestBody

  if (!input) {
    response.status = 409
    return
  }

  response.status = 200

  let content: CLIResponse['content'] = ['> Wat?  \n']
  let type: CLIResponse['type'] = CLIResponseType.Info
  const [command, ...args] = input.split(' ')

  switch (command.toLowerCase()) {
    case 'ls':
      type = CLIResponseType.Info
      content = [
        '-= PUBLICLY AVAILABLE COMMANDS =-  ',
        '> type a command and --help for more info  ',
        '[ login read post cv ]  '
      ]
      break
    case 'login':
      const username = args[0]
      if (!username) {
        type = CLIResponseType.Error
        content = ['> Might help to tell me who you are... ']
      } else if (username === 'ahmad') {
        type = CLIResponseType.Success
        content = ['> Hey dude!  ']
      } else {
        ({ type, content } = await authUser(username, ctx))
      }
      break
    default:
  }

  response.body = JSON.stringify({ content, type })
})

export const routes = router.routes()
