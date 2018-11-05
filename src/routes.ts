import Koa from 'koa'
import Router from 'koa-router'
import { addPost } from './messages'
import { CLIRequestBody, CLIResponse, CLIResponseType } from './models/cli'
import { authUser, getUser } from './user'
import { getWeather } from './weather'

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
    case 'help':
      type = CLIResponseType.Info
      content = [
        '-= PUBLICLY AVAILABLE COMMANDS =-  ',
        '  [ log(in|out) read post cv ]  '
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
        ;({ type, content } = await authUser(username, ctx))
      }
      break
    case 'logout':
      const userID = ctx.cookies.get('userID')
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
      const user = await getUser(ctx)
      if (!user) {
        ;(content = ['You must be logged in to post.  ']),
          (type = CLIResponseType.Error)
        break
      }

      type = CLIResponseType.StartPost
      content = ['> What have you got to say?  ']
      break
    case 'addpost':
      ;({ content, type } = await addPost(args.join(' '), ctx))
      break
    case 'weather':
      ;({ content, type } = await getWeather(args[0]))
    default:
      break
  }

  response.body = JSON.stringify({ content, type })
})

export const routes = router.routes()
