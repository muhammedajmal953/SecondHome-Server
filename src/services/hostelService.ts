import { IHostelService } from "../interfaces/IHostel";
import { IResponse } from "../interfaces/IResponse";
import { HostelRepository } from "../repositories/hostelRepository";
import { verifyToken } from "../utils/jwt";
import { uploadToS3 } from "../utils/s3Bucket";

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

  async getAllHostel(page: number, searchQuery: string): Promise<IResponse> {
    try {
      const skip = (page - 1) * 5;

      const filter: { [key: string]: unknown } = {};

      if (searchQuery) {
        filter["$or"] = [
          { name: { $regex: searchQuery, $options: "i" } },
          { category: { $regex: searchQuery, $options: "i" } },
        ];
      }

      filter.isActive = true;
      const hostels = await this._hostelRepository.findAll(filter, skip);
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
      const uploadedStrings: string[] = formdata.existingPhotos as string[];
      console.log("photos from front", photos);

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

      if (rates && typeof rates === "object") {
        hostelData.rates = Object.entries(rates).map(([type, price]) => ({
          type,
          price,
        }));
      }

      if (typeof hostelData.nearByPlaces === "string") {
        hostelData.nearbyPlaces = hostelData.nearByPlaces;
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
