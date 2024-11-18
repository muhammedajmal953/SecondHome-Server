import Razorpay from "razorpay";
import { IOrder } from "../interfaces/IOrders";
import { IResponse } from "../interfaces/IResponse";
import { IBookingService } from "../interfaces/IServices";
import { BookingRepository } from "../repositories/bookingRepository";
import { HostelRepository } from "../repositories/hostelRepository";
import { verifyToken } from "../utils/jwt";
import { Wallet } from "../models/walletModel";
import User from "../models/userModel";
import { sendNotification } from "../utils/pushNotification";
import { UserDoc } from "../interfaces/IUser";

export class BookingService implements IBookingService {
  constructor(
    private _bookingRepository: BookingRepository,
    private _hostelRepository: HostelRepository
  ) {}

  async createOrder(
    orderData: Record<string, unknown>,
    token: string
  ): Promise<IResponse> {
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

      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      //cheking booking is expired or alreay booking is pending or not
      const previousBooking = await this._bookingRepository.findAll(
        { userId: id._id },
        0,
        {},
        0
      );

      if (previousBooking && previousBooking.length > 0) {
        // Check if any booking matches the conditions
        const alreadyBooked = previousBooking.some((booking) => {
          return (
            (booking.hostelId === orderData.hostelId ||
              booking.checkInDate >= new Date()) &&
            booking.isCancelled === false
          );
        });

        if (alreadyBooked) {
          return {
            success: false,
            message: "You have already booked a hostel",
          };
        }
      }

      const instance = new Razorpay({
        key_id: process.env.RazorPay_id!,
        key_secret: process.env.RazorPay_secret,
      });

      const options = {
        amount: orderData.amount as number,
        currency: orderData.currency as string,
        receipt: orderData.receipt as string,
      };

      const order = await instance.orders.create(options);
      if (!order) {
        return {
          success: false,
          message: "Unauthorised Razor pay",
        };
      }

      return {
        success: true,
        message: "message",
        data: order,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Razorpay Error:", {
        statusCode: error.statusCode,
        error: error.error,
        stack: error.stack,
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
          message: "booking data must be added",
        };
      }

      //cheking booking is expired or alreay booking is pending or not
      const previousBooking = await this._bookingRepository.findAll(
        { userId: orderData.userId },
        0,
        {},
        0
      );

      if (previousBooking && previousBooking.length > 0) {
        // Check if any booking matches the conditions
        const alreadyBooked = previousBooking.some((booking) => {
          return (
            (booking.hostelId === orderData.hostelId ||
              booking.checkInDate >= new Date()) &&
            booking.isCancelled === false
          );
        });

        if (alreadyBooked) {
          const userWallet = await Wallet.findOne({ userId: orderData.userId });
          if (!userWallet) {
            await Wallet.create({
              userId: orderData.userId,
              WalletBalance: orderData.totalAmount,
              transaction: [
                {
                  type: "credit",
                  description: `hostel puchase failed`,
                  from: orderData.vendorId,
                  amount: orderData.totalAmount,
                },
              ],
            });
          } else {
            userWallet.WalletBalance += orderData.totalAmount;
            userWallet.transaction.push({
              type: "credit",
              description: `hostel puchase failed`,
              from: orderData.userId,
              amount: orderData.totalAmount,
            });
            await userWallet.save();
          }

          return {
            success: false,
            message: "You have already booked a hostel",
          };
        }
      }

      console.log('data from the order',orderData);
      

      const hostelItem = {
        _id: orderData.hostelId,
        "rates.type": orderData.bedType,
        "rates.quantity": { $gt: orderData.numberOfGuests },
      };

      const updation = {
        $inc: { "rates.$.quantity": -orderData.numberOfGuests },
      };

      const updateHostel = await this._hostelRepository.updateHostel(
        hostelItem,
        updation
      );

      if (!updateHostel) {
        return {
          success: false,
          message: "failed to reduce hostel booking",
        };
      }

      const savebooking = await this._bookingRepository.create(orderData);

      const vendorWallet = await Wallet.findOne({ userId: orderData.vendorId });

      if (!vendorWallet) {
        await Wallet.create({
          userId: orderData.vendorId,
          WalletBalance: orderData.totalAmount,
          transaction: [
            {
              type: "credit",
              description: `hostel puchased `,
              from: orderData.userId,
              amount: orderData.totalAmount,
            },
          ],
        });
      } else {
        vendorWallet.WalletBalance += orderData.totalAmount;
        vendorWallet.transaction.push({
          type: "credit",
          description: `hostel puchased `,
          from: orderData.userId,
          amount: orderData.totalAmount,
        });
        await vendorWallet.save();
      }


      //send user booked the hostel
      const vendor: UserDoc | null = await User.findById(orderData.vendorId)
      const user: UserDoc | null = await User.findById(orderData.userId)
      
      
      const title = 'New booking placed'
      const body = `${user?.First_name} have booked your hostel`
      const pic=user?.Avatar
      sendNotification(vendor?.fcmToken as string,title,body,pic as string)

      return {
        success: true,
        message: "Save booking successfull",
        data: savebooking,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "save booking failed",
      };
    }
  }

  async getAllBookings(page: number, token: string) {
    try {
      const skip: number = Math.abs(page - 1) * 5;

      const payload = verifyToken(token);

      const id = JSON.parse(JSON.stringify(payload)).payload;

      const bookings = await this._bookingRepository.getAllBookingsWithHostels(
        { userId: id._id },
        skip
      );
      return {
        success: true,
        message: "Bookings Available",
        data: bookings,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Faled to fetch bookings",
      };
    }
  }

  async cancelBooking(reason: string, id: string) {
    try {
      

      const filter = { $set: { cancelReason: reason, isCancelled: true } };

      const cancelling = await this._bookingRepository.update(id, filter);
      const vendor: UserDoc | null = await User.findById(cancelling?.vendorId)
      const user: UserDoc | null = await User.findById(cancelling?.userId)
      
 
      const title = 'Cancell booking request'
      const body = `${user?.First_name} send a cancel request`
      const pic=user?.Avatar
      sendNotification(vendor?.fcmToken as string,title,body,pic as string)

      if (cancelling) {
      
        return {
          success: true,
          message: "cancelling offer Pending",
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getBookingWithHostel(id: string) {
    try {
      const booking = await this._bookingRepository.getOrderWithAllDetails(id)
      
      if (!booking) {
        return {
          success: false,
          meessage:'booking not found'
        }
      }

      console.log('booking details id',booking);
      
      return {
        success: true,
        message: 'booking fetched successfully',
        data:booking
      }
    } catch (error) {
      console.log('Error from getbookingwith hostel',error);
      return {
        success: false,
        message:'booking fetching faliled'
      }
    }
  }
}
