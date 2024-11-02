import Razorpay from "razorpay";
import { IOrder } from "../interfaces/IOrders";
import { IResponse } from "../interfaces/IResponse";
import { IBookingService } from "../interfaces/IServices";
import { BookingRepository } from "../repositories/bookingRepository";
import { HostelRepository } from "../repositories/hostelRepository";
import { verifyToken } from "../utils/jwt";


export class BookingService implements IBookingService {
  constructor(
    private _bookingRepository: BookingRepository,
    private _hostelRepository: HostelRepository
  ) { }

  
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
      
      const options = {
        amount: orderData.amount as number,
        currency: orderData.currency as string,
        receipt: orderData.receipt as string
      }

        
      const order = await instance.orders.create(options)
      if (!order) {
        return {
          success: false,
          message: 'Unauthorised Razor pay'
        }
      }
      
      return {
        success: true,
        message: "message",
        data: order
      };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Razorpay Error:', {
        statusCode: error.statusCode,
        error: error.error,
        stack: error.stack
      });
      return {
        success: false,
        message: "Razor pay failed",
      };
    }
  }
  async saveBooking(orderData: IOrder): Promise<IResponse> {
    try {
      
      if (!orderData) {
        return {
          success: false,
          message: 'booking data must be added'
        }
      }
        console.log('orderData',orderData);
        
          
      const hostelItem = {
        _id: orderData.hostelId,
        "rates.type": orderData.bedType,
        "rates.quantity": { $gt: orderData.numberOfGuests }
      }

      const updation = { $inc: { "rates.$.quantity": -(orderData.numberOfGuests) } }

      const updateHostel = await this._hostelRepository.updateHostel(hostelItem, updation)

      if (!updateHostel) {
        return {
          success: false,
          message: 'faliled save booking'
        }
      }
      
      const savebooking = await this._bookingRepository.create(orderData)
      
      return {
        success: true,
        message: 'Save booking successfull',
        data: savebooking
      }
      
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: 'save booking failed'
      }
    }
  }


  async getAllBookings(page: number, token:string) {
    try {
      const skip: number = (Math.abs(page - 1)) * 5

      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      const bookings = await this._bookingRepository.getAllBookingsWithHostels({ userId:id._id }, skip)

      console.log('id from the get all bookings',bookings);
      
      return {
        success: true,
        message: 'Bookings Available',
        data:bookings
      }

    } catch (error) {
      console.log(error)
      return {
        success: false,
        message:'Faled to fetch bookings'
      }
    }
  
  }

  async cancelBooking(reason:string,id:string){
    try {
      console.log('Reason',reason);
      
      const filter = {$set:
        {cancelReason: reason,
        isCancelled:true}
      }

      const cancelling = await this._bookingRepository.update(id, filter)

      
      
      if (cancelling) {
        return {
          success: true,
          message:'cancelling offer Pending'
        }
      }
    } catch (error) {
      console.log(error);
      
    }
  }
}


