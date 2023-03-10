import {APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import { CreateGroupRequest } from '../../requests/CreateGroupRequest'
import { createGroup } from '../../bussinessLogic/groups'



export const handler:APIGatewayProxyHandler = async (event:APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const newGroup: CreateGroupRequest = JSON.parse(event.body)
  const newItem = await createGroup(newGroup)


  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      newItem
    })
  }
}
