import { SNSEvent, S3Event, SNSHandler } from "aws-lambda";
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


export const handler: SNSHandler= async (event: SNSEvent) => {
    console.log("Processing SNS event", JSON.stringify(event))
    for (const snsRecord of event.Records){
        const s3EventStr = snsRecord.Sns.Message
        console.log('Processing S3 event', s3EventStr)
        const s3Event = JSON.parse(s3EventStr)
        await processS3Event(s3Event)
    }
}

const apiGateway = new AWS.ApiGatewayManagementApi(connectionParams)
async function processS3Event(s3event: S3Event){
    for (const record of s3event.Records) {
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