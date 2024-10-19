import { error } from "console";
import { HostelRepository } from "../repositories/hostelRepository";
import { verifyToken } from "../utils/jwt";
import { uploadToS3 } from "../utils/s3Bucket";
import { IHostel } from "../interfaces/IHostel";


export class HostelService{

    constructor(private hostelRepository: HostelRepository){
        this.hostelRepository=hostelRepository
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
                const imageUrl = await uploadToS3(bucketName, key, fileBuffer, mimetype);
                uploadedStrings.push(imageUrl)
            }   
        }
        formdata.photos = uploadedStrings
        formdata.owner=id
        
        let { rates, ...hostelData } = formdata
        
        hostelData.rates = JSON.parse(rates).map((rate: { type: string, price: number }) => ({
            type: rate.type,
            price: rate.price
        }))

        hostelData.address = {
            city: hostelData.city,
            street: hostelData.street,
            district: hostelData.district,
            state: hostelData.state,
            pincode:hostelData.pincode
        }

        hostelData.nearbyPlaces = hostelData.nearByPlaces;
        
        const result = await this.hostelRepository.create(hostelData)
       
        if (result) {
            return {
                success: true,
                message: 'Hostel Added  Success Fully',
                data:result
            }
        } 
    }

   async getAllHostel(page:number,searchQuery:string) { 
       try {
           let skip = (page - 1) * 5
           
           let filter: any = {}
        
           
           if (searchQuery) {
               filter['$or'] = [
                   { name: { $regex: searchQuery, $options: 'i' } },
                   {category:{ $regex: searchQuery, $options:'i'}}
               ] 
           }
           console.log(searchQuery);
           let hostels = await this.hostelRepository.findAll(filter,skip)
          console.log('hostels count',hostels.length);
          hostels.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime())
          return {
              success: true,
              message: 'All hostels are fetched',
              data:hostels  
         }
      } catch (error) {
          console.log(error)
          return error
      }
       
    }  
}