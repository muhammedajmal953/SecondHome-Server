import mongoose from "mongoose";
import { IOrder } from "../interfaces/IOrders";
import { ObjectId } from "mongodb";

const { Schema } = mongoose

const bookingModel = new Schema<IOrder>({
    hostelId: ObjectId,
    userId: ObjectId,
    bedType: String,
    bookedAt: {
        type: Date,
        default:new Date()
    },
    foodRatePerQuest: Number,
    numberOfQuests: Number,
    totalAmount: Number,
    advancePerQuest: Number,
    paymentDetails: {
        razorpay_payment_id: String,
        razprpay_order_id: String,
        razorpay_signature:String
    }
})

export const Booking=mongoose.model<IOrder>('Booking',bookingModel)