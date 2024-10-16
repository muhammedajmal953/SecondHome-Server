import { IHostel } from "../interfaces/IHostel";
import Hostel from "../models/hostelModel";

export class HostelRepository {
    async addHostel(hostel:any,parsedRate:any): Promise<IHostel> {

      const newHostel = new Hostel(hostel);
      newHostel.rates=[]
      for (let { type, price } of parsedRate) {
          newHostel.rates.push({
              type: type,
              price:price
          })
        }
        newHostel.address = {
            city: hostel.city,
            street: hostel.street,
            district: hostel.district,
            state: hostel.state,
            pincode:hostel.pincode
        }

        newHostel.nearbyPlaces=hostel.nearByPlaces
      
    return newHostel.save();
    }
    
    async getHostelById(id: string): Promise<IHostel | null> {
        return Hostel.findById(id);
    }

    async getHostelByName(name: string): Promise<IHostel | null> {
        return Hostel.findOne({ name });
    }

    async getHostels(): Promise<IHostel[]> {
        return await Hostel.find().sort({ createdAt: -1 }).exec();
    }
}
  