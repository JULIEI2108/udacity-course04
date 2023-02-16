import {  CustomAuthorizerEvent, CustomAuthorizerResult } from "aws-lambda";
import 'source-map-support/register'
import { verify } from 'jsonwebtoken'
import {JwtToken} from '../../auth/JwtToken'
import * as middy from 'middy'
import  { secretsManager}  from 'middy/middlewares'

const secretId = process.env.AUTH_0_SECRET_ID
const secretField = process.env.AUTH_0_SECRET_FIELD




export const handler = middy(async (event: CustomAuthorizerEvent, context): Promise<CustomAuthorizerResult> =>{
    try {
        const decodedToken = verifyToken(event.authorizationToken, context.AUTH0_SECRET[secretField])
        console.log("User was authorized")

            return{
                principalId: decodedToken.sub,
                policyDocument: {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Action: 'execute-api:Invoke',
                            Effect: 'Allow',
                            Resource: '*'
                        }
                    ]
                }
            }
    }

    catch(e){
        console.log("User was not authorized", e.message)
        return {
            principalId: "user",
            policyDocument: {
                Version: '2012-10-17',
                Statement: [
                  {Action: 'execute-api:Invoke',
                  Effect: 'Deny',
                  Resource: '*'
                }
                ]
            }
        }
    }
}
)



function verifyToken (authHeader: string, secret: string) : JwtToken{
    if (!authHeader)
        throw  new Error('No authorization header')

    if (!authHeader.toLocaleLowerCase().startsWith("bearer "))
        throw new Error('Invalid authorization header')
    const split = authHeader.split(" ")
    const token = split[1]

    console.log('secret', secret)
    console.log('token', token)

    return verify(token, secret) as JwtToken


}
// access secretmanager with typescript
// async function getSecret(){
//     if (cachedSecret) return JSON.parse(cachedSecret)
//         console.log('cachedSecret', cachedSecret)

//     const data = await client.getSecretValue({
//         SecretId: secretId,
//         VersionStage: "AWSCURRENT"
//     })
//     .promise()
//     cachedSecret = data.SecretString
//         console.log('cachedSecret', cachedSecret)
    
//     return JSON.parse(cachedSecret)

// }

// use middy.middlewares to access secretsManager

handler.use(
    secretsManager({
        throwOnFailedCall: true,
        cacheExpiryInMillis: 60000,
        secrets: {
            AUTH0_SECRET: secretId
        },
        cache: true
    }
    )
)