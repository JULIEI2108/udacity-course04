
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtToken } from '../../auth/JwtToken'


const certificate: string = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJfNUabnUFHwkHMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1kdDV3NzN4cjRlbm5tMG04LnVzLmF1dGgwLmNvbTAeFw0yMzAyMTAx
MDMwNTVaFw0zNjEwMTkxMDMwNTVaMCwxKjAoBgNVBAMTIWRldi1kdDV3NzN4cjRl
bm5tMG04LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBALo6+PnhC9+5d21WCHJQcrUhALFqkrZMEwJOcLecfL7RpYo5c+m96WYADlcL
0gXOZdguNYrCoSmmvcge55QWLMDpIqxJmBIjMEkNxmtk0FpCCg58FtFG4QpeKfPj
ZGOCWX8jthXyBVAFcErC+olBkTKstnxqzcb3c153IU3y8JCctORBgcEsS31QZNig
shxYVhXEpipy7vGo/T6J1sP4ZRiAAn1aefCEfgK63mxm8pLv9YkL4fEuMbfiDvUZ
PTNc/NnqsbOv13C9Sj96Ni3ZvNwGWVkfYD/Xs7+/HTa9kwJ3cLibUv/xgh4NHKTp
R+/Foj+Uewhr5riP4N9+VKDTfvECAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUB2x0lyksVRguy3R3zHCrTnXqwoEwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBCVeMYfxtn4AH5ZJ1YXQO5d8Q1v/oIJIF/WQw9hI6s
6Um+K94pfPXmH25cXSHgNL6nXB2HLAhQHJVfVwRGLn9lI48y2d45wJFcDSGgawfp
0bYAWRSE/VIfhJ7Ibev3smjD5gjDg2LwrfCITt2TNb5QQinRqLF+wwtjK/CuPMcV
6KCf2NzZFhVSUnZOuXY09jh1mwO5denAYdROLMgrbFpLaxBk3moDJ3vytL9HMEBP
2OlAmTdvMpfVkrEF98ph4xSpzFNzOWwuXQLx1Jvn4ro+nqGOkO5TAleby+fJzsL2
Lu1ilev0YnbsGPzNCVvy9/RTsLQSlHNUN19dJsUNjOgW
-----END CERTIFICATE-----`
export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const decodedToken = verifyToken(
      event.authorizationToken)
    console.log('User was authorized', decodedToken)

    return {
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
  } catch (e) {
    console.log('User was not authorized', e.message)

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

function verifyToken(authHeader: string,): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, certificate, { algorithms: ['RS256']}) as JwtToken
}