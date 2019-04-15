import Koa from 'koa'
import Router from 'koa-router'
import { BuildType, config } from './config'
import { Discord } from './discord'
import { Logger } from './logger'
import { addPost, getPosts } from './messages'
import { CLIRequestBody, CLIResponse, CLIResponseType } from './models/cli'
import { authUser } from './user'
import { getWeather } from './weather'

const discord = new Discord(
  'zAzr0RrAQJaxIQPGTv2upomPckrv-fIHPSVXXK-SU59njoFrfgiBTrFrLBwkoMzvelhD',
  '540041433827246081'
)
const router = new Router()
router.get('/', (ctx: Koa.Context) =>
  ctx.state.logger.warn('!random getter detected!')
)

router.get('/healthcheck', (ctx: Koa.Context) => {
  ctx.status = 200
  ctx.body = 'pongHi'
  return
})

router.post('/', createCLIRoute())
router.post('/staging', createCLIRoute(true))

export const routes = router.routes()
function createCLIRoute(staging = false): Router.IMiddleware {
  return async (ctx: Koa.Context) => {
    const logger = ctx.state.logger as Logger
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
    let payload: CLIResponse['payload']
    const [command, ...args] = input.split(' ')
    const userID = ctx.cookies.get('userID')
    ctx.state.userID = userID
    if (config.buildType === BuildType.Production && !staging) {
      discord.postMessage({
        content: `${userID && userID.split('-')[4]} said "${input}"`
      })
    }
    switch (command.toLowerCase()) {
      case 'help':
        type = CLIResponseType.Info
        content = [
          '-= PUBLICLY AVAILABLE COMMANDS =-  ',
          '  [ log(in|out) read post weather cv ]  '
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
          ({ type, content } = await authUser(ctx, logger, username))
        }
        break
      case 'logout':
        if (!userID) {
          type = CLIResponseType.Info
          content = ["🖖 Looks like you weren't logged in ¯_(ツ)_/¯  "]
          break
        }
        type = CLIResponseType.Info
        content = ['Okay, see ya later 🖖  ']
        ctx.cookies.set('userID')
        break
      case 'post':
        if (!userID) {
          (content = ['You must be logged in to post.  ']),
            (type = CLIResponseType.Error)
          break
        }
        type = CLIResponseType.StartPost
        content = ['> What have you got to say?  ']
        break
      case 'read':
        ({ content, payload, type } = await getPosts(ctx, logger, staging))
        break
      case 'addpost':
        ({ content, type } = await addPost(ctx, logger, args.join(' '), staging))
        break
      case 'weather':
        ({ content, type } = await getWeather(logger, args[0]))
      default:
        break
    }
    response.body = JSON.stringify({ content, payload, type })
  }
}
