import Koa from 'koa'
import uuidv4 from 'uuid/v4'
import { dynamodb } from './'
import { getItem } from './db'
import { logger } from './logger'
import { CLIResponse, CLIResponseType } from './models/cli'
import { User } from './models/user'
import { generateDefaultError } from './responseUtils/generateDefaultError'

/**
 * Checks for an existing session, and creates one if it does not exist,
 * or the provided name does not match.
 */
export async function authUser(
  loginParameter: string,
  ctx: Koa.Context
): Promise<CLIResponse> {
  const user = await getUser(ctx)

  if (!user || user.username !== loginParameter) {
    logger.debug('Session not found, or session mismatch.')
    return createUser(loginParameter, ctx)
  }

  logger.debug('Session found for: ', user.username)

  const type = CLIResponseType.Success
  const content = [
    `> Welcome back ${loginParameter} 😊  `,
    '> Your session is still active:  ',
    `> ${user.userID}  `
  ]

  return { type, content }
}

export async function getUser(ctx: Koa.Context): Promise<User | null> {
  const userID = ctx.cookies.get('userID')

  if (!userID) {
    return null
  }

  const params = {
    Key: {
      UserID: { S: userID }
    },
    TableName: 'UndefinedUsers'
  }

  logger.externalCall('Fetching data for ', userID, ' from dynamo.')

  const data: any = await getItem(params)
  const username = data && data.Item.Username.S
  const createdAt = data && data.Item.CreatedAt.S
  return { createdAt, username, userID: username && userID }
}

export function createUser(
  username: string,
  ctx: Koa.Context
): Promise<CLIResponse> {
  logger.info('Creating new user for ', username)
  const newUserID = uuidv4()

  const params = {
    Item: {
      CreatedAt: { S: new Date().toISOString() },
      UserID: { S: newUserID },
      Username: { S: username }
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: 'UndefinedUsers'
  }

  return new Promise((res, rej) => {
    dynamodb.putItem(params, (err: any, data: any) => {
      if (err) {
        logger.error(err, err.stack)
        res(generateDefaultError(username))
      }

      logger.externalCall('Created:', data)
      const type = CLIResponseType.Success
      const content = [
        `> 👋 Hello ${username}.  `,
        '> A session has been created for you:  ',
        `> ${newUserID}  `
      ]

      ctx.cookies.set('userID', newUserID)
      res({ type, content })
    })
  })
}
