import Razorpay from "razorpay";
import { IOrder } from "../interfaces/IOrders";
import { IResponse } from "../interfaces/IResponse";
import { IBookingService } from "../interfaces/IServices";
import { BookingRepository } from "../repositories/bookingRepository";
import { HostelRepository } from "../repositories/hostelRepository";
import { log } from "util";

export class BookingService implements IBookingService {
  constructor(
    private _bookingRepository: BookingRepository,
    private _hostelRepository: HostelRepository
  ) {}

  async createOrder(orderData: Record<string, unknown>): Promise<IResponse> {
    try {
      const hostel = await this._hostelRepository.findById(
        orderData.hostelId as string
      );

      if (hostel?.isActive === false) {
        return {
          success: false,
          message: "Hostel not Available",
        };
      }
      const bedCount = orderData.bedCount as number;

      hostel?.rates.forEach((item) => {
        if (item.type === orderData.bedType) {
          if (item.quantity < bedCount) {
            return {
              success: false,
              message: "Bed Quantity not available",
            };
          }
        }
      });
        
        
        const instance = new Razorpay({
            key_id: process.env.RazorPay_id!,
            key_secret: process.env.RazorPay_secret
        }) 
      
      console.log('secret razor pay',process.env.RazorPay_secret);
      

        const options = {
          amount: orderData.amount as number,
          currency: orderData.currency as string,
          receipt: orderData.receipt as string
        }

        
      const order = await instance.orders.create(options)
      console.log(order);
      
      return {
        success: true,
        message: "message",
        data:order
      };  
    } catch (error:any) {
      console.error('Razorpay Error:', {
        statusCode: error.statusCode,
        error: error.error,
        stack: error.stack
    });
      return {
        success: false,
        message: "message",
      };
    }
  }
  async saveBooking(orderData: IOrder): Promise<IResponse> {
    throw new Error("Method not implemented.");
  }
}
