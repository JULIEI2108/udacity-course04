import * as AWS from 'aws-sdk'
// import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
// import { Json } from 'aws-sdk/clients/robomaker';
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import {createAttachmentPresignedUrl, deleteTodoImage} from './attachmentUtils'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
// const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
        private readonly doClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE){

        }

    async getTodosForUser (userId): Promise<TodoItem[]>{
        console.log('Getting todos')

        const result = await this.doClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId 
            },
            ExpressionAttributeNames: {
                '#c' :'name'
            },
            ProjectionExpression: "todoId, createdAt, #c, dueDate, done, attachmentUrl"
        }).promise()
        const items = result.Items
        return items as TodoItem[]
    }

    async createTodo(todo: TodoItem ): Promise<any>{
        logger.info('creating a new todoItem with id', todo.todoId)
        await this.doClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()
        //create response for frontend
        const response : any =   {
            todoId: todo.todoId,
            createdAt: todo.createdAt,
            name: todo.name,
            dueDate: todo.dueDate,
            done: false}
       
        logger.info('item', response)
        return response
    }
    async updateTodo(update: TodoUpdate, userId, todoId ): Promise<void>{
        // update dynamodb table
        var params = {
            TableName: this.todosTable ,
            Key: { 'todoId' : todoId ,
            'userId': userId},
            ExpressionAttributeNames: {'#a' : 'name'},
            // ConditionExpression: 'todoId = todoId',
            UpdateExpression: "set #a = :x, dueDate = :y,  done = :z",
            ExpressionAttributeValues: {
            ':x': update.name,
            ':y': update.dueDate,
            ':z': update.done
            }
        };
        await this.doClient.update(params, function(err,data){
            if (err) logger.error(err)
            else console.log(data)
        })
}
    async deleteTodo(todoId: string, userId: string): Promise<void>{
        //delete todoItem in dynamoDB table
        var params= {
            TableName: this.todosTable,          
            Key: {'userId': userId,
            'todoId': todoId},
        }
        await this.doClient.delete(params, function(err,data){
            if (err) logger.error(err)
            else logger.info(data)
        })
        // delete todoImage in S3
        await deleteTodoImage(todoId)
    }
    async createAttachmentPresignedUrl(todoId: string, userId: string): Promise<any>{
        const response = await createAttachmentPresignedUrl(todoId)
        // update dynamoDB with new attachmentUrl
        var params = {
            TableName: this.todosTable ,
            Key: { 'todoId' : todoId ,
            'userId': userId},
            UpdateExpression: "set  attachmentUrl = :x",
            ExpressionAttributeValues: {
            ':x': response.attachmentUrl
            }}
        logger.info('attachmentUrl', response.attachmentUrl)
        await this.doClient.update(params, function(err,data){
                if (err) logger.error(err)
                else logger.log('info',data)})
    return response['uploadUrl']
}
}

function createDynamoDBClient(){
    return new XAWS.DynamoDB.DocumentClient()
}