import Koa from 'koa'
import uuid = require('uuid/v1')
import { dynamodb } from '.'
import { tableName } from './db'
import { Logger } from './logger'
import {
  CLIResponse,
  CLIResponseType,
  DynamoPost,
  Payload,
  PayloadType,
  Post
} from './models/cli'
import { formatName } from './responseUtils/formatName'
import { generateDefaultError } from './responseUtils/generateDefaultError'
import { getUser } from './user'

export async function addPost(
  ctx: Koa.Context,
  logger: Logger,
  message: string
): Promise<CLIResponse> {
  const user = await getUser(ctx, logger)
  if (!user) {
    return {
      content: ['You must be logged in to do a poast.  '],
      type: CLIResponseType.Error
    }
  }

  const { username, userID } = user

  const post: DynamoPost = {
    CreatedAt: { S: new Date().toISOString() },
    Message: { S: message },
    UserID: { S: userID },
    UserName: { S: username }
  }

  const params = {
    Item: post,
    ReturnConsumedCapacity: 'TOTAL',
    TableName: tableName('UndefinedPosts')
  }

  logger.debug(
    'adding post:',
    JSON.stringify(post),
    ' to table ',
    tableName('UndefinedPosts')
  )

  return new Promise<CLIResponse>((res, rej) => {
    dynamodb.putItem(params, (err: any, data: any) => {
      if (err) {
        logger.error(err, err.stack)
        return res(generateDefaultError(username))
      }

      logger.info(`${formatName(userID, username)} said: ${message}`)
      const type = CLIResponseType.Success
      const content = ['> Your thoughts have been noted.   ']

      res({ type, content })
    })
  })
}

export async function getPosts(
  ctx: Koa.Context,
  logger: Logger,
  after?: string
): Promise<CLIResponse> {
  const user = await getUser(ctx, logger)
  if (!user) {
    return {
      content: ['You must be logged in to read posts.  '],
      type: CLIResponseType.Error
    }
  }

  const { username, userID } = user

  const params = {
    Limit: 25,
    ReturnConsumedCapacity: 'TOTAL',
    TableName: tableName('UndefinedPosts')
  }

  return new Promise<CLIResponse>((res, rej) => {
    dynamodb.scan(params, (err: any, data: any) => {
      if (err) {
        logger.error(err, err.stack)
        res(generateDefaultError(username))
      }

      logger.debug(JSON.stringify(data))

      logger.info(
        `Returning ${data.Count} posts to ${formatName(userID, username)}`
      )
      const posts: Post[] = (data.Items as DynamoPost[]).map((item) => ({
        createdAt: item.CreatedAt.S,
        message: item.Message.S,
        userID: item.UserID.S,
        username: item.UserName.S
      }))

      const type = CLIResponseType.Info
      const content = [
        '> Entering Read mode.   ',
        '> Read mode is still being built,   ',
        '> Posts are in the response body 👨‍🔧   '
      ]
      const payload: Payload = {
        body: posts,
        type: PayloadType.Posts
      }

      res({ payload, type, content })
    })
  })
}
