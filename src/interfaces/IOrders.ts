
import { Document } from "mongoose"

export interface IOrder extends Document{
    hostelId: string,
    userId: string,
    bookedAt: Date,
    checkInDate:Date,
    bedType: string,
    foodRatePerGuest: number,
    numberOfGuests: number,
    totalAmount: number,
    advancePerGuest: number
    isActive: boolean
    isCancelled: boolean
    cancelReason:string
    paymentDetails: {
        razorpay_payment_id: string,
        razprpay_order_id: string,
        razorpay_signature:string
    }
}