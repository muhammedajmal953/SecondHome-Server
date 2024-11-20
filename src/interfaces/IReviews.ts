import { Document } from "mongoose";


export interface IReviews extends Document{
    hostelId: string
    reviews: {
        review: string,
        rating: number,
        userId: string,
        createdAt:Date
    }[]
}