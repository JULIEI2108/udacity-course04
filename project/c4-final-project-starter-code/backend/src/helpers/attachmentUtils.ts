import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
import { createLogger } from '../utils/logger'
// TODO: Implement the fileStogare logic
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const logger = createLogger('attachmentUtils')
const bucketName: string = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration : number =Number(process.env.SIGNED_URL_EXPIRATION) 
export async function createAttachmentPresignedUrl(todoId: string){
    const uploadUrl :string =  await s3.getSignedUrl(
        'putObject', {
            Bucket: bucketName,
            Key: todoId,
            Expires: urlExpiration
        }
    )
    const attachmentUrl =  `https://${bucketName}.s3.amazonaws.com/${todoId}`
    const response = {
        uploadUrl : uploadUrl,
        attachmentUrl: attachmentUrl
    }
    logger.info('response', response)
    return response
}

export async function deleteTodoImage(todoId:string) {
    var params = {  Bucket: bucketName, Key: todoId };

    s3.deleteObject(params, function(err, data) {
    if (err) logger.error(err);  // error
    else     logger.info(data);                 // deleted
});
    
}