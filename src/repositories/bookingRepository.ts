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


  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getOrderWithAllDetails(id: string): Promise<any> {
    
    return await Booking.aggregate(
      [
        { $match: { _id:new mongoose.Types.ObjectId(id) } },
        {
          $lookup: {
            from: "hostels",
            localField: "hostelId",
            foreignField: "_id",
            as: "hostelDetails",
          }  
        }, 
          { $unwind: "$hostelDetails" }
        
      ]
    )
    
    
  }

  async getAllBookingsWithHostels(
    filter: Record<string, unknown>,
    skip: number
  ) {
    try {
      if (filter.userId) {
        return Booking.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(filter.userId as string),
            },
          },
          {
            $lookup: {
              from: "hostels",
              localField: "hostelId",
              foreignField: "_id",
              as: "hostelDetails",
            },
          },
          { $sort: { bookedAt: -1 } },
          { $skip: skip },
          { $limit: 5 },
        ]).exec();
      }
     
      return Booking.aggregate([
        { $match: { vendorId: filter.vendorId } },
        {
          $lookup: {
            from: "hostels",
            localField: "hostelId",
            foreignField: "_id",
            as: "hostelDetails",
          },
        },
        { $sort: { bookedAt: -1 } },
        { $skip: skip },
        { $limit: 10 },
      ]).exec();
    } catch (error) {
      console.log(error);
    }
  }

  async BookingsWithAllDetails(skip: number) {
    try {
      return Booking.aggregate([
        {
          $lookup: {
            from: "hostels",
            localField: "hostelId",
            foreignField: "_id",
            as: "hostelDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "vendorId",
            foreignField: "_id",
            as: "vendorDetails",
          },
        },
        {
          $project: {
            "hostelDetails.name": 1,
            "hostelDetails.address": 1,
            "userDetails.First_name": 1,
            "vendorDetails.First_name": 1,
            bedType: 1,
            numberOfGuests: 1,
            isActive: 1,
            isCancelled: 1,
            bookedAt:1
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: 10,
        },
      ]).exec();
    } catch (error) {
      console.log(error);
    }
  }


}
 