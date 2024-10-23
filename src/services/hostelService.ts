import { HostelRepository } from "../repositories/hostelRepository";
import { verifyToken } from "../utils/jwt";
import { uploadToS3 } from "../utils/s3Bucket";

export class HostelService {
  constructor(private hostelRepository: HostelRepository) {
    this.hostelRepository = hostelRepository;
  }

  async createHostel(
    photos: Express.Multer.File[],
    formdata: { [key: string]: unknown },
    token: string
  ) {
    const uploadedStrings: string[] = [];
    const payload = verifyToken(token);

    const id = JSON.parse(JSON.stringify(payload)).payload;

    // for (const file of photos) {
    //   if (file) {
    //     const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    //     const key = `upload/${Date.now()}-${file.originalname}`;
    //     const fileBuffer = file.buffer;
    //     const mimetype = file.mimetype;
    //     const imageUrl = await uploadToS3(
    //       bucketName,
    //       key,
    //       fileBuffer,
    //       mimetype
    //     );
    //     uploadedStrings.push(imageUrl);
    //   }
    // }
    formdata.photos = uploadedStrings;
    formdata.owner = id;

    const { rates, ...hostelData } = formdata;

    hostelData.rates = JSON.parse(rates as string).map(
      (rate: { type: string; price: number }) => ({
        type: rate.type,
        price: rate.price,
      })
    );

    hostelData.address = {
      city: hostelData.city,
      street: hostelData.street,
      district: hostelData.district,
      state: hostelData.state,
      pincode: hostelData.pincode,
    };

      if (typeof hostelData.nearByPlaces === 'string') {
          hostelData.nearbyPlaces = hostelData.nearByPlaces.split(',')
      }
      if (typeof hostelData.facilities === 'string') {
          hostelData.facilities = hostelData.facilities.split(',')
      }
      console.log(hostelData.nearbyPlaces,hostelData.facilities);
      
      

    const result = await this.hostelRepository.create(hostelData);

    if (result) {
      return {
        success: true,
        message: "Hostel Added  Success Fully",
        data: result,
      };
    }
  }

  async getAllHostel(page: number, searchQuery: string) {
    try {
      const skip = (page - 1) * 5;

      const filter: { [key: string]: unknown } = {};

      if (searchQuery) {
        filter["$or"] = [
          { name: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
        ];
      }
      const hostels = await this.hostelRepository.findAll(filter, skip);
      hostels.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        success: true,
        message: "All hostels are fetched",
        data: hostels,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async blockHostel(id: string) {
    try {
      const blockHostel = await this.hostelRepository.update(id, {
        isActive: false,
      });

      if (!blockHostel) {
        console.log("Error Hostel block failed");

        return { sucess: false, message: "error in block Hostel" };
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
  async unBlockHostel(id: string) {
    try {
      const blockHostel = await this.hostelRepository.update(id, {
        isActive: true,
      });

      if (!blockHostel) {
        console.log("Error in admin.unblockHostel");
        return { sucess: false, message: "error in unblock Hostel" };
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

  async getHostel(id: string) {
    try {
      const hostel = await this.hostelRepository.findById(id);

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
    }
  }

  async getHostelWithOwner(id: string) {
    try {
      const hostel = await this.hostelRepository.findHostelWIthOwner(id);
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
      console.error("Error from Hostel Service.get Hostel with owner", error);
    }
  }

  async editHostle(
    id: string,
    photos: Express.Multer.File[],
    formdata: { [key: string]: unknown }
  ) {
    try {
        const uploadedStrings: string[] = formdata.existingPhotos as string[];
        console.log('photos from front',photos);
        
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
            uploadedStrings.push(imageUrl);
          }
        }
      }
        formdata.photos = uploadedStrings;
        
        const { rates, ...hostelData } = formdata;
        
        if (rates && typeof rates === 'object') {
            hostelData.rates = Object.entries(rates).map(([type, price]) => ({
                type,
                price,
              }));
        }
        
        if (typeof hostelData.nearByPlaces === 'string') {
            hostelData.nearbyPlaces=hostelData.nearByPlaces
      }
       const editedHostel = await this.hostelRepository.update(id, hostelData);

      if (editedHostel) {
        return {
          success: "true",
          message: "Hostel Updated SuccessFully",
        };
      } 
    } catch (error) {
      console.error("Error from the HostelService.EditHostel", error);
    }
  }
}   
   