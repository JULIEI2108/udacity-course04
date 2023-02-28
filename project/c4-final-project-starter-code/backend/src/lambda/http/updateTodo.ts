import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updateTodo } from '../../helpers/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
const logger = createLogger('updateTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const userId: string = getUserId(event)
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    logger.log("Recieved todoRequest", updatedTodo)
    await updateTodo(updatedTodo, userId,todoId )
    return undefined
  }
  
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
