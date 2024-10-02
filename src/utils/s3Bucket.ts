import { S3Client,PutObjectCommand,PutObjectCommandInput } from "@aws-sdk/client-s3";



const s3Client = new S3Client({
    region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
    }

});


export const uploadToS3 = async (
    bucketName: string,
    key: string,
    fileBuffer: Buffer,
    mimetype: string
) => {
    const uploadParams:PutObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype
    }
    try {
        const command = new PutObjectCommand(uploadParams);
        const response = await s3Client.send(command);
        

        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
        return fileUrl
    } catch (error) {
        console.error("error uploading to s3",error);
    }
}
