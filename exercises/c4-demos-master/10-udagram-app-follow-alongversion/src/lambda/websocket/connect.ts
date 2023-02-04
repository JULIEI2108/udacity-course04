import {APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'




const connectionsTable = process.env.CONNECTIONS_TABLE
const docClient= new AWS.DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    console.log("Websocket connect", event)

    const connectionId = event.requestContext.connectionId
    // const timestamp = new Date().toISOString()

    const item = {
        id: connectionId,
    }
    console.log(" connectionId", connectionId)
    console.log("connectionsTable", connectionsTable)
    try {
        await docClient.put({
        TableName: connectionsTable,
        Item: item
        }).promise();
    } catch (error) {
        console.log(error);
        return {
        statusCode: 500,
        body: JSON.stringify(error),
        };
    }

    return {
        statusCode:200,
        body:JSON.stringify(item)
    }
}