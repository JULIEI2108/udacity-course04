import { S3Handler, S3Event } from "aws-lambda";
import 'source-map-support/register'
import * as AWS from 'aws-sdk'

const connectionsTable = process.env.CONNECTIONS_TABLE
const docClient= new AWS.DynamoDB.DocumentClient()
const stage = process.env.STAGE
const apiId = process.env.API_ID
const connectionParams = {
    apiVersion: '2018-11-29',
    endpoint: `${apiId}.execute-api.us-east-1.amazonaws.com/${stage}`
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)
export const handler: S3Handler = async (event: S3Event) => {
    for (const record of event.Records) {
        const key = record.s3.object.key
        console.log('Processiong S3 item with key: ', key)

        const connections = await docClient.scan({
            TableName: connectionsTable
        }).promise()

        const payload = {
            imageId: key
        }
        for (const connection of connections.Items) {
            const connectionId = connection.id 
            await sendMessageToClient(connectionId, payload)
        }
    }
}

async function sendMessageToClient(connectionId, payload) {
        try {
            console.log('Sending message to a connection', connectionId) 

            await apiGateway.postToConnection({
                ConnectionId: connectionId,
                Data: JSON.stringify(payload)
            }).promise()
        }catch(e){
            console.log('Failed to send message',JSON.stringify(e))
        }
        
}