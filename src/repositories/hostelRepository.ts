import mongoose from "mongoose";
import { IHostel } from "../interfaces/IHostel";
import Hostel from "../models/hostelModel";
import { BaseRepository } from "./baseRepository";
import { IHostelRepository } from "../interfaces/IRepositories";

export class HostelRepository
  extends BaseRepository<IHostel>
  implements IHostelRepository
{
  constructor() {
    super(Hostel);
  }

  async findHostelWIthOwner(id: string): Promise<IHostel | null> {
    try {
      const result = await Hostel.aggregate([
        {
          $match: { _id: new mongoose.Types.ObjectId(id) },
        },
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
          },
        },
        {
          $unwind: "$owner",
        },
      ]);

      return result[0];
    } catch (error) {
      console.error("Error fetching record by ID:", error);
      throw new Error("Could not fetch record by ID");
    }
  }

  async updateHostel(
    filter: Record<string, unknown>,
    item: Record<string, unknown>
  ): Promise<boolean | null> {
    try {
      return Hostel.findOneAndUpdate(filter, item);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async getallHostel() {
    try {
      return Hostel.find()
    } catch (error) {
      console.log(error);
      
    }
  }
}
