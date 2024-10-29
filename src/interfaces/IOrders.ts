
import { Document } from "mongoose"

export interface IOrder extends Document{
    hostelId: string,
    userId: string,
    bookedAt: Date,
    bedType: string,
    foodRatePerQuest: number,
    numberOfQuests: number,
    totalAmount: number,
    advancePerQuest: number
    paymentDetails: {
        razorpay_payment_id: string,
        razprpay_order_id: string,
        razorpay_signature:string
    }
}