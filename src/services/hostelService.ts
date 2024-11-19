import { IHostelService } from "../interfaces/IHostel";
import { IResponse } from "../interfaces/IResponse";
import { HostelRepository } from "../repositories/hostelRepository";
import { verifyToken } from "../utils/jwt";
import { getPredesignedUrl, uploadToS3 } from "../utils/s3Bucket";

export class HostelService implements IHostelService {
  constructor(private _hostelRepository: HostelRepository) {
    this._hostelRepository = _hostelRepository;
  }

  async createHostel(
    photos: Express.Multer.File[],
    formdata: { [key: string]: unknown },
    token: string
  ): Promise<IResponse> {
    const uploadedStrings: string[] = [];
    const payload = verifyToken(token);

    const id = JSON.parse(JSON.stringify(payload)).payload;

    for (const file of photos) {
      if (file) {
        const bucketName = process.env.AWS_S3_BUCKET_NAME!;
        const key = `upload/${Date.now()}-${file.originalname}`;
        const fileBuffer = file.buffer;
        const mimetype = file.mimetype;
        const imageUrl = await uploadToS3(
          bucketName,
          key,
          fileBuffer,
          mimetype
        );
        uploadedStrings.push(imageUrl);
      }
    }
    formdata.photos = uploadedStrings;
    formdata.owner = id;

    const { rates, ...hostelData } = formdata;

    hostelData.rates = JSON.parse(rates as string).map(
      (rate: { type: string; price: number,quantity:number }) => ({
        type: rate.type,
        price: rate.price,
        quantity:rate.quantity
      })
    );

    hostelData.address = {
      city: hostelData.city,
      street: hostelData.street,
      district: hostelData.district,
      state: hostelData.state,
      pincode: hostelData.pincode,
      latitude: hostelData.latitude,
      longtitude: hostelData.longtitude
    };

    if (typeof hostelData.nearByPlaces === "string") {
      hostelData.nearbyPlaces = hostelData.nearByPlaces.split(",");
    }
    if (typeof hostelData.facilities === "string") {
      hostelData.facilities = hostelData.facilities.split(",");
    }

    const result = await this._hostelRepository.create(hostelData);

    if (!result) {
      return {
        success: false,
        message: "Failed to create",
        data: null,
      };
    }
    return {
      success: true,
      message: "Hostel Added  Success Fully",
      data: result,
    };
  }

  async getAllHostel(page: number, searchQuery: string,filterObject:Record<string,unknown>,sort:string): Promise<IResponse> {
    try {
      const skip = (page - 1) * 5;

      const filter: { [key: string]: unknown } = {};
      let query:Record<string,unknown> = {}

      if (searchQuery) {
        filter["$or"] = [
          { name: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
        ];
      }

      if (Object.entries(filterObject).length) {
        if (Object.entries(filterObject)[0][1]) {
          filter['rates']={$elemMatch:{type:filterObject.bedtype}}
        }
        if (Object.entries(filterObject)[1][1]) {
          filter['category']=filterObject.category
        }
      }
      if (sort) {
        switch (sort) {
          case 'low':
            query['rates.0.price'] = 1
            break
          case 'high':
            query['rates.0.price'] = -1
            break
          case 'newly Added':
            query = {createdAt:-1}
            break
            case 'AtoZ':
              query['name'] =1
            break
          case 'ZtoA':
              query['name'] =-1
              break
          default:
          console.warn(`Unknown sort option: ${sort}`);
        }
      }
   
      filter.isActive = true;
      const hostels = await this._hostelRepository.findAll(filter, skip,query);
      for (const hostel of hostels) {
        if (hostel.photos && hostel.photos.length > 0) {
          hostel.photos = await Promise.all(hostel.photos.map(async (url: string) => {
            const key = url.split(`.s3.amazonaws.com/`)[1]
            return getPredesignedUrl(process.env.AWS_S3_BUCKET_NAME!,key)!
          }))
        }
      }

      return {
        success: true,
        message: "All hostels are fetched",
        data: hostels,
      };
    } catch (error) {
      console.log('error get all hostel servise',error);
      return {
        success: false,
        message: "No Hostels Found",
      };
    }
  }

  async blockHostel(id: string) {
    try {
      const blockHostel = await this._hostelRepository.update(id, {
        isActive: false,
      });

      if (!blockHostel) {
        console.log("Error Hostel block failed");

        return { success: false, message: "error in block Hostel" };
      }

      return {
        success: true,
        message: "Hostel Blocked",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "error in block User",
      };
    }
  }

  async unBlockHostel(id: string): Promise<IResponse> {
    try {
      const blockHostel = await this._hostelRepository.update(id, {
        isActive: true,
      });

      if (!blockHostel) {
        console.log("Error in admin.unblockHostel");
        return { success: false, message: "error in unblock Hostel" };
      }

      return {
        success: true,
        message: "Hostel Blocked",
      };
    } catch (error) {
      console.error("Error in admin.unblockHostel", error);
      return {
        success: false,
        message: "error in block User",
      };
    }
  }

  async getHostel(id: string): Promise<IResponse> {
    try {
      const hostel = await this._hostelRepository.findById(id);

      if (!hostel) {
        return {
          success: false,
          message: "No Hostel Found",
        };
      }
      return {
        success: true,
        message: "Hostel fetched successfully",
        data: hostel,
      };
    } catch (error) {
      console.error("Error from Hostel Service.get Hostel", error);
      return {
        success: false,
        message: error as string,
      };
    }
  }

  async getHostelWithOwner(id: string): Promise<IResponse> {
    try {
      const hostel = await this._hostelRepository.findHostelWIthOwner(id);
      if (!hostel) {
        return {
          success: false,
          message: "No Hostel Found",
        };
      }

     
        if (hostel.photos && hostel.photos.length > 0) {
          hostel.photos = await Promise.all(hostel.photos.map(async (url: string) => {
            const key = url.split(`.s3.amazonaws.com/`)[1]
            return getPredesignedUrl(process.env.AWS_S3_BUCKET_NAME!,key)!
          }))
        }

      return {
        success: true,
        message: "Hostel fetched successfully",
        data: hostel,
      };
    } catch (error) {
      console.error("Error from Hostel Service.get Hostel with owner", error);
      return {
        success: false, 
        message: error as string,
      };
    }
  }

  async editHostle(
    id: string,
    photos: Express.Multer.File[],
    formdata: { [key: string]: unknown }
  ): Promise<IResponse> {
    try {
      let uploadedStrings: string[] = (formdata.existingPhotos as string).split(',') as string[];
    

      if (photos) {  
        for (const file of photos) {
         
          
          
          if (file) {
            const bucketName = process.env.AWS_S3_BUCKET_NAME!;
            const key = `upload/${Date.now()}-${file.originalname}`;
            const fileBuffer = file.buffer;
            const mimetype = file.mimetype;
            const imageUrl = await uploadToS3(
              bucketName,
              key,
              fileBuffer,
              mimetype
            );

           if(!imageUrl)console.log('not image url');
           
              const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`
            uploadedStrings.push(fileUrl);
          }
        }
      }

    uploadedStrings=  uploadedStrings.filter((string) => {
      return string.includes('https://secondhome.s3.amazonaws.com/upload/')
     })

      formdata.photos = uploadedStrings;
      if (typeof formdata.nearbyPlaces === 'string') {
        
        formdata.nearbyPlaces=(formdata.nearbyPlaces as string).split(',')
      }
      if (typeof formdata.facilities === 'string') {
        
      
        formdata.facilities=(formdata.facilities as string).split(',')
      }

      const { rates,...hostelData } = formdata;

      if (rates && typeof rates === "object") {
        hostelData.rates = Object.entries(rates).map(([type, details]) => ({
          type,
          price: details.price,
          quantity:details.quantity
        }));
      }

    
      


      
      const editedHostel = await this._hostelRepository.update(id, hostelData);
   
      

      if (!editedHostel) {
        return {
          success: false,
          message: "Failed to Edit Hostel",
        }; 
      }
      return {
        success: true,
        message: "Hostel Updated SuccessFully",
      };
    } catch (error) {
      console.error("Error from the HostelService.EditHostel", error);
      return {
        success: true,
        message: "Failed to edit Hostel",
      };
    }
  }
}
