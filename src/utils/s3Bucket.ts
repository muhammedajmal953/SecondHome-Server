import { S3Client,GetObjectCommand, PutObjectCommand, } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";


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
    try {
    //     const upload = new Upload({
    //         client: s3Client,
    //         params: uploadParams,
    //         queueSize: parallelUploadOptions.queueSize,
    //         partSize: parallelUploadOptions.partSize,
    //     });

    //     const putPreSingned = new PutObjectCommand({ Bucket: bucketName, Key: key })
        
    //     getSignedUrl(s3Client,putPreSingned,{expiresIn:60})

        //    await upload.done();
        
        const uploadUrl = await uploadUsingPeresignedUrl(bucketName, key)
        
        await uploadToS3Predefined(uploadUrl!,fileBuffer,mimetype)
        
        const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
        return fileUrl
    } catch (error) {
        console.error("error uploading to s3", error);
        throw error
    }
}

export const getPredesignedUrl = (bucketName:string,key:string,expiresIn=3600) => {
   try {
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key })
    return getSignedUrl(s3Client,command,{expiresIn})
   } catch (error) {
    console.log('Error in presigned geturl',error);
    
   }
}

export const uploadUsingPeresignedUrl =async (  bucketName: string, key: string)=>{
    try {
        const putPreSingned = new PutObjectCommand({ Bucket: bucketName, Key: key })
        const signedUrl = await getSignedUrl(s3Client, putPreSingned, { expiresIn:600 });
        return signedUrl;
    } catch (error) {
        console.log(error);
    }
}

export const uploadToS3Predefined = async (uploadUrl: string, fileBuffer: Buffer, mimetype: string) => {
    try {
        await axios.put(uploadUrl, fileBuffer,
            {
                headers: {
                    'Content-type':mimetype
                }
            }
        )
    } catch (error) {
        console.log(error);
    }
}

  
