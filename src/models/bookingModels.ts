import mongoose from "mongoose";
import { IOrder } from "../interfaces/IOrders";
import { ObjectId } from "mongodb";

const { Schema } = mongoose

const bookingModel = new Schema<IOrder>({
    hostelId: ObjectId,
    userId: ObjectId,
    bedType: String,
    checkInDate: Date,
    vendorId:String,
    isActive: {
        type: Boolean,
        default:true
    },
    isCancelled: {
        type: Boolean,
        default:false
    },
    bookedAt: {
        type: Date,
        default:new Date()
    },
    foodRatePerGuest: Number,
    numberOfGuests: Number,
    totalAmount: Number,
    advancePerGuest: Number,
    cancelReason:String,
    paymentDetails: {
        razorpay_payment_id: String,
        razorpay_order_id: String,
        razorpay_signature:String
    }
})

export const Booking = mongoose.model<IOrder>('Booking', bookingModel)

