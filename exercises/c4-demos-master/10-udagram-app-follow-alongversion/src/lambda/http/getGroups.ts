import {APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { getAllGroups } from '../../bussinessLogic/groups';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent) : Promise<APIGatewayProxyResult> => {
    console.log('Processiong event: ', event)
    const groups = await getAllGroups()
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
    
        },
        body: JSON.stringify({
            items: groups
        })
    };
};
