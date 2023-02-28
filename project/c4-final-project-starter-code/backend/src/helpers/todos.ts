import { TodosAccess } from './todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
// import * as createError from 'http-errors'
import { createLogger } from '../utils/logger'
const logger = createLogger('todos')
// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
export async function getTodosForUser (userId): Promise<TodoItem[]> {
    return todosAccess.getTodosForUser(userId)
}
export async function createTodo(createTodoRequest: CreateTodoRequest, userId: string): Promise<any> {
    const todoid = uuid.v4()
    //create todoId, createAT and create todoItem
    const todo = { todoId: todoid,
        userId: userId,
        createdAt: Date().toString(),
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: ''
    }
    return await todosAccess.createTodo(todo)
    
}

export async function updateTodo(updateTodoRequest: UpdateTodoRequest, userId: string, todoId: string): Promise<void>{
    todosAccess.updateTodo(updateTodoRequest, userId, todoId)

}

export async function deleteTodo(todoId: string, userId: string): Promise<void>{
    todosAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId:string, userId:string): Promise<string> {
    const response = await todosAccess.createAttachmentPresignedUrl(todoId, userId)
    logger.info('response todo', response)
    return response
    
}