import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import {Upload} from "@aws-sdk/lib-storage";



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
    const parallelUploadOptions = {
        queueSize: 4,
        partSize: 10 * 1024 * 1024,
    };

   
    

    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
    };

    try {
        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
            queueSize: parallelUploadOptions.queueSize,
            partSize: parallelUploadOptions.partSize,
        });

        const response = await upload.done();
        
        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
        return fileUrl
    } catch (error) {
        console.error("error uploading to s3", error);
        throw error
    }
}


