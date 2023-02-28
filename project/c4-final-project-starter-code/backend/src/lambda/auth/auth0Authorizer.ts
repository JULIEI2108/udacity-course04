import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode} from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
// import { Certificate } from 'crypto'
import {JwksClient } from 'jwks-rsa'
import { PublicKey } from 'aws-sdk/clients/iot'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-dt5w73xr4ennm0m8.us.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
    logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtpayload : JwtPayload = await verifyToken(event.authorizationToken)
    // logger.info('User was authorized', jwtToken)
    logger.log('User was authorized', jwtpayload)
    // console.log('jwtpayload', jwtpayload)
    return {
      principalId: jwtpayload.sub,
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
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  //decode header token to jwt
  const kid = jwt.header.kid
  // get kid from token
  const signingKey = await getCertificate(jwksUrl, kid)
  //use kid to get certificate

  logger.log('signingKey', signingKey)

  
  return verify(token, signingKey, { algorithms: ['RS256'] }) as JwtPayload
  //verify token with certificate


}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}

async function getCertificate(jwksUrl: string, kid: string): Promise<PublicKey> {
    const client = new JwksClient({
        jwksUri: jwksUrl,
        timeout: 30000
    })
    const key = await client.getSigningKey(kid)
    const signingKey = key.getPublicKey()
    return signingKey
    }
//get certificate from auth0