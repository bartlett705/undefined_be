import { dynamodb } from '..'
import { logger } from '../logger'
export async function getItem(params: {
  Key: Record<
    string,
    {
      S: string
    }
  >
  TableName: string
}): Promise<any> {
  return new Promise((res, rej) => {
    logger.debug('dynamoDB params:', JSON.stringify(params, null, 2))
    dynamodb.getItem(params, async (err: any, dbData: any) => {
      if (err) {
        logger.error(err, err.stack)
        rej(err)
      }
      res(dbData)
    })
  })
}
