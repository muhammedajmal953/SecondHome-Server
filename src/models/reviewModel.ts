import mongoose, { Schema } from "mongoose";
import { IReviews } from "../interfaces/IReviews";

const reviewModel = new Schema<IReviews>({
    hostelId: String,
    reviews: [{
        userId: String,
        review: String,
        createdAt: {
            type: Date,
           default:new Date()
        },
        rate:String
    }]
})

export const Reviews=mongoose.model<IReviews>('Reviews',reviewModel)