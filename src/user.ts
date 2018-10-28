import AWS from 'aws-sdk'
import Koa from 'koa'
import uuid from 'uuid/v4'
import { config } from './config'
import { CLIResponse, CLIResponseType } from './models/cli'

const dynamodb = new AWS.DynamoDB({
  accessKeyId: config.awsID,
  region: 'us-west-2',
  secretAccessKey: config.dynamoSecret
})

/**
 * Checks for an existing session, and creates one if it does not exist,
 * or the provided name does not match.
 */
export function authUser(
  username: string,
  ctx: Koa.Context
): Promise<CLIResponse> {
  const userID = ctx.cookies.get('userID')

  if (!userID) {
    return createUser(username, ctx)
  }

  const params = {
    Key: {
      UserID: { S: userID }
    },
    TableName: 'UndefinedUsers'
  }

  return new Promise((res, rej) => {
    dynamodb.getItem(params, async (err: any, data: any) => {
      if (err) {
        console.log(err, err.stack)
        res(generateDefaultError(username))
      }

      if (!data.Item || data.Item.Username.S !== username) {
        res(await createUser(username, ctx))
      }

      console.log('Returning user', data.Item.Username.S)

      const type = CLIResponseType.Success
      const content = [
        `> Welcome back ${username} 😊  `,
        '> Your session is still active:  ',
        `> ${userID}  `
      ]

      res({ type, content })
    })
  })
}

export function createUser(
  username: string,
  ctx: Koa.Context
): Promise<CLIResponse> {
  console.log('Creating new user for ', username)
  const newUserID = uuid()

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
        console.log(err, err.stack)
        res(generateDefaultError(username))
      }

      console.log('created:', data)
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

const generateDefaultError = (username: string) => ({
  content: [
    `> 😭 Sorry ${username}.  `,
    '> We suck at the Internet...  ',
    '> Something went wrong.'
  ],
  type: CLIResponseType.Error
})
