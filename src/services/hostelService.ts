import { HostelRepository } from "../repositories/hostelRepository";
import { verifyToken } from "../utils/jwt";
import { uploadToS3 } from "../utils/s3Bucket";


export class HostelService{

    constructor(private hostelRepository: HostelRepository){
        
    } 

    async createHostel(photos: Express.Multer.File[], formdata: any,token:string) {
        
        let uploadedStrings: string[] = []
        let payload = verifyToken(token);
    
        let id = JSON.parse(JSON.stringify(payload)).payload;
        
        for (let file of photos) {
            if (file) {
                const bucketName = process.env.AWS_S3_BUCKET_NAME!;
                const key = `upload/${Date.now()}-${file.originalname}`;
                const fileBuffer = file.buffer;
                const mimetype = file.mimetype;
                // const imageUrl = await uploadToS3(bucketName, key, fileBuffer, mimetype);
                // uploadedStrings.push(imageUrl)
            }


         
            
        }
        formdata.photos = uploadedStrings
        formdata.owner=id
        
        let { rates, ...hostelData } = formdata
        
        const result = await this.hostelRepository.addHostel(hostelData,JSON.parse(rates))
       
        if (result) {
            return {
                success: true,
                message: 'Hostel Added  Success Fully',
                data:result
            }
        }
    }
}