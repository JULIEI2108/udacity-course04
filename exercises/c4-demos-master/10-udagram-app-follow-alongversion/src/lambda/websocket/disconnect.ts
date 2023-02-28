import {APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)



const connectionsTable = process.env.CONNECTIONS_TABLE
const docClient= new XAWS.DynamoDB.DocumentClient()

export const handler:APIGatewayProxyHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Websocket connect", event)

    const connectionId = event.requestContext.connectionId
    const key = {
        id: connectionId 
    }
    try{
        await docClient.delete({
        TableName: connectionsTable,
        Key: key
        }).promise()
    }   catch (error) {
        console.log(error);
        return {
          statusCode: 500,
          body: JSON.stringify(error),
        };
    }
    

    return {
        statusCode:200,
        body: JSON.stringify(key)
    }
}