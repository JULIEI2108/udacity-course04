import { SNSEvent, SNSHandler, S3EventRecord } from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import Jimp from 'jimp/es'

const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3()


const IMAGES_S3_BUCKET= process.env.IMAGES_S3_BUCKET
const THUMBNAILS_S3_BUCKET= process.env.THUMBNAILS_S3_BUCKET

export const handler: SNSHandler = async (event: SNSEvent) => {
    console.log('Processing SNS event ', JSON.stringify(event))
    for (const snsRecord of event.Records){
        const s3EventStr =snsRecord.Sns.Message
        console.log('Processing S3 event', s3EventStr)
        const s3Event= JSON.parse(s3EventStr)
        
        for (const record of s3Event.Records)
        await processImage(record)
    }
}


async function processImage(record:S3EventRecord) {
    const key = record.s3.object.key
    const response = await s3.getObject({
        Bucket: IMAGES_S3_BUCKET,
        Key: key
    })
    .promise()
    const body_Buffer = response.Body as Buffer
    const image = await Jimp.read(body_Buffer)
    image.resize(150, Jimp.AUTO)
    const convertedBuffer = await image.getBufferAsync(Jimp.AUTO)

    await s3.putObject({
        Bucket: THUMBNAILS_S3_BUCKET,
        Key: `${key}.jpeg`,
        Body: convertedBuffer
    })
    .promise()


}