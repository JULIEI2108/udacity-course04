import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('createTodo')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log('Creating Todo', event)
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // if (newTodo.name == ''){
    //   logger.info('todoName must not be empty', newTodo)
    //   return {
    //     statusCode: 500,
    //     body: 'invalid todoName'
    //   }
    // }
    // else{
      const userId: string = getUserId(event)
      const todo= await createTodo(newTodo, userId)
      logger.info('todo', todo)
      return {
        statusCode: 200,
        body: 
        JSON.stringify({
        item: todo})
      }
    }
    // }
)

handler.use(
  cors({
    credentials: true
  })
)
