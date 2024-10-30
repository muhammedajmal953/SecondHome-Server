import mongoose from "mongoose";
import { IOrder } from "../interfaces/IOrders";
import { IBookingRepository } from "../interfaces/IRepositories";
import { Booking } from "../models/bookingModels";
import { BaseRepository } from "./baseRepository";

export class BookingRepository
  extends BaseRepository<IOrder>
  implements IBookingRepository
{
  constructor() {
    super(Booking);
  }

  async getOrderWithAllDetails(id: string): Promise<IOrder | null> {
    console.log(id);
    return null;
  }

  async getAllBookingsWithHostels(
    filter: Record<string, unknown>,
    skip: number
  ) {
    
    try {
      return Booking.aggregate([
        { $match: {userId:new mongoose.Types.ObjectId(filter.userId as string)} }, 
        {
            $lookup: {
                from: 'hostels',
                localField: 'hostelId',
                foreignField: '_id',
                as: 'hostelDetails'
            }
        },
        { $sort: { bookedAt: -1 } },
        { $skip: skip },     
        { $limit: 5 }       
    ]).exec();
    } catch (error) {
        console.log(error)
    }
  }
}
