import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('generateUploadUrl')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId: string = getUserId(event)
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const response = await createAttachmentPresignedUrl(todoId, userId)
    logger.log('response handler',response)
    return {
        statusCode: 200,
        body:JSON.stringify({
          uploadUrl: response
        })
      }
  }
)

handler  
    .use(httpErrorHandler())
    .use(
    cors({
      credentials: true
    })
  )