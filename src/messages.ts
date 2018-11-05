import Koa from 'koa'
import uuid = require('uuid/v1')
import { dynamodb } from '.'
import { CLIResponse, CLIResponseType } from './models/cli'
import { generateDefaultError } from './responseUtils/generateDefaultError'
import { getUser } from './user'

export async function addPost(
  message: string,
  ctx: Koa.Context
): Promise<CLIResponse> {
  const user = await getUser(ctx)
  if (!user) {
    return {
      content: ['You must be logged in to do post.  '],
      type: CLIResponseType.Error
    }
  }

  const { username, userID } = user
  const newPostID = uuid()

  const params = {
    Item: {
      CreatedAt: { S: new Date().toISOString() },
      Message: { S: message },
      PostID: { S: newPostID },
      UserID: { S: userID },
      UserName: { S: username }
    },
    ReturnConsumedCapacity: 'TOTAL',
    TableName: 'UndefinedPosts'
  }

  return new Promise<CLIResponse>((res, rej) => {
    dynamodb.putItem(params, (err: any, data: any) => {
      if (err) {
        console.log(err, err.stack)
        res(generateDefaultError(username))
      }

      console.log('created post:', data)
      const type = CLIResponseType.Success
      const content = ['> Your thoughts have been noted.   ']

      res({ type, content })
    })
  })
}
